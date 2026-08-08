using PersonaLite.Domain.Enums;

namespace PersonaLite.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string NomeUsuario { get; private set; } = string.Empty;
    public string SenhaHash { get; private set; } = string.Empty;
    public Sexo Sexo { get; private set; }
    public DateOnly DataNascimento { get; private set; }
    public double AlturaCm { get; private set; }
    public int TempoDescansoSegundos { get; private set; } = 90;

    private Usuario() { }

    public Usuario(string nome, string nomeUsuario, string senhaHash, Sexo sexo, DateOnly dataNascimento, double alturaCm)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        NomeUsuario = nomeUsuario.Trim().ToLowerInvariant();
        SenhaHash = senhaHash;
        Sexo = sexo;
        DataNascimento = dataNascimento;
        AlturaCm = alturaCm;
        TempoDescansoSegundos = 90;
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
}