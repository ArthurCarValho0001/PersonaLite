using PersonaLite.Domain.Enums;

namespace PersonaLite.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeUsuario { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public bool EmailVerificado { get; private set; }
    public string? AvatarUrl { get; private set; }
    public string? Metas { get; private set; }
    public Sexo Sexo { get; private set; }
    public DateOnly DataNascimento { get; private set; }
    public double AlturaCm { get; private set; }
    public int TempoDescansoSegundos { get; private set; } = 90;

    private Usuario() { }

    public Usuario(string nome, string nomeUsuario, string senhaHash, Sexo sexo, DateOnly dataNascimento, double alturaCm, string? email = null)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        NomeUsuario = nomeUsuario.Trim().ToLowerInvariant();
        SenhaHash = senhaHash;
        Sexo = sexo;
        DataNascimento = dataNascimento;
        AlturaCm = alturaCm;
        TempoDescansoSegundos = 90;
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
        EmailVerificado = false;
    }

    public int IdadeEm(DateOnly data)
    {
        var idade = data.Year - DataNascimento.Year;
        if (data < DataNascimento.AddYears(idade)) idade--;
        return idade;
    }

    public void DefinirTempoDescanso(int segundos)
    {
        if (segundos < 5 || segundos > 900)
            throw new InvalidOperationException("O tempo de descanso deve estar entre 5 e 900 segundos.");
        TempoDescansoSegundos = segundos;
    }

    public void AtualizarInformacoesPessoais(string nome, DateOnly dataNascimento, Sexo sexo, string? metas)
    {
        Nome = nome;
        DataNascimento = dataNascimento;
        Sexo = sexo;
        Metas = string.IsNullOrWhiteSpace(metas) ? null : metas.Trim();
    }

    public void DefinirAvatar(string avatarUrl)
    {
        AvatarUrl = avatarUrl;
    }

    public void AlterarNomeUsuario(string novoNomeUsuario)
    {
        NomeUsuario = novoNomeUsuario.Trim().ToLowerInvariant();
    }

    public void AlterarSenha(string novoHash)
    {
        SenhaHash = novoHash;
    }

    /// <summary>
    /// Alterar o e-mail sempre exige nova verificação — o e-mail antigo pode ter sido
    /// verificado, mas isso não prova posse do e-mail novo.
    /// </summary>
    public void AlterarEmail(string novoEmail)
    {
        Email = novoEmail.Trim().ToLowerInvariant();
        EmailVerificado = false;
    }

    public void MarcarEmailComoVerificado()
    {
        EmailVerificado = true;
    }
}