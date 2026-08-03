using System.Security.Claims;

namespace PersonaLite.Api;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Extrai o Id do usuário autenticado a partir do token JWT.
    /// Lança exceção se chamado numa rota sem autenticação (não deveria acontecer,
    /// já que essas rotas exigem RequireAuthorization()).
    /// </summary>
    public static Guid ObterUsuarioId(this ClaimsPrincipal principal)
    {
        var valor = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Usuário não autenticado.");
        return Guid.Parse(valor);
    }
}