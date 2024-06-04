using System.ComponentModel.DataAnnotations;
using WebChamadosAPI.Models;

namespace WebChamadosAPI.DTOs
{
    public class RetornaChamado
    {

        public int Id { get; set; }
        public string Titulo { get; set; }

        public string Descricao { get; set; }

        public string Status { get; set; }

        public string? Conclusao { get; set; }

        public string? Responsavel { get; set; }        

        public DateTime DtAbertura { get; set; }

        public DateTime? DtFechamento { get; set; }

        public string EmailSolicitante { get; set; }
        public string NomeSolicitante { get; set; }
        public string SobrenomeSolicitante { get; set; }


        public string? NomeResponsavel { get; set; }
        public string? SobrenomeResponsavel { get; set; }


    }
}
