using System.ComponentModel.DataAnnotations;
using WebChamadosAPI.Enums;

namespace WebChamadosAPI.DTOs
{
    public class RegisterModel
    {
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 5)]
        public string Password { get; set; }

        [Required]
        [StringLength(20)]
        public string Nome { get; set; }

        [Required]
        [StringLength(100)]
        public string Sobrenome { get; set; }

        [Required]
        public EnumPerfil Perfil { get; set; }
      

    }


}
