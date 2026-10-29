using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Api.Endpoints;
using PersonaLite.Application.UseCases;
using PersonaLite.Infrastructure;
using PersonaLite.Infrastructure.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var runtimeArgs = new List<string>();
for (var i = 0; i < args.Length; i++)
{
    if (args[i] == "--apply-local-migrations") continue;
    if (args[i] is "--import-local-catalog" or "--withdraw-local-version") { i++; continue; }
    runtimeArgs.Add(args[i]);
}
var builder = WebApplication.CreateBuilder(runtimeArgs.ToArray());

// Opt-in local profile: validate before registering the database or running migrations.
if (builder.Configuration.GetValue<bool>("LocalDevelopment:Enabled"))
{
    var connection = new Npgsql.NpgsqlConnectionStringBuilder(
        builder.Configuration.GetConnectionString("DefaultConnection"));
    if (!builder.Environment.IsDevelopment() || connection.Host != "127.0.0.1"
        || connection.Port != 55432 || connection.Database != "personalite_v2_local")
        throw new InvalidOperationException("Perfil local exige Development e banco 127.0.0.1:55432/personalite_v2_local.");
}

const string PoliticaCorsClient = "ClientPwa";

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsClient, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://persona-lite.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("Jwt:SecretKey não configurada.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        };
        options.Events = new JwtBearerEvents {
            OnTokenValidated = async context => {
                var id = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var version = context.Principal?.FindFirst("session_version")?.Value ?? "0";
                var db = context.HttpContext.RequestServices.GetRequiredService<PersonaLiteDbContext>();
                if (!Guid.TryParse(id, out var usuarioId) || !int.TryParse(version, out var v)
                    || !await db.Usuarios.AsNoTracking().AnyAsync(u => u.Id == usuarioId && u.VersaoSessao == v))
                    context.Fail("Sessão encerrada. Entre novamente.");
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options => {
    options.RejectionStatusCode = 429;
    options.OnRejected = async (context, ct) => {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(new { mensagem = "Muitas tentativas. Aguarde um minuto." }, ct);
    };
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(h => {
        var path = h.Request.Path.Value ?? "";
        var codigo = path.Contains("senha") || path.Contains("verificacao");
        var auth = path.StartsWith("/api/auth/");
        if (!codigo && !auth) return RateLimitPartition.GetNoLimiter("outros");
        var limite = builder.Configuration.GetValue<int?>(codigo ? "Limits:CodesPerMinute" : "Limits:AuthPerMinute") ?? (codigo ? 5 : 10);
        return RateLimitPartition.GetFixedWindowLimiter($"{h.Connection.RemoteIpAddress}:{(codigo ? "codigo" : "auth")}", _ => new FixedWindowRateLimiterOptions { PermitLimit = Math.Max(1, limite), Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true });
    });
});
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<PersonaLite.Application.Interfaces.ICalendario, PersonaLite.Api.CalendarioDispositivo>();

builder.Services.AddInfrastructure(builder.Configuration);

if (builder.Configuration.GetValue<bool>("LocalDevelopment:Enabled"))
    builder.Services.AddSingleton<PersonaLite.Application.Interfaces.IEmailService, PersonaLite.Api.LocalEmailService>();

builder.Services.AddScoped<RegistrarUsuarioUseCase>();
builder.Services.AddScoped<AprendizagemService>();
builder.Services.AddScoped<LoginUseCase>();
builder.Services.AddScoped<ObterUsuarioUseCase>();
builder.Services.AddScoped<RegistrarMedidasUseCase>();
builder.Services.AddScoped<ObterEvolucaoUseCase>();
builder.Services.AddScoped<ObterMedidaUseCase>();
builder.Services.AddScoped<AtualizarMedidasUseCase>();
builder.Services.AddScoped<VerificarReavaliacaoPendenteUseCase>();
builder.Services.AddScoped<CriarPlanoTreinoUseCase>();
builder.Services.AddScoped<AdicionarDiaDeTreinoUseCase>();
builder.Services.AddScoped<AdicionarExercicioUseCase>();
builder.Services.AddScoped<ObterPlanoVigenteUseCase>();
builder.Services.AddScoped<ObterTreinoDoDiaUseCase>();
builder.Services.AddScoped<ObterTreinoPorDiaUseCase>();
builder.Services.AddScoped<AtualizarSerieUseCase>();
builder.Services.AddScoped<RemoverSerieUseCase>();
builder.Services.AddScoped<AtualizarDiaDeTreinoUseCase>();
builder.Services.AddScoped<AtualizarExercicioUseCase>();
builder.Services.AddScoped<RemoverExercicioUseCase>();
builder.Services.AddScoped<ReordenarExerciciosUseCase>();
builder.Services.AddScoped<RegistrarSerieUseCase>();
builder.Services.AddScoped<ObterProgressaoCargaUseCase>();
builder.Services.AddScoped<AdicionarFotoProgressoUseCase>();
builder.Services.AddScoped<CriarTrimestreUseCase>();
builder.Services.AddScoped<ObterTrimestreAtualUseCase>();
builder.Services.AddScoped<ObterSugestaoTrocaTreinoUseCase>();
builder.Services.AddScoped<ConcluirSessaoUseCase>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<AtualizarTempoDescansoUseCase>();
builder.Services.AddScoped<ConcluirTreinoDoDiaUseCase>();
builder.Services.AddScoped<ObterRetrospectivaDetalhadaUseCase>();
builder.Services.AddScoped<ObterResumoProgressoUseCase>();
builder.Services.AddScoped<AtualizarInformacoesPessoaisUseCase>();
builder.Services.AddScoped<AtualizarAvatarUseCase>();
builder.Services.AddScoped<AlterarNomeUsuarioUseCase>();
builder.Services.AddScoped<AlterarEmailUseCase>();
builder.Services.AddScoped<SolicitarVerificacaoEmailUseCase>();
builder.Services.AddScoped<ConfirmarVerificacaoEmailUseCase>();
builder.Services.AddScoped<SolicitarRedefinicaoSenhaUseCase>();
builder.Services.AddScoped<RedefinirSenhaUseCase>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PersonaLiteDbContext>();
    if (args.Contains("--apply-local-migrations"))
    {
        if (!builder.Configuration.GetValue<bool>("LocalDevelopment:Enabled"))
            throw new InvalidOperationException("O comando de migração exige o perfil local isolado.");
        await dbContext.Database.MigrateAsync();
        await CatalogoDemonstracao.PrepararAsync(dbContext);
        return;
    }
    if ((await dbContext.Database.GetPendingMigrationsAsync()).Any())
        throw new InvalidOperationException("Existem migrations pendentes. Aplique-as explicitamente antes de iniciar a API.");
    var importar = Array.IndexOf(args, "--import-local-catalog");
    var retirar = Array.IndexOf(args, "--withdraw-local-version");
    if (importar >= 0 || retirar >= 0)
    {
        if (!builder.Configuration.GetValue<bool>("LocalDevelopment:Enabled"))
            throw new InvalidOperationException("Administração de catálogo exige o perfil local isolado.");
        if (importar >= 0 && importar + 1 < args.Length) await CatalogoLocal.ImportarAsync(dbContext, args[importar + 1]);
        else if (retirar >= 0 && retirar + 1 < args.Length && Guid.TryParse(args[retirar + 1], out var versaoId)) await CatalogoLocal.RetirarAsync(dbContext, versaoId);
        else throw new InvalidOperationException("Informe arquivo de catálogo ou ID de versão válido.");
        return;
    }
    if (builder.Configuration.GetValue<bool>("LocalDevelopment:Enabled"))
        await CatalogoDemonstracao.PrepararAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(PoliticaCorsClient);
app.Use(async (context, next) => {
    context.Response.Headers.CacheControl = "no-store";
    try { await next(); }
    catch (Exception ex) when (!context.Response.HasStarted && ex is InvalidOperationException or ArgumentException or KeyNotFoundException) {
        var regraConhecida = ex.TargetSite?.DeclaringType?.Namespace?.StartsWith("PersonaLite.") == true;
        context.Response.ContentLength = null;
        context.Response.StatusCode = !regraConhecida ? 500 : ex is KeyNotFoundException ? 404 : ex is ConflitoException ? 409 : 400;
        await context.Response.WriteAsJsonAsync(new { mensagem = regraConhecida ? ex.Message : "Não foi possível concluir a operação. Tente novamente.", traceId = context.TraceIdentifier });
    }
    catch (Exception ex) when (!context.Response.HasStarted && ex is not OperationCanceledException) {
        app.Logger.LogError("Falha {Tipo} na requisição {TraceId}", ex.GetType().Name, context.TraceIdentifier);
        context.Response.ContentLength = null;
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { mensagem = "Não foi possível concluir a operação. Tente novamente.", traceId = context.TraceIdentifier });
    }
});
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseMiddleware<PersonaLite.Api.OperacoesMiddleware>();

app.MapUsuarioEndpoints();
app.MapMedidasEndpoints();
app.MapTreinoEndpoints();
app.MapSessaoEndpoints();
app.MapAuthEndpoints();
app.MapTrimestreEndpoints();
app.MapRetrospectivaEndpoints();
app.MapProgressoEndpoints();
app.MapSaudeEndpoints();
app.MapAprendizagemEndpoints();

app.Run();
