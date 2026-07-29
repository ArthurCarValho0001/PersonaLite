using PersonaLite.Domain.Enums;

namespace PersonaLite.Domain.Entities;

public class Usuario
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public Sexo Sexo { get; private set; }
    public DateOnly DataNascimento { get; private set; }
    public double AlturaCm { get; private set; }

    // construtor privado pra forçar criação via factory method, EF Core usa reflection
    private Usuario() { }

    public Usuario(string nome, Sexo sexo, DateOnly dataNascimento, double alturaCm)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        Sexo = sexo;
        DataNascimento = dataNascimento;
        AlturaCm = alturaCm;
    }

    public int IdadeEm(DateOnly data)
    {
        var idade = data.Year - DataNascimento.Year;
        if (data < DataNascimento.AddYears(idade)) idade--;
        return idade;
    }
}
