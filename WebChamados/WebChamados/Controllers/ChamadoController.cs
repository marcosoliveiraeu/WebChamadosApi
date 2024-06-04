using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebChamadosAPI.Context;
using WebChamadosAPI.DTOs;
using WebChamadosAPI.Interfaces;
using WebChamadosAPI.Models;
using WebChamadosAPI.Services;
using static WebChamadosAPI.Services.ServiceResponses;

namespace WebChamadosAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChamadoController : ControllerBase
    {

        private IChamadoService _chamadoService;
        private UserManager<Usuario> _userManager;

        public ChamadoController( IChamadoService chamadoService , UserManager<Usuario> userManager)
        {
            _chamadoService = chamadoService;            
            _userManager = userManager;
        }

        [Authorize(Roles = "Admin, Dev, Padrao")]
        [HttpGet("RetornaChamados")]
        public async Task<ActionResult> RetornaChamados()
        {

            IEnumerable<RetornaChamado> chamados = await _chamadoService.RetornaTodosChamados();

            return Ok(chamados);

        }


        [Authorize(Roles = "Admin, Dev, Padrao")]
        [HttpPost("AbrirChamado")]
        public async Task<ActionResult> AbrirChamado(AbrirChamado chamadoDto , string emailSolicitante)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(emailSolicitante);

            if (user == null)
            {
                return BadRequest("Não foi encontrado nenhum usuário para o solicitante " + emailSolicitante);
            }

            Chamado chamado = new Chamado
            {
                Titulo = chamadoDto.Titulo,
                Descricao= chamadoDto.Descricao,
                Status = StatusChamadoConst.Pendente,
                Solicitante = user,
                DtAbertura = DateTime.Now
            };

            GeneralResponse result = await _chamadoService.AbrirChamado(chamado);
            
            if(result.Flag)
                return Ok(result);


            return BadRequest("Erro ao abrir chamado.");

        }

        [Authorize(Roles = "Admin, Dev, Padrao")]
        [HttpPut("EditarChamado")]
        public async Task<ActionResult> EditarChamado(EditarChamado chamadoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest();

            Chamado chamado = new Chamado()
            {
                Id = chamadoDto.Id,
                Titulo = chamadoDto.Titulo,
                Descricao = chamadoDto.Descricao,
                Status = chamadoDto.Status,
                Responsavel = chamadoDto.Responsavel,

            };

            var result = await _chamadoService.EditarChamado(chamado);

            return Ok(result);

        }


        [Authorize(Roles = "Admin")]
        [HttpGet("RetornaChamadosPorId")]
        public async Task<ActionResult> RetornaChamadosPorId(int id)
        {

            RetornaChamado chamado = await _chamadoService.RetornaChamadoPorId(id);
            

            if (chamado == null)
                return BadRequest("Chamado não encontrado");


            return Ok(chamado);

        }


        [Authorize(Roles = "Admin, Dev, Padrao")]
        [HttpGet("RetornaChamadosResponsavel")]
        public async Task<ActionResult> RetornaChamadosResponsavel(string email)
        {
            if (email == null)
                return BadRequest();

            var usuario = await _userManager.FindByEmailAsync(email);

            if (usuario == null)
                return BadRequest("Responsavel não encontrado");

            IEnumerable<RetornaChamado> chamados = await _chamadoService.RetornaChamadosPorEmailResponsavel(email);

            if (chamados == null || !chamados.Any())
                return BadRequest("Não foram encontrados chamados para esse responsável");

            return Ok(chamados);

        }


        [Authorize(Roles = "Admin, Dev, Padrao")]
        [HttpGet("RetornaChamadosSolicitante")]
        public async Task<ActionResult> RetornaChamadosSolicitante(string email)
        {
            if (email == null)
                return BadRequest();

            var usuario = await _userManager.FindByEmailAsync(email);

            if (usuario == null)
                return BadRequest("Solicitante não encontrado");

            IEnumerable<RetornaChamado> chamados = await _chamadoService.RetornaChamadosPorEmailSolicitante(email);

            if (chamados == null || !chamados.Any())
                return BadRequest("Não foram encontrados chamados para esse solicitante");

            
            return Ok(chamados);

        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("ExcluirChamado")]
        public async Task<ActionResult> ExcluirChamado(int id)
        {
           
            var result = await _chamadoService.ExcluirChamado(id); 

            return Ok(result);


        }


       


    }


}
