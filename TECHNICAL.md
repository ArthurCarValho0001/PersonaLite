# PersonaLite — Documentação Técnica

Documentação de arquitetura, funcionamento interno, setup local, testes e deploy. Pensada para desenvolvedores dando manutenção no projeto (humanos ou IA).

---

## Sumário

1. [Visão geral do sistema](#1-visão-geral-do-sistema)
2. [Arquitetura (Clean Architecture)](#2-arquitetura-clean-architecture)
3. [Modelo de domínio](#3-modelo-de-domínio)
4. [Autenticação](#4-autenticação)
5. [Modelo de dados (PostgreSQL)](#5-modelo-de-dados-postgresql)
6. [API — referência de endpoints](#6-api--referência-de-endpoints)
7. [Frontend — estrutura](#7-frontend--estrutura)
8. [PWA e sincronização offline](#8-pwa-e-sincronização-offline)
9. [Setup local completo](#9-setup-local-completo)
10. [Como testar](#10-como-testar)
11. [Deploy e infraestrutura](#11-deploy-e-infraestrutura)
12. [Variáveis de ambiente — referência completa](#12-variáveis-de-ambiente--referência-completa)
13. [Decisões técnicas e por quê](#13-decisões-técnicas-e-por-quê)
14. [Problemas conhecidos e histórico de bugs corrigidos](#14-problemas-conhecidos-e-histórico-de-bugs-corrigidos)
15. [Roadmap técnico](#15-roadmap-técnico)

---

## 1. Visão geral do sistema

PersonaLite é composto por dois deployables independentes:

- **Backend**: ASP.NET Core 8 (Minimal API), Clean Architecture, Entity Framework Core + PostgreSQL. Empacotado em Docker, hospedado no **Render**.
- **Frontend**: React 18 + TypeScript + Vite, PWA (manifest + service worker via `vite-plugin-pwa`), hospedado no **Vercel**.
- **Banco de dados**: PostgreSQL gerenciado pelo **Supabase**. A API se conecta via connection string padrão (Npgsql), sem usar recursos específicos do Supabase (Auth, RLS, Realtime) — é só um Postgres.

```
Browser (PWA)
     │  HTTPS
     ▼
Vercel (frontend estático, React build)
     │  HTTPS / REST JSON + Authorization: Bearer <JWT>
     ▼
Render (API .NET 8, container Docker)
     │  Npgsql / EF Core
     ▼
Supabase (PostgreSQL gerenciado)
```

Autenticação: usuário + senha, com token JWT emitido no login/registro e enviado em toda chamada subsequente via header `Authorization: Bearer <token>`.

---

## 2. Arquitetura (Clean Architecture)

Quatro camadas, dependência sempre apontando para dentro:

```
Api  →  Infrastructure  →  Application  →  Domain
```

- **`PersonaLite.Domain`** — entidades, value objects, enums, regras de negócio puras. Zero dependência externa (nem do EF Core).
- **`PersonaLite.Application`** — casos de uso (um por ação do sistema), DTOs, interfaces de repositório e serviços (`IUsuarioRepository`, `IPasswordHasher`, `ITokenService`, etc.). Depende só do Domain.
- **`PersonaLite.Infrastructure`** — implementação concreta: `PersonaLiteDbContext` (EF Core), repositórios, `PasswordHasher` (PBKDF2), `TokenService` (JWT), armazenamento de fotos em disco.
- **`PersonaLite.Api`** — Minimal API: endpoints HTTP, configuração de DI, CORS, autenticação JWT, Swagger.

Fluxo típico ao adicionar uma funcionalidade: Domain (entidade/regra) → Application (DTO + caso de uso + interface) → Infrastructure (implementação do repositório) → Api (endpoint + registro em `Program.cs`) → Frontend (tipo TS + função de API + tela).

---

## 3. Modelo de domínio

### Usuario
```
Id (Guid), Nome, NomeUsuario, SenhaHash, Sexo (enum), DataNascimento, AlturaCm
```
- `NomeUsuario` é normalizado (trim + lowercase) na criação.
- `SenhaHash` nunca é exposto em nenhum DTO de saída.
- Método `IdadeEm(data)` — calcula idade numa data específica (usado no cálculo de % de gordura, que depende da idade no momento da medição).

### RegistroMedidas
```
Id, UsuarioId, Data, PesoKg, Circunferencias (VO), Dobras (VO), Imc (calculado), PercentualGorduraJP7 (calculado)
```
- **Circunferencias** (Value Object, owned type): 14 campos — pescoço, tórax (2 pontos), última costela, cintura, quadril, braço/antebraço (esq/dir), perna/panturrilha (esq/dir).
- **DobrasCutaneas** (Value Object, owned type): 7 campos (peitoral, axilar média, tríceps, subescapular, abdominal, suprailíaca, coxa) + propriedade calculada `Soma7Dobras`.
- Cálculos automáticos no construtor e no método `Atualizar(...)`:
  - **IMC**: `peso / altura²`, classificado (abaixo do peso / normal / sobrepeso / obesidade I/II/III).
  - **% de gordura** (Jackson & Pollock 7 dobras — fórmula difere por sexo):
    - Homens: `D = 1.112 − 0.00043499·S + 0.00000055·S² − 0.00028826·idade`
    - Mulheres: `D = 1.097 − 0.00046971·S + 0.00000056·S² − 0.00012828·idade`
    - Siri: `%Gordura = (495 / D) − 450`

### FotoProgresso
```
Id, RegistroMedidasId, Angulo (Frente|Lado|Costas), CaminhoArquivo
```

### PlanoTreino / DiaDeTreino / ExercicioPlanejado
```
PlanoTreino:     Id, UsuarioId, InicioVigencia, FimVigencia?, Dias: List<DiaDeTreino>
DiaDeTreino:     Id, PlanoTreinoId, Nome, DiaSemana (DayOfWeek), Exercicios: List<ExercicioPlanejado>
ExercicioPlanejado: Id, DiaDeTreinoId, Nome, GrupoMuscular, SeriesAlvo, RepeticoesAlvo, Ordem
```
Regra: só existe um `PlanoTreino` vigente por usuário (`FimVigencia == null`). Criar um novo encerra o anterior automaticamente (`CriarPlanoTreinoUseCase`).

### SessaoExercicio / SerieRealizada — modelagem do drop set

```
SessaoExercicio: Id, ExercicioPlanejadoId, Data, Series: List<SerieRealizada>
SerieRealizada:  Id (Guid), GrupoSerie (int), OrdemEstagio (int), CargaKg, Repeticoes
```

Cada linha de `SerieRealizada` é um **estágio**. Várias linhas com o mesmo `GrupoSerie` representam os estágios de um único drop set físico (ex: 40kg×12 seguido de 35kg×5 sem descanso = 2 linhas, `GrupoSerie` igual, `OrdemEstagio` 0 e 1). Uma série normal é simplesmente um grupo com um único estágio.

Método `SessaoExercicio.RegistrarSerie(IEnumerable<(double CargaKg, int Repeticoes)> estagios)` calcula automaticamente o próximo `GrupoSerie` e a ordem de cada estágio — o mesmo método cobre série normal e drop set, sem flag booleano.

**Nota histórica de bug corrigido**: a primeira versão de `SerieRealizada` era um `record` sem `Id` próprio, mapeada com chave composta (`SessaoExercicioId` + int autoincremento). Isso quebrava no PostgreSQL/SQLite porque **chave primária composta não autoincrementa** — a correção foi dar um `Id` (Guid) próprio à entidade, gerado no construtor, igual a todas as outras.

Regra "get-or-create": só existe uma `SessaoExercicio` por (`ExercicioPlanejadoId`, `Data`). `RegistrarSerieUseCase` busca a sessão do dia; se existir, anexa a série; se não, cria uma nova. Isso sustenta a tela "Treino de hoje" mostrando em tempo real tudo que já foi feito.

---

## 4. Autenticação

- **Método**: usuário + senha (sem e-mail, sem recuperação de senha na versão atual).
- **Hash de senha**: PBKDF2 nativo do .NET (`Rfc2898DeriveBytes`), 100.000 iterações, SHA-256, salt de 16 bytes gerado por requisição. Formato armazenado: `{iteracoes}.{salt em Base64}.{hash em Base64}`. Implementado em `PersonaLite.Infrastructure/Security/PasswordHasher.cs`.
- **Token**: JWT (HMAC-SHA256), claims `NameIdentifier` (Id do usuário) e `Name` (nome de usuário), validade de 30 dias. Implementado em `PersonaLite.Infrastructure/Security/TokenService.cs`.
- **Chave de assinatura**: `Jwt:SecretKey` — via User Secrets local, via variável de ambiente `Jwt__SecretKey` em produção. **Nunca commitada.**
- **Fluxo**:
  1. `POST /api/auth/registrar` ou `POST /api/auth/login` → retorna `{ token, usuarioId, nome }`.
  2. Frontend guarda o token em `localStorage`.
  3. Toda chamada subsequente envia `Authorization: Bearer <token>` (interceptor do axios em `client/src/api/httpClient.ts`).
  4. Backend valida o JWT via middleware (`app.UseAuthentication()` + `app.UseAuthorization()`), e cada endpoint (exceto `/api/auth/*`) tem `RequireAuthorization()`.
  5. O `usuarioId` é extraído do token em cada endpoint via `HttpContext.User.ObterUsuarioId()` (extension method em `PersonaLite.Api/ClaimsPrincipalExtensions.cs`) e passado explicitamente pra cada caso de uso.
- **Prevenção de IDOR**: todo caso de uso que opera sobre um recurso específico (medição, dia de treino, exercício, série) **verifica explicitamente que o recurso pertence ao `usuarioId` autenticado** antes de ler ou escrever — não confia apenas em filtrar por usuário na consulta. Padrão aplicado em `ObterMedidaUseCase`, `AtualizarMedidasUseCase`, `AdicionarDiaDeTreinoUseCase`, `AdicionarExercicioUseCase`, `RegistrarSerieUseCase`, `ObterProgressaoCargaUseCase`.
- **Logout**: puramente client-side — remove o token do `localStorage`. Não há blacklist/revogação de token no backend (aceitável dado o prazo de expiração de 30 dias e a natureza do app).

---

## 5. Modelo de dados (PostgreSQL)

Tabelas (nomes exatos no banco):

| Tabela | Observação |
|---|---|
| `Usuarios` | `Id, Nome, NomeUsuario, SenhaHash, Sexo, DataNascimento, AlturaCm` |
| `RegistrosMedidas` | Circunferencias/Dobras embutidas como colunas prefixadas (`Circunferencias_*`, `Dobras_*`) — owned types do EF |
| `FotosProgresso` | FK `RegistroMedidasId` |
| `PlanosTreino` | FK `UsuarioId` |
| `DiasDeTreino` | FK `PlanoTreinoId`, cascade delete |
| `ExerciciosPlanejados` | FK `DiaDeTreinoId`, cascade delete |
| `SessoesExercicio` | FK `ExercicioPlanejadoId` |
| `SerieRealizada` | FK `SessaoExercicioId`, cascade delete, `Id` próprio (Guid) como PK simples |
| `__EFMigrationsHistory` | Controle de migrations do EF Core |

Todas as PKs são `Guid`, geradas em memória pelo construtor da entidade (`Guid.NewGuid()`), nunca pelo banco. Por isso `PersonaLiteDbContext.OnModelCreating` tem, no **final** do método (depois de todas as chamadas `OwnsOne`/`OwnsMany`/`HasMany`), um loop que força `ValueGenerated.Never` em toda propriedade `Id` do tipo `Guid` em todo o modelo:

```csharp
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    var idProperty = entityType.FindProperty("Id");
    if (idProperty?.ClrType == typeof(Guid))
        idProperty.ValueGenerated = ValueGenerated.Never;
}
```

Sem isso, o EF Core pode tratar uma entidade nova (com Id já preenchido) como se fosse uma edição, tentando `UPDATE` em vez de `INSERT` ao adicionar filhos a uma entidade pai já rastreada — precisa rodar depois dos `Owns*`/`HasMany` porque só aí os tipos "owned" (como `SerieRealizada`) passam a existir no modelo do EF.

**Migrations**: geradas com `dotnet ef migrations add`, ficam em `src/PersonaLite.Infrastructure/Migrations`. Aplicadas automaticamente no startup da API (`dbContext.Database.Migrate()` em `Program.cs`) — tanto local quanto em produção.

---

## 6. API — referência de endpoints

Base local: `http://localhost:5000`. Documentação interativa via Swagger em `/swagger` (ambiente Development).

### Auth (sem autenticação)
| Método | Rota | Corpo | Retorno |
|---|---|---|---|
| POST | `/api/auth/registrar` | `{ nome, nomeUsuario, senha, sexo, dataNascimento, alturaCm }` | `201` `{ token, usuarioId, nome }` |
| POST | `/api/auth/login` | `{ nomeUsuario, senha }` | `200` `{ token, usuarioId, nome }` / `401` |

### Usuário (autenticado)
| Método | Rota |
|---|---|
| GET | `/api/usuario` |

### Medidas (autenticado)
| Método | Rota |
|---|---|
| POST | `/api/medidas` |
| GET | `/api/medidas` |
| GET | `/api/medidas/{id}` |
| PUT | `/api/medidas/{id}` |
| GET | `/api/medidas/reavaliacao-pendente` |
| POST | `/api/medidas/{id}/fotos` (multipart/form-data) |

### Plano de treino (autenticado)
| Método | Rota |
|---|---|
| POST | `/api/planos-treino` |
| GET | `/api/planos-treino/atual` |
| POST | `/api/planos-treino/{id}/dias` |
| POST | `/api/dias-treino/{id}/exercicios` |
| GET | `/api/treino-do-dia` (query opcional `?data=yyyy-MM-dd`) |

### Sessões/séries (autenticado)
| Método | Rota |
|---|---|
| POST | `/api/series` |
| GET | `/api/exercicios/{id}/progressao` |

Todas as rotas autenticadas exigem header `Authorization: Bearer <token>`. Enums (`Sexo`, `DiaSemana`, `AnguloFoto`) trafegam como **string** no JSON (configurado via `JsonStringEnumConverter` em `Program.cs`), não como número.

---

## 7. Frontend — estrutura

```
client/src/
  api/          httpClient.ts (axios + interceptors de token), authApi.ts,
                usuarioApi.ts, medidasApi.ts, treinoApi.ts, sessaoApi.ts,
                authToken.ts (localStorage), offlineQueue.ts (IndexedDB),
                postComFallbackOffline.ts
  types/        usuario.ts, medidas.ts, treino.ts, auth.ts — espelham os DTOs do backend
  hooks/        useUsuario, useEvolucao, useReavaliacao, usePlanoAtual,
                useTreinoDoDia, useSyncQueue
  components/   Card, Button, FormField, SeletorSexo, SerieRegistro
                (registro de série com drop set), CardExercicio,
                GraficoEvolucao, ComparadorFotos, AlertaReavaliacao,
                IndicadorSincronizacao
  pages/        Login, Registrar, Dashboard, NovaMedicao (cria e edita),
                Treinos (treino do dia), ConfigurarTreino
```

**Roteamento** (`App.tsx`, React Router): se não há token → só `Login`/`Registrar`. Com token válido → `Dashboard`, `/medidas/nova`, `/medidas/:id/editar`, `/treinos`, `/treinos/configurar`.

**Interceptors do axios** (`httpClient.ts`): anexa `Authorization: Bearer <token>` automaticamente em toda requisição; em resposta `401`, limpa o token e força reload (volta pra tela de login).

**Configuração da URL da API**: `VITE_API_BASE_URL` (variável de build do Vite), com fallback `http://localhost:5000`.

---

## 8. PWA e sincronização offline

- `vite-plugin-pwa` gera manifest e service worker (Workbox) no build.
- Cache das chamadas de API: `StaleWhileRevalidate`.
- Fila offline (`client/src/api/offlineQueue.ts`, via `idb`/IndexedDB): usada em `registrarMedidas` e `registrarSerie`. Se o POST falhar por erro de rede (não por erro de validação com resposta), a requisição é salva localmente; `useSyncQueue` reenvia automaticamente ao detectar o evento `online` do navegador.
- Design mobile-first: alvos de toque ≥44px, `font-size: 16px` nos inputs (evita zoom automático no iOS), `env(safe-area-inset-bottom)`, grids em 1 coluna por padrão (2 colunas só a partir de 480px), `inputMode="decimal"/"numeric"` nos campos numéricos.

---

## 9. Setup local completo

### Pré-requisitos
- .NET SDK 8
- Node.js 20+
- Docker (para rodar o Postgres localmente)

### 9.1 Banco de dados local

```powershell
docker run --name personalite-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=personalite -p 5432:5432 -d postgres:16
```

### 9.2 Backend

```powershell
dotnet restore

cd src/PersonaLite.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=personalite;Username=postgres;Password=postgres"
dotnet user-secrets set "Jwt:SecretKey" "uma-string-aleatoria-de-pelo-menos-32-caracteres"

dotnet ef database update --project ../PersonaLite.Infrastructure --startup-project .
dotnet run
```

API sobe em `http://localhost:5000`. Swagger em `http://localhost:5000/swagger`.

### 9.3 Frontend

```powershell
cd client
npm install
npm run dev
```

Sobe em `http://localhost:5173`. Se quiser testar em outro dispositivo na mesma rede: `npm run dev -- --host`.

### 9.4 Se mudar alguma entidade (nova migration)

```powershell
cd src/PersonaLite.Api
dotnet ef migrations add NomeDaMigration --project ../PersonaLite.Infrastructure --startup-project .
dotnet ef database update --project ../PersonaLite.Infrastructure --startup-project .
```

**Importante**: apagar a pasta `Migrations` sem também limpar as tabelas do banco já existente causa erro `relation already exists` — se precisar recomeçar do zero, limpe o banco também (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;` via `psql` ou um cliente SQL) antes de reaplicar.

---

## 10. Como testar

### Testes automatizados
```powershell
dotnet test tests/PersonaLite.Domain.Tests
```
Cobre a fórmula de Jackson & Pollock 7 dobras (valida que o resultado difere entre Masculino e Feminino com as mesmas dobras) e o cálculo/classificação de IMC.

### Teste manual completo (fluxo ponta a ponta)
1. Com backend e frontend rodando local, acesse `http://localhost:5173`.
2. Crie uma conta (usuário + senha).
3. Em "Configurar treinos", crie um plano, adicione um dia (ex: "Peito", dia da semana = hoje) e um exercício.
4. Vá em "Treinos" — deve mostrar o treino do dia.
5. Registre uma série normal, depois uma com drop set.
6. No Dashboard, registre uma "Nova medição" completa (peso, circunferências, dobras).
7. Edite essa medição pelo histórico.
8. Abra uma aba anônima, crie uma segunda conta com usuário diferente, confirme que ela **não vê** nenhum dado da primeira conta.

### Teste de isolamento entre usuários (segurança)
Copie o `id` de uma medição da Conta A (pela URL de edição, `/medidas/{id}/editar`). Logado como Conta B, tente acessar `GET /api/medidas/{id}` desse id diretamente (via Swagger ou curl, com o token da Conta B). Deve retornar `404`, nunca os dados da Conta A.

---

## 11. Deploy e infraestrutura

### Backend (Render)
- Build via `Dockerfile` na raiz do repositório (multi-stage: SDK para build/publish, ASP.NET runtime para execução).
- Deploy automático a cada push na branch `main`.
- `dbContext.Database.Migrate()` roda no startup — qualquer migration nova commitada é aplicada automaticamente no boot do container.
- Variáveis de ambiente configuradas no painel do Render (ver seção 12).

### Frontend (Vercel)
- Build automático a cada push na branch `main` (framework preset: Vite).
- Variável de ambiente `VITE_API_BASE_URL` apontando para a URL pública da API no Render.

### Banco de dados (Supabase)
- Apenas o Postgres é usado — nenhum recurso de Auth/RLS/Realtime do Supabase está em uso.
- Connection string obtida em Project Settings → Database, configurada como variável de ambiente no Render (nunca commitada).

### CORS
Configurado em `Program.cs` com as origens permitidas fixas no código (`http://localhost:5173` e a URL de produção do Vercel) — decisão deliberada para eliminar ambiguidade de configuração via variável de ambiente (ver seção 14).

---

## 12. Variáveis de ambiente — referência completa

### Backend — local (via `dotnet user-secrets`, nunca em `appsettings.json`)
| Chave | Exemplo |
|---|---|
| `ConnectionStrings:DefaultConnection` | `Host=localhost;Port=5432;Database=personalite;Username=postgres;Password=postgres` |
| `Jwt:SecretKey` | string aleatória, 32+ caracteres |

### Backend — produção (Render → Environment, usa `__` como separador de seção)
| Chave | Valor |
|---|---|
| `ConnectionStrings__DefaultConnection` | connection string do Supabase (Project Settings → Database) |
| `Jwt__SecretKey` | string aleatória, 32+ caracteres (pode ser diferente da local) |

### Frontend
| Onde | Chave | Valor |
|---|---|---|
| `client/.env` (local) | `VITE_API_BASE_URL` | `http://localhost:5000` |
| Vercel → Environment Variables | `VITE_API_BASE_URL` | URL pública da API no Render |

**Nunca commitar** connection strings ou chaves reais no repositório — nem em `appsettings.json`, nem em `.env` com valor de produção.

---

## 13. Decisões técnicas e por quê

- **Clean Architecture no backend**: isola regra de negócio (Domain) de infraestrutura (EF Core, banco) — permite testar cálculos como % de gordura sem precisar de banco de dados.
- **Value Objects (`Circunferencias`, `DobrasCutaneas`) em vez de campos soltos**: agrupa dados que são sempre lidos/escritos juntos, mapeados como *owned types* do EF (não geram tabela própria).
- **Drop set como "grupo de estágios" em vez de flag booleano**: um único método (`RegistrarSerie`) cobre série normal e drop set — menos código duplicado, menos chance de bug.
- **IDs gerados no domínio (`Guid.NewGuid()`), não pelo banco**: mantém a lógica de identidade dentro do Domain, e não como responsabilidade do banco de dados.
- **PostgreSQL em vez de SQLite**: o projeto começou local-only com SQLite; migrou para Postgres ao decidir hospedar publicamente (Render + Supabase), unificando o mesmo provider em dev e produção pra evitar bugs de "funciona local, quebra em produção" causados por diferenças de sintaxe SQL entre providers.
- **JWT com usuário/senha simples (sem e-mail, sem OAuth)**: escopo mínimo suficiente pra multiusuário real, sem a complexidade de verificação de e-mail ou provedores externos.
- **Verificação explícita de posse de recurso em cada caso de uso (anti-IDOR)**: em vez de confiar apenas em `WHERE UsuarioId = @usuarioId` na query, cada caso de uso que edita/lê um recurso específico confere que ele pertence ao usuário autenticado antes de agir.

---

## 14. Problemas conhecidos e histórico de bugs corrigidos

| # | Sintoma | Causa | Correção |
|---|---|---|---|
| 1 | `NU1101` no Visual Studio | `NuGet.Config` sem fonte configurada | Garantir `<add key="nuget.org" value="https://api.nuget.org/v3/index.json" />` |
| 2 | `CS1061` no `Program.cs` | Faltava `using PersonaLite.Api.Endpoints;` | Adicionar o using |
| 3 | `dotnet ef` recusava rodar | Faltava `Microsoft.EntityFrameworkCore.Design` no projeto **Api** (startup project) | Adicionar o pacote diretamente no `PersonaLite.Api.csproj` |
| 4 | Erro 400 ao criar usuário (`sexo` não desserializa) | `System.Text.Json` serializa enum como número por padrão | `JsonStringEnumConverter` em `ConfigureHttpJsonOptions` |
| 5 | Frontend não conecta na API | Porta da API variável entre execuções | Porta fixada em `launchSettings.json` |
| 6 | Erro de binding nativo do Vite no Windows | Vite 8 usando o bundler experimental "rolldown" | Fixar Vite em versão 5.x estável |
| 7 | Erro 500 ao registrar série | `SerieRealizada` com chave composta e coluna autoincremento — banco relacional não autoincrementa PK composta | Dar `Id` (Guid) próprio à `SerieRealizada` |
| 8 | `relation "X" already exists` ao aplicar migration | Pasta `Migrations` apagada sem também limpar as tabelas existentes no banco | Sempre limpar o schema do banco (`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`) antes de reaplicar uma migration "do zero" |
| 9 | CORS bloqueado em produção | Lista de origens permitidas dependia de variável de ambiente mal configurada | Origens fixadas diretamente no código |
| 10 | Qualquer visitante caía na mesma conta | App originalmente single-user, sem autenticação | Implementado sistema completo de conta/login/JWT com isolamento por `usuarioId` |

### Limitações conhecidas atuais
- Sem recuperação de senha.
- Sem revogação/blacklist de token (logout é só client-side).
- Tela de upload de fotos de progresso ainda não conectada no frontend (endpoint e componente de comparação já existem).
- Gráfico de progressão de carga por exercício: endpoint pronto, sem tela dedicada ainda.
- Sem paginação no histórico de medidas (aceitável no volume de dados atual).

---

## 15. Roadmap técnico

- Tela de upload/captura de fotos de progresso.
- Gráfico de progressão de carga por exercício.
- Recuperação de senha.
- Testes de integração (API + banco em memória/testcontainers).
- CI (GitHub Actions) rodando `dotnet test` e `npm run build` a cada push.
- Reordenação de exercícios dentro de um dia de treino (drag-and-drop).
