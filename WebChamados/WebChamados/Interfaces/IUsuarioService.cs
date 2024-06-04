using Microsoft.AspNetCore.Identity;
using WebChamadosAPI.Models;
using static WebChamadosAPI.Services.ServiceResponses;
using WebChamadosAPI.DTOs;

namespace WebChamadosAPI.Interfaces
{
    public interface IUsuarioService

    {

        Task<IEnumerable<Usuario>> GetUsuarios();

        Task<Usuario> GetUsuarioByEmail(string email);

        Task<IdentityResult> Registrar(Usuario usuario, string senha);

        Task Alterar(AlterarModel usuario);

        Task Excluir(Usuario usuario);

        Task<bool> ResetSenha(ResetSenhaModel usuario);

        Task EsqueciSenhaEnviarLink(string email);

        Task<IdentityResult> AtualizarNovaSenha(Usuario usuario , NovaSenhaModel model);

        Task<LoginResponse> Login(Login loginDTO);

        Task<LoginResponse> LoginSemSenha(string email);

        Task<LoginResponse> GerarCredenciais(string email, bool refresh);

 
    }
}
