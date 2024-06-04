using System.Net.Mail;
using System.Net;
using WebChamadosAPI.Interfaces;

namespace WebChamadosAPI.Services
{
    public class EmailService : IEmailService
    {

        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task SendEmailAsync(string emailDestinatario, string assunto, string mensagem, bool isBodyHTML)
        {

            string host = _configuration.GetValue<string>("SMTP:Host");
            string nome = _configuration.GetValue<string>("SMTP:Nome");
            string username = _configuration.GetValue<string>("SMTP:UserName");
            string senha = _configuration.GetValue<string>("SMTP:Senha");
            int porta = _configuration.GetValue<int>("SMTP:Porta");

            MailMessage mail = new MailMessage()
            {
                From = new MailAddress(username, nome)
            };

            mail.To.Add(emailDestinatario);
            mail.Subject = assunto;
            mail.Body = mensagem;
            mail.IsBodyHtml = true;
            mail.Priority = MailPriority.High;

            using (SmtpClient smtp = new SmtpClient(host, porta))
            {
                smtp.Credentials = new NetworkCredential(username, senha);
                smtp.EnableSsl = true;

                smtp.Send(mail);

                return Task.CompletedTask;
            }

        }
    }
}
