using System.ComponentModel.DataAnnotations;
using WebChamadosAPI.Models;

namespace WebChamadosAPI.DTOs
{
    public class AbrirChamado
    {


        [Required(ErrorMessage = "Digite o título do chamado.")]
        [StringLength(60, ErrorMessage = "O numero máximo de caracteres é 60.")]
        [MinLength(4)]
        public string Titulo { get; set; }

        [Required(ErrorMessage = "Informe a descrição do chamado")]
        [StringLength(500, ErrorMessage = "O numero máximo de caracteres é 500.")]
        [MinLength(4)]
        public string Descricao { get; set; }

   
    }
}
