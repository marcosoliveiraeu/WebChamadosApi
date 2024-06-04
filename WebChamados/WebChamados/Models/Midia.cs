namespace WebChamadosAPI.Models
{
    public class Midia
    {

        public int Id { get; set; }

        public byte[] Imagem { get; set; }

        public int ChamadoId { get; set; }
        public Chamado Chamado { get; set; }

     

    }
}
