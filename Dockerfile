# Estágio de Runtime (.NET 8.0)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Estágio de Build SDK (.NET 8.0)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copia os arquivos de projeto (.csproj) para restaurar as dependências
COPY ["src/PersonaLite.Api/PersonaLite.Api.csproj", "src/PersonaLite.Api/"]
COPY ["src/PersonaLite.Application/PersonaLite.Application.csproj", "src/PersonaLite.Application/"]
COPY ["src/PersonaLite.Domain/PersonaLite.Domain.csproj", "src/PersonaLite.Domain/"]
COPY ["src/PersonaLite.Infrastructure/PersonaLite.Infrastructure.csproj", "src/PersonaLite.Infrastructure/"]

# Restaura os pacotes NuGet
RUN dotnet restore "src/PersonaLite.Api/PersonaLite.Api.csproj"

# Copia todo o código-fonte restante e compila
COPY . .
WORKDIR "/src/src/PersonaLite.Api"
RUN dotnet build "PersonaLite.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Estágio de Publicação
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "PersonaLite.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Estágio Final para Execução
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PersonaLite.Api.dll"]