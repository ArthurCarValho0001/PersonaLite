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

builder.Services.AddCors(options =>
{
    options.AddPolicy(PoliticaCorsClient, policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://persona-lite.vercel.app"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<PersonaLiteDbContext>(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.UseSqlite(connectionString);
    }
    else
    {
        options.UseNpgsql(connectionString);
    }
});

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