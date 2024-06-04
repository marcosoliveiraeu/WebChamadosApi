namespace WebChamadosAPI.Services
{
    public class ServiceResponses
    {
        public record class GeneralResponse(bool Flag, string Message);
        public record class LoginResponse(bool Flag, string AccessToken, string RefreshToken, string Message);
    }
}
