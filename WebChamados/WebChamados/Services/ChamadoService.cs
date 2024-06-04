using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;
using WebChamadosAPI.Context;
using WebChamadosAPI.DTOs;
using WebChamadosAPI.Enums;
using WebChamadosAPI.Interfaces;
using WebChamadosAPI.Models;
using static WebChamadosAPI.Services.ServiceResponses;

namespace WebChamadosAPI.Services
{
    public class ChamadoService : IChamadoService
    {
        private readonly DataContext _dataContext;

        public ChamadoService(DataContext dataContext)
        {
            _dataContext = dataContext;          
        }

        public async Task<GeneralResponse> AbrirChamado(Chamado chamado)
        {
            _dataContext.Chamados.Add(chamado);
            await _dataContext.SaveChangesAsync();

            int chamadoId = chamado.Id;

            //return new GeneralResponse(true,"Chamado aberto com sucesso");
            return new GeneralResponse(true, $"Chamado aberto com sucesso. ID: {chamadoId}");

        }

        public async Task<GeneralResponse> EditarChamado(Chamado chamado)
        {

            Chamado chamadoDb = await _dataContext.Chamados.FindAsync(chamado.Id);

            if (chamadoDb == null)
                return new GeneralResponse(false, "Chamado não encontrado");

            if (!VerificarStatus(chamado.Status))
                return new GeneralResponse(false, "Status inconsistente");

            if(chamado.Status == StatusChamadoConst.Resolvido || 
                chamado.Status == StatusChamadoConst.Cancelado || 
                chamado.Status == StatusChamadoConst.BackLog)
                chamadoDb.DtFechamento = DateTime.Now;


            chamadoDb.Titulo = chamado.Titulo;
            chamadoDb.Descricao = chamado.Descricao;
            chamadoDb.Status = chamado.Status;

            GeneralResponse resp = await VerificaResponsavel(chamado.Responsavel);

            if (!resp.Flag)
                return new GeneralResponse(false, resp.Message);


            chamadoDb.Responsavel = chamado.Responsavel;

            
            _dataContext.Chamados.Update(chamadoDb);
            await _dataContext.SaveChangesAsync();


            return new GeneralResponse(true, "Chamado alterado com sucesso");

        }




        public async Task<GeneralResponse> ExcluirChamado(int chamadoId)
        {

            var chamado = await _dataContext.Chamados.FindAsync(chamadoId);

            if (chamado == null)
            {
                return new GeneralResponse(false, "Chamado não encontrado.");
            }

            _dataContext.Chamados.Remove(chamado);
            await _dataContext.SaveChangesAsync();

            return new GeneralResponse(true, "Chamado excluído.");
        }

        public async  Task<RetornaChamado> RetornaChamadoPorId(int id)
        {

            var chamadoComInfoUsuario = from chamado in _dataContext.Chamados
                                         join solicitante in _dataContext.Users on chamado.Solicitante equals solicitante into solicitantes
                                        from solicitante in solicitantes.DefaultIfEmpty()
                                        join responsavel in _dataContext.Users on chamado.Responsavel equals responsavel.Email into responsaveis
                                        from responsavel in responsaveis.Where(r => chamado.Responsavel != null).DefaultIfEmpty()
                                        where chamado.Id == id
                                         select new RetornaChamado
                                         {
                                             Id = chamado.Id,
                                             Titulo = chamado.Titulo,
                                             Descricao = chamado.Descricao,
                                             Status = chamado.Status,
                                             Responsavel = chamado.Responsavel,
                                             DtAbertura = chamado.DtAbertura,
                                             DtFechamento = chamado.DtFechamento,
                                             EmailSolicitante = solicitante.Email,
                                             NomeSolicitante = solicitante.Nome,
                                             SobrenomeSolicitante = solicitante.Sobrenome,
                                             NomeResponsavel = responsavel.Nome,
                                             SobrenomeResponsavel = responsavel.Sobrenome
                                         };                     
               


            var result = await chamadoComInfoUsuario.FirstOrDefaultAsync();

            return result;


        }

