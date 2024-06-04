using Azure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebChamadosAPI.Interfaces;
using WebChamadosAPI.Models;
using WebChamadosAPI.DTOs;
using WebChamadosAPI.Services;

namespace WebChamadosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {


        private IUsuarioService _usuarioService;
        private IChamadoService _chamadoService;


        public UsuarioController(IUsuarioService usuarioService , IChamadoService chamadoService)
        {
            _usuarioService = usuarioService;
            _chamadoService = chamadoService;
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login(Login loginDTO)
        {

            if (!ModelState.IsValid) return BadRequest("Informações inválidas.");



            var response = await _usuarioService.Login(loginDTO);

            return Ok(response);
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("Registrar")]
        public async Task<ActionResult> Registrar(RegisterModel usuario)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }


            Usuario user = new Usuario
            {
                Nome = usuario.Nome,
                Sobrenome = usuario.Sobrenome,
                Perfil = usuario.Perfil,
                Email = usuario.Email,
                UserName = usuario.Email,
            };


            IdentityResult result = await _usuarioService.Registrar(user, usuario.Password);

            if (result.Succeeded)
            {
                return Ok(usuario);
            }

            return BadRequest(result);

        }

        [Authorize(Roles = "Admin")]
        [HttpGet("RetornarUsuarios")]
        public async Task<ActionResult<IAsyncEnumerable<RegisterModel>>> GetUsuarios()
        {

            IEnumerable<Usuario> usuarios = await _usuarioService.GetUsuarios();
            IEnumerable<RegisterModel> usuariosViewModel = usuarios.Select(usuario => new RegisterModel
            {
                Nome = usuario.Nome,
                Sobrenome = usuario.Sobrenome,
                Perfil = usuario.Perfil,
                Email = usuario.Email,
                Password = usuario.PasswordHash

            });

            return Ok(usuariosViewModel);

        }

        [Authorize(Roles = "Admin , Dev, Padrao")]
        [HttpGet("RetornaUserPorEmail")]
        public async Task<ActionResult<Usuario>> GetUsuarioPorEmail([FromQuery] string email)
        {

            Usuario usuario = await _usuarioService.GetUsuarioByEmail(email);

            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            return Ok(usuario);

        }

        [Authorize(Roles = "Admin")]
        [HttpPut("AlterarUsuario")]
        public async Task<ActionResult> Alterar(string email, [FromBody] AlterarModel usuario)
        {
            if (usuario.Email.Trim().ToLower() == email.Trim().ToLower())
            {
                await _usuarioService.Alterar(usuario);
                return Ok($"{email} alterado com sucesso!");

            }
            else
            {
                return BadRequest("Dados inconsistentes.");
            }

        }

       
        [AllowAnonymous]
        [HttpPost("EsqueciSenhaEnviarLink")]
        public async Task<IActionResult> EsqueciSenha([FromQuery] string email)
        {

            Usuario usuario = await _usuarioService.GetUsuarioByEmail(email);

            if (usuario == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            await _usuarioService.EsqueciSenhaEnviarLink(email);


            return Ok(usuario);

        }

        [AllowAnonymous]
        [HttpPost("ResetSenha")]
        public async Task<IActionResult> ResetaSenha(ResetSenhaModel model)
        {

            if (ModelState.IsValid)
            {
                var result = await _usuarioService.ResetSenha(model);

                if (result)
                {
                    return Ok("Senha alterada com sucesso!");
                }

                return BadRequest("Erro ao alterar a senha.");
            }

            return BadRequest("Alguma propriedade está inválida. Tente novamente.");

        }

        [Authorize(Roles = "Admin , Dev, Padrao")]
        [HttpPost("AtualizaNovaSenha")]
        public async Task<IActionResult> AtualizaNovaSenha(NovaSenhaModel model)
        {

            if (ModelState.IsValid)
            {

                if (!model.NovaSenha.Equals(model.ConfirmaSenha))
                {
                    return BadRequest("A senha de confirmação é diferente da nova senha. Tente novamente");
                }

                Usuario usuario = await _usuarioService.GetUsuarioByEmail(model.Email);

                if (usuario == null)
                {
                    return NotFound($"Não foi possível encontrar '{model.Email}'. Tente novamente.");
                }

                var changePasswordResult = await _usuarioService.AtualizarNovaSenha(usuario, model);

                if (!changePasswordResult.Succeeded)
                {
                    var firstError = changePasswordResult.Errors.FirstOrDefault();
                    if (firstError != null)
                    {
                        return BadRequest(firstError.Description);
                    }

                    return BadRequest();
                }

                return Ok("Senha atualizada!");

            }

            return BadRequest("Alguma propriedade está inválida. Tente novamente.");

        }
           
        [Authorize]
        [HttpPost("Refresh")]
        public async Task<IActionResult> Refresh()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;            
            
            var usuarioID = identity?.FindFirst(ClaimTypes.Email)?.Value;

            if (usuarioID == null)
                return BadRequest();

            var resultado = await _usuarioService.LoginSemSenha(usuarioID);
            if (resultado != null)
                return Ok(resultado);

            return Unauthorized();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("ExcluirUsuario")]
        public async Task<ActionResult> Excluir(string email)
        {
            Usuario usuario = await _usuarioService.GetUsuarioByEmail(email.Trim());

            if (usuario != null)
            {
                

                IEnumerable<RetornaChamado> chamadosResponsavel = await _chamadoService.RetornaChamadosPorEmailResponsavel(email);

                if (chamadosResponsavel == null || !chamadosResponsavel.Any())
                {

                    IEnumerable<RetornaChamado> chamadosSolicitante = await _chamadoService.RetornaChamadosPorEmailSolicitante(email);

                    if (chamadosSolicitante == null || !chamadosSolicitante.Any())
                    {
                        await _usuarioService.Excluir(usuario);

                        return Ok($"{email} excluido com sucesso.");

                    }
                    else
                    {
                        return BadRequest($"Não foi possível excluir. {email} possui chamados vinculados como solicitante.");
                    }
                       
                }                    
                else
                {
                   return BadRequest($"Não foi possível excluir. {email} possui chamados vinculados como responsável.");
                }



               
            }
            else
            {
                return BadRequest($"Não foi possível excluir. {email} não encontrado.");
            }
        }
    }
}


    
