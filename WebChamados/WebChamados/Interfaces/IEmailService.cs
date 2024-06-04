namespace WebChamadosAPI.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string emailDestinatario, string assunto, string mensagem, bool isBodyHTML);
    }
}