        public async Task<IEnumerable<RetornaChamado>> RetornaChamadosPorEmailResponsavel(string email)
        {

            var chamadosComInfoUsuario = from chamado in _dataContext.Chamados
                                         join solicitante in _dataContext.Users on chamado.Solicitante equals solicitante into solicitantes
                                         from solicitante in solicitantes.DefaultIfEmpty()
                                         join responsavel in _dataContext.Users on chamado.Responsavel equals responsavel.Email into responsaveis
                                         from responsavel in responsaveis.Where(r => chamado.Responsavel != null).DefaultIfEmpty()
                                         where chamado.Responsavel == email
                                         select new RetornaChamado
                                         {
                                             Id = chamado.Id,
                                             Titulo = chamado.Titulo,
                                             Descricao = chamado.Descricao,
                                             Status = chamado.Status,
                                             Responsavel = chamado.Responsavel,
                                             DtAbertura = chamado.DtAbertura,
                                             DtFechamento = chamado.DtFechamento,
                                             EmailSolicitante = solicitante.Email,
                                             NomeSolicitante = solicitante.Nome,
                                             SobrenomeSolicitante = solicitante.Sobrenome,
                                             NomeResponsavel = responsavel.Nome,
                                             SobrenomeResponsavel = responsavel.Sobrenome
                                         };

            return await chamadosComInfoUsuario.ToListAsync();

        }

        public async Task<IEnumerable<RetornaChamado>> RetornaChamadosPorEmailSolicitante(string email)
        {
            var usuario = await _dataContext.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (usuario != null)
            {
                var chamadosComInfoUsuario = from chamado in _dataContext.Chamados
                                             join solicitante in _dataContext.Users on chamado.Solicitante equals usuario into solicitantes
                                             from solicitante in solicitantes.DefaultIfEmpty()
                                             join responsavel in _dataContext.Users on chamado.Responsavel equals responsavel.Email into responsaveis
                                             from responsavel in responsaveis.Where(r => chamado.Responsavel != null).DefaultIfEmpty()
                                             where solicitante.Email == email
                                             select new RetornaChamado
                                             {
                                                 Id = chamado.Id,
                                                 Titulo = chamado.Titulo,
                                                 Descricao = chamado.Descricao,
                                                 Status = chamado.Status,
                                                 Responsavel = chamado.Responsavel,
                                                 DtAbertura = chamado.DtAbertura,
                                                 DtFechamento = chamado.DtFechamento,
                                                 EmailSolicitante = usuario.Email,
                                                 NomeSolicitante = usuario.Nome,
                                                 SobrenomeSolicitante = usuario.Sobrenome,
                                                 NomeResponsavel = responsavel.Nome,
                                                 SobrenomeResponsavel = responsavel.Sobrenome
                                             };

                return await chamadosComInfoUsuario.ToListAsync();

            }
            else
            {
                return new List<RetornaChamado>();
            }

        }

        public async Task<IEnumerable<RetornaChamado>> RetornaTodosChamados()
        {           
       
            var chamadosComInfoUsuario = from chamado in _dataContext.Chamados
                                         join solicitante in _dataContext.Users on chamado.Solicitante equals solicitante  into solicitantes
                                         from solicitante in solicitantes.DefaultIfEmpty()
                                         join responsavel in _dataContext.Users on chamado.Responsavel equals responsavel.Email into responsaveis
                                         from responsavel in responsaveis.Where(r => chamado.Responsavel !=null).DefaultIfEmpty()
                                         select new RetornaChamado
                                         {
                                             Id = chamado.Id,
                                             Titulo = chamado.Titulo,
                                             Descricao = chamado.Descricao,
                                             Status = chamado.Status,
                                             Responsavel = chamado.Responsavel,
                                             DtAbertura = chamado.DtAbertura,
                                             DtFechamento = chamado.DtFechamento,
                                             EmailSolicitante = solicitante.Email,
                                             NomeSolicitante = solicitante.Nome,
                                             SobrenomeSolicitante = solicitante.Sobrenome,
                                             NomeResponsavel = responsavel.Nome,
                                             SobrenomeResponsavel = responsavel.Sobrenome
                                         };

            return await chamadosComInfoUsuario.ToListAsync();


            
        }


        private bool VerificarStatus(string status)
        {
            if(status == null)
                return false;

            var result = typeof(StatusChamadoConst).GetFields().Any(f => f.GetValue(null).Equals(status));

            if (!result)
                return false;

            return true;
        }

        private async Task<GeneralResponse> VerificaResponsavel(string email)
        {
            var usuario = await _dataContext.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (usuario == null)
                return new GeneralResponse(false, "Responsável inconsistente");

            if (usuario.Perfil != EnumPerfil.Dev && usuario.Perfil != EnumPerfil.Admin )
                return new GeneralResponse(false, "Este responsável não tem o perfil necessário para assumir o chamado.");


            return new GeneralResponse(true, "Responsável validado");
        }



    }
}
