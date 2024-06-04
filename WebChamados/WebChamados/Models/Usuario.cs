using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using WebChamadosAPI.Enums;

namespace WebChamadosAPI.Models
{
    public class Usuario : IdentityUser
    {


        [Required(ErrorMessage = "Digite o nome do usuário")]
        [StringLength(20, ErrorMessage = "O numero máximo de caracteres é 20.")]
        public string? Nome { get; set; }

        [Required(ErrorMessage = "Digite o sobrenome.")]
        [StringLength(100, ErrorMessage = "O numero máximo de caracteres é 100.")]
        public string? Sobrenome { get; set; }


        [Required(ErrorMessage = "Informe o perfil do usuário")]
        public EnumPerfil Perfil { get; set; }

        public ICollection<Chamado>? Chamados { get; set; }

        
    }
}
