namespace PersonaLite.Api.Endpoints;

public static class SaudeEndpoints
{
    public static void MapSaudeEndpoints(this WebApplication app)
    {
        app.MapGet("/api/saude", () => Results.Ok(new { status = "ok", horario = DateTime.UtcNow }))
            .WithTags("Saude");
    }
}