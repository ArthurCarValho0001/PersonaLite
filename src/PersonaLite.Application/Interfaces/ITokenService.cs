namespace PersonaLite.Application.Interfaces;

public interface ITokenService
{
    string GerarToken(Guid usuarioId, string nomeUsuario, int versaoSessao = 0);
}
