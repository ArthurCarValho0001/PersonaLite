namespace PersonaLite.Application.DTOs;

public record AtualizarTempoDescansoDto(int Segundos);

public record AtualizarInformacoesPessoaisDto(
    string Nome,
    DateOnly DataNascimento,
    PersonaLite.Domain.Enums.Sexo Sexo,
    string? Metas);

public record AlterarNomeUsuarioDto(string NovoNomeUsuario, string SenhaAtual);

public record AlterarSenhaDto(string SenhaAtual, string NovaSenha);

public record AlterarEmailDto(string NovoEmail, string SenhaAtual);

public record SolicitarVerificacaoEmailDto();

public record ConfirmarVerificacaoEmailDto(string Codigo);

public record SolicitarRedefinicaoSenhaDto(string Email);

public record RedefinirSenhaDto(string Email, string Codigo, string NovaSenha);