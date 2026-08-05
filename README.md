# PersonaLite

PersonaLite é um PWA (Progressive Web App) de acompanhamento físico pessoal: medidas corporais, composição corporal (percentual de gordura via 7 dobras cutâneas), fotos de progresso e treino semanal com registro detalhado de séries — incluindo drop sets. Pensado para ser usado direto do celular, dentro da academia.

🔗 **App no ar:** [https://persona-lite.vercel.app](https://persona-lite.vercel.app)

---

## O que o app faz

- **Cadastro de conta própria** — cada pessoa cria sua conta (usuário + senha) e só enxerga os próprios dados.
- **Medidas corporais** — peso, 14 circunferências (fita métrica) e 7 dobras cutâneas (adipômetro), com cálculo automático de IMC e percentual de gordura corporal (método Jackson & Pollock 7 dobras).
- **Histórico e evolução** — gráfico de peso, % de gordura e IMC ao longo do tempo, com edição de qualquer medição já registrada.
- **Aviso de reavaliação** — o app avisa quando já passaram 3 meses desde a última medição (intervalo recomendado para reavaliação física).
- **Treino por dia da semana** — você monta um plano de treino dividido em dias (ex: "Peito" na segunda, "Costas" na quinta), e o app mostra automaticamente **qual treino fazer hoje**, com a lista de exercícios e metas de séries/repetições.
- **Registro de séries interativo** — toca na tela, registra peso e repetições de cada série. Suporta **drop sets** (quedas de carga dentro da mesma série, sem descanso).
- **PWA instalável e offline-first** — instala na tela inicial do celular como um app nativo. Se estiver sem internet no momento de registrar uma medição ou uma série, o dado é salvo localmente e sincronizado automaticamente quando a conexão voltar.

## Quem pode usar

Qualquer pessoa que crie uma conta. Cada conta é isolada — as medidas e treinos de um usuário nunca aparecem para outro.

---

## Onde cada parte roda

| Camada | Serviço | O que fica lá |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | O PWA (React + TypeScript), builda e serve os arquivos estáticos a cada push na branch `main` |
| **Backend** | [Render](https://render.com) | A API (.NET 8), rodando como container Docker, builda e sobe a cada push na branch `main` |
| **Banco de dados** | [Supabase](https://supabase.com) | PostgreSQL gerenciado — todas as tabelas do app (usuários, medidas, treinos, séries) |

O fluxo é simples: o navegador fala com o Vercel (frontend) → o frontend faz chamadas HTTP pra API no Render → a API fala com o banco no Supabase. Não existe nenhuma lógica de negócio no Vercel ou no Supabase diretamente — toda regra fica na API.

---

## Tecnologias principais

- **Backend:** .NET 8, ASP.NET Core (Minimal API), Entity Framework Core, PostgreSQL
- **Frontend:** React 18, TypeScript, Vite, PWA (service worker + manifest)
- **Autenticação:** usuário/senha com token JWT
- **Infraestrutura:** Docker (backend), Render (deploy do backend), Vercel (deploy do frontend), Supabase (banco de dados)

Para detalhes técnicos completos (arquitetura, modelo de dados, como rodar localmente, como testar, decisões de design), veja **[TECHNICAL.md](./TECHNICAL.md)**.

---

## Estrutura do repositório

```
PersonaLite/
├── src/                    # Backend (.NET) — Clean Architecture
│   ├── PersonaLite.Domain/         # Regras de negócio puras
│   ├── PersonaLite.Application/    # Casos de uso e DTOs
│   ├── PersonaLite.Infrastructure/ # Banco de dados e serviços externos
│   └── PersonaLite.Api/            # Endpoints HTTP
├── client/                 # Frontend (React + Vite, PWA)
├── tests/                  # Testes automatizados do backend
└── Dockerfile               # Usado pelo Render para buildar a API
```

## Início rápido (rodar localmente)

```powershell
# Backend
dotnet restore
cd src/PersonaLite.Api
dotnet ef database update --project ../PersonaLite.Infrastructure --startup-project .
dotnet run

# Frontend (em outro terminal)
cd client
npm install
npm run dev
```

Instruções completas de setup (banco de dados local, variáveis de ambiente, autenticação) estão em **[TECHNICAL.md](./TECHNICAL.md)**.

---

## Status do projeto

Em uso ativo e evolução contínua. Próximos passos planejados: tela de upload de fotos de progresso, gráfico de progressão de carga por exercício, e recuperação de senha.
