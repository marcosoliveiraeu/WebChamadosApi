using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using SharedClassLibrary.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebChamadosAPI.Context;
using WebChamadosAPI.Enums;
using WebChamadosAPI.Interfaces;
using WebChamadosAPI.Models;
using WebChamadosAPI.DTOs;
using static WebChamadosAPI.Services.ServiceResponses;

namespace WebChamadosAPI.Services
{
    public class UsuarioService : IUsuarioService
    {

        private readonly DataContext _dataContext;
        private readonly UserManager<Usuario> _userManager;
        private readonly IConfiguration _configuration;

        private readonly IEmailService _emailService;

        public UsuarioService(DataContext dataContext , UserManager<Usuario> userManager , IConfiguration configuration, IEmailService emailService)
        {
            _dataContext = dataContext;
            _userManager = userManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task Alterar(AlterarModel usuario)
        {
            var  user = await _userManager.FindByEmailAsync(usuario.Email);
            int flag = 0;
            string oldRole = "";

            if (usuario.Perfil != user.Perfil) 
            {
                flag = 1;
                oldRole = Enum.GetName(typeof(EnumPerfil), user.Perfil);
            };
            

            user.Email= usuario.Email;
            user.Nome= usuario.Nome;
            user.Sobrenome= usuario.Sobrenome;
            user.Perfil = usuario.Perfil;

            var result = await _userManager.UpdateAsync(user);
            
            if(result!=null)
            {
                if (flag == 1)
                {
                    string role = Enum.GetName(typeof(EnumPerfil), user.Perfil);

                    await _userManager.RemoveFromRoleAsync(user, oldRole);

                    await _userManager.AddToRoleAsync(user, role);

                }               
            }


        }

        public async Task EsqueciSenhaEnviarLink(string email)
        {

            //Envia um email para o usuario com um link para que uma senha nova seja criada

            var user = await _userManager.FindByEmailAsync(email);

            if (user != null)
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = Encoding.UTF8.GetBytes(token);
                var validToken = WebEncoders.Base64UrlEncode(encodedToken);

                string url = $"{_configuration["AppUrl"]}/ResetPassword?email={email}&token={validToken}";

                await _emailService.SendEmailAsync(email, "Reset de Senha", "<h1>NovaSenha</h1> " +
                    $"<p>Para criar uma nova senha <a href='{url}'>Clique aqui</a></p>" , true);

            }

        }

        public async Task Excluir(Usuario usuario)
        {

            _dataContext.Users.Remove(usuario);
            await _dataContext.SaveChangesAsync();

        }

        public async Task<Usuario> GetUsuarioByEmail(string email)
        {

            var user = await _userManager.FindByEmailAsync(email);

            return user;
        }

        public async Task<IEnumerable<Usuario>> GetUsuarios()
        {
            
            return await _dataContext.Users.ToListAsync();

        }

        public async Task<IdentityResult> Registrar(Usuario user , string senha)
        {

            IdentityResult result =  await _userManager.CreateAsync(user, senha);

            if (result != null)
            {
                string role = Enum.GetName(typeof(EnumPerfil), user.Perfil);

                await _userManager.AddToRoleAsync(user, role);
            }
         
            return result;
           
        }

        public async Task<bool> ResetSenha(ResetSenhaModel usuario)
        {
            // com o token que foi enviado por email , cria uma nova senha para o usuario

            var user = await _userManager.FindByEmailAsync(usuario.Email);

            if (user == null)
                 return false;

            if (usuario.NewPassword != usuario.ConfirmPassword)
                return false;

            var decodedToken = WebEncoders.Base64UrlDecode(usuario.Token);
            string normalToken = Encoding.UTF8.GetString(decodedToken);

            var result = await _userManager.ResetPasswordAsync(user, normalToken, usuario.NewPassword);

            if (result.Succeeded) 
            {  
                return true; 
            }            
            else
            {
                return false;
            }


        }

        public async Task<IdentityResult> AtualizarNovaSenha(Usuario usuario, NovaSenhaModel model)
        {

            // atualiza a senha do usuario , informando a senha antiga

            return await _userManager.ChangePasswordAsync(usuario, model.SenhaAtual, model.NovaSenha);

        }

        public async Task<LoginResponse> Login(Login loginDTO)
        {
            if (loginDTO == null)
                return new LoginResponse(false, null!, null!, "Informe os dados.");

            if(loginDTO.Password == null || loginDTO.Password == "")
                return new LoginResponse(false, null!, null!, "Informe o senha.");

            var getUser = await _userManager.FindByEmailAsync(loginDTO.Email);
            if (getUser is null)
                return new LoginResponse(false, null!, null!, "Usuário não encontrado.");

            bool checkUserPasswords = await _userManager.CheckPasswordAsync(getUser, loginDTO.Password);
            if (!checkUserPasswords)
                return new LoginResponse(false, null!, null!, "Email e/ou senha inválidos. Tente novamente.");



            return await GerarCredenciais(loginDTO.Email, refresh: false);
        }

        public async Task<LoginResponse> LoginSemSenha(string email)
        {
            var usuario = await _userManager.FindByEmailAsync(email);

            return await GerarCredenciais(usuario.Email, refresh:true);

        }

        public async Task<LoginResponse> GerarCredenciais(string email, bool refresh)
        {
            var user = await _userManager.FindByEmailAsync(email);

            var dataExpiracaoAccessToken = DateTime.Now.AddSeconds(double.Parse(_configuration["Jwt:AccessTokenExpiration"]));
            var dataExpiracaoRefreshToken = DateTime.Now.AddSeconds(double.Parse(_configuration["Jwt:RefreshTokenExpiration"]));

            var getUserRole = await _userManager.GetRolesAsync(user);

            var accessTokenClaims = new[]{
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Email,user.Email),
                new Claim(ClaimTypes.Role, getUserRole.First())
            };

            var refreshTokenClaims = new[]{
                
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Email,user.Email)
            };

            string accessToken = GenerateToken(accessTokenClaims, dataExpiracaoAccessToken);
            string refreshToken = GenerateToken(refreshTokenClaims, dataExpiracaoRefreshToken);


            return new LoginResponse(true, accessToken!, refreshToken!, refresh?"Refresh efetuado.":"Login efetuado.");

        }

        private string GenerateToken(IEnumerable<Claim> claims, DateTime dataExpiracao)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: dataExpiracao,
                signingCredentials: credentials
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<IList<Claim>> ObterClaims(Usuario user , bool adicionarClaimUsuario)
        {

            var claims = new List<Claim>();

            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, user.Id));
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
            claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));
            claims.Add(new Claim(JwtRegisteredClaimNames.Nbf, DateTime.Now.ToString()));



            if (adicionarClaimUsuario)
            {
                var userClaims = await _userManager.GetClaimsAsync(user);
                var roles = await _userManager.GetRolesAsync(user);

                claims.AddRange(userClaims);

                foreach (var role in roles)
                    claims.Add(new Claim("role", role));

            }

            return claims;

        }

    }
}
