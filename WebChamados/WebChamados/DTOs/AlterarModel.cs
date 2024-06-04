using System.ComponentModel.DataAnnotations;
using WebChamadosAPI.Enums;

namespace WebChamadosAPI.DTOs
{
    public class AlterarModel
    {
        [Required]
        [EmailAddress]
        [DataType(DataType.EmailAddress)]
        public string Email { get; set; }

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

