using System.ComponentModel.DataAnnotations;

namespace WebChamadosAPI.DTOs
{

    public class NovaSenhaModel
    {

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 5)]
        public string SenhaAtual { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 5)]
        public string NovaSenha { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 5)]
        public string ConfirmaSenha { get; set; }
    }
}
