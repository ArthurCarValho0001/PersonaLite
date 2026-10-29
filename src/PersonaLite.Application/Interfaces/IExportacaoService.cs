namespace PersonaLite.Application.Interfaces;
public interface IExportacaoService { Task<byte[]> ExportarAsync(Guid usuarioId); }
