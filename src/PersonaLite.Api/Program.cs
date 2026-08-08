using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Api.Endpoints;
using PersonaLite.Application.UseCases;
using PersonaLite.Infrastructure;
using PersonaLite.Infrastructure.Data;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

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
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<RegistrarUsuarioUseCase>();
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

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<PersonaLiteDbContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(PoliticaCorsClient);
app.UseAuthentication();
app.UseAuthorization();

app.MapUsuarioEndpoints();
app.MapMedidasEndpoints();
app.MapTreinoEndpoints();
app.MapSessaoEndpoints();
app.MapAuthEndpoints();
app.MapTrimestreEndpoints();
app.MapRetrospectivaEndpoints();

app.Run();