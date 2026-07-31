using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PersonaLite.Api.Endpoints;
using PersonaLite.Application.UseCases;
using PersonaLite.Infrastructure;
using PersonaLite.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

const string PoliticaCorsClient = "ClientPwa";

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var allowedOrigins = builder.Configuration["AllowedOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:5173", "https://persona-lite.vercel.app" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsClient, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<CriarUsuarioUseCase>();
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
builder.Services.AddScoped<RegistrarSerieUseCase>();
builder.Services.AddScoped<ObterProgressaoCargaUseCase>();
builder.Services.AddScoped<AdicionarFotoProgressoUseCase>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.MapUsuarioEndpoints();
app.MapMedidasEndpoints();
app.MapTreinoEndpoints();
app.MapSessaoEndpoints();

app.Run();