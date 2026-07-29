using System.Text.Json.Serialization;
using PersonaLite.Api.Endpoints;
using PersonaLite.Application.UseCases;
using PersonaLite.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string PoliticaCorsClient = "ClientPwa";

// Faz o System.Text.Json aceitar/gerar enums como texto ("Masculino", "Feminino", "Frente", etc.)
// em vez do número da posição no enum. Sem isso, o front (que manda "Masculino" como string)
// dá erro de deserialização, porque o padrão do .NET é esperar um número (0, 1, 2...).
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Passo 4.1 - CORS liberado pro localhost do Vite (cliente React/PWA)
builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsClient, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Passo 4.1 - Infrastructure (DbContext, repositórios, storage de fotos)
builder.Services.AddInfrastructure(builder.Configuration);

// Passo 4.1 - Casos de uso da Application
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(PoliticaCorsClient);

// Passo 4.2 - Endpoints ficam registrados nos arquivos Endpoints/*.cs (ver abaixo)
app.MapUsuarioEndpoints();
app.MapMedidasEndpoints();
app.MapTreinoEndpoints();
app.MapSessaoEndpoints();

app.Run();
