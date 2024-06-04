using WebChamadosAPI.DTOs;
using WebChamadosAPI.Models;
using static WebChamadosAPI.Services.ServiceResponses;

namespace WebChamadosAPI.Interfaces
{
    public interface IChamadoService
    {


        Task<IEnumerable<RetornaChamado>> RetornaTodosChamados();

        Task<IEnumerable<RetornaChamado>> RetornaChamadosPorEmailSolicitante(string email);

        Task<IEnumerable<RetornaChamado>> RetornaChamadosPorEmailResponsavel(string email);

        Task<RetornaChamado> RetornaChamadoPorId(int id);

        Task<GeneralResponse> AbrirChamado(Chamado chamado);

        Task<GeneralResponse> EditarChamado(Chamado chamado);

        Task<GeneralResponse> ExcluirChamado(int id);










    }
}
