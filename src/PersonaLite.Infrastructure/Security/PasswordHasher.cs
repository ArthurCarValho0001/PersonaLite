using System.Security.Cryptography;
using PersonaLite.Application.Interfaces;

namespace PersonaLite.Infrastructure.Security;

/// <summary>
/// Hash de senha usando PBKDF2 (built-in no .NET, sem depender de pacote externo).
/// O hash resultante já embute o salt e o número de iterações, então
/// é auto-suficiente para verificação posterior.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private const int TamanhoSalt = 16;
    private const int TamanhoHash = 32;
    private const int Iteracoes = 100_000;

    public string Hash(string senha)
    {
        var salt = RandomNumberGenerator.GetBytes(TamanhoSalt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, Iteracoes, HashAlgorithmName.SHA256, TamanhoHash);

        // formato: iteracoes.salt.hash (tudo em Base64, separado por ponto)
        return $"{Iteracoes}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool Verificar(string senha, string hash)
    {
        var partes = hash.Split('.');
        if (partes.Length != 3) return false;

        var iteracoes = int.Parse(partes[0]);
        var salt = Convert.FromBase64String(partes[1]);
        var hashArmazenado = Convert.FromBase64String(partes[2]);

        var hashCalculado = Rfc2898DeriveBytes.Pbkdf2(senha, salt, iteracoes, HashAlgorithmName.SHA256, hashArmazenado.Length);

        return CryptographicOperations.FixedTimeEquals(hashCalculado, hashArmazenado);
    }
}