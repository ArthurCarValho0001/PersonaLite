# Preparação de publicação da V2

Atualização: 29/10/2026. Branch de trabalho `codex/v2-preparacao-publicacao`, baseada em `main` local `67c4b1a`. Esta etapa não fez push, deploy, migração ou escrita em produção. O responsável autorizou manter os três módulos com **conteúdo fictício identificado** nesta fase; isso não equivale a revisão editorial de conteúdo real.

Após `git fetch origin`, `origin/main` continuava em `f47657a`; a `main` local está dois commits à frente. Isso confirma apenas o Git remoto, não a revisão de fato implantada nos serviços.

## 1. Decisões operacionais e configuração

As decisões D12 (retenção/armazenamento de imagens), D18 (limites de autenticação), D19 (retenção de recibos de reenvio), D27 (observabilidade), D28 (e-mail) e D32 (proteção de conteúdo/retentativas) seguem abertas para produção. Os valores atuais de imagem e limites foram autorizados somente como parâmetros locais configuráveis. D04, D20, D24, D26 e D29 ainda têm aspectos de dados legados, plataformas ou recuperação não resolvidos. O conteúdo educativo fictício deve manter o aviso de demonstração em toda interface e no pacote importado.

Antes de publicar, conferir no painel dos serviços, sem copiar segredos para esta documentação:

| Camada | Verificação necessária |
| --- | --- |
| Vercel | Revisão publicada, branch e comportamento do deploy automático; `VITE_API_BASE_URL`; domínio e política de cache/PWA |
| Render | Plano, região, número de instâncias, CPU, saúde, deploy automático e capacidade de manter versão antiga disponível durante troca; `Jwt__SecretKey` estável e CORS |
| Supabase/PostgreSQL | Região, versão, backup/restauração, limites de conexões, índices reais, tempo de migração e papel de acesso de leitura para auditoria |
| Mídia | Destino real de `Armazenamento__PastaFotos`, persistência entre deploys e instâncias, backups, acesso privado e referências legadas |
| E-mail | Provedor e remetente configurados, serviço de teste em homologação, supressão de destinatários reais durante ensaios |

O `Dockerfile` usa .NET 8; a Vercel e o Render são descritos no repositório como vinculados à `main`. **Confirmar isso nos painéis antes de qualquer push**: se os dois serviços publicarem automaticamente ao mesmo tempo, a API V2 recusará iniciar enquanto a migration estiver pendente. A aplicação atual também não demonstra por si só RPO zero ou implantação sem interrupção perceptível.

Foi acrescentado `.dockerignore` com inclusão apenas dos quatro projetos .NET, `Dockerfile` e `NuGet.Config`, excluindo também saídas de build e arquivos locais de ambiente/chaves. O `Dockerfile` usa `COPY . .` e antes não havia filtro do contexto local. A regra segue a [documentação de contexto do Docker](https://docs.docker.com/build/concepts/context/); **o build da imagem ainda não foi executado**, porque o CLI Docker não está disponível nesta máquina. Validar o contexto e a imagem em homologação antes de usar no Render.

`dotnet publish src/PersonaLite.Api/PersonaLite.Api.csproj -c Release -o .local/publish-qa --no-restore /p:UseAppHost=false` passou e produziu a API Release local. Isso valida a publicação .NET, mas não substitui `docker build` nem o teste da imagem final.

## 2. Auditoria e ensaio de migração

Foi criado `scripts/audit-v2-readonly.sql`: transação somente de leitura, timeout, contagens agregadas de dados/duplicidades/órfãos, índices e migrations. `scripts/audit-v2-local.ps1` fixa host `127.0.0.1`, porta `55432`, usuário e dois bancos locais permitidos. Não exporta identificadores, nomes, e-mails, hashes ou caminhos de arquivos. Uma execução futura contra produção exige acesso de leitura autorizado e verificação da conexão real; o wrapper local não aceita esse destino.

| Ensaio local | Resultado observado |
| --- | --- |
| Restauração anterior à V2, `personalite_v2_restorecheck` | 3 contas fictícias, 5 migrations, zero medidas/planos/sessões/fotos; zero grupos duplicados ou órfãos nesse conjunto pequeno |
| Banco V2 de testes, `personalite_v2_local` | Na auditoria: 35 contas fictícias, 8 medidas, 10 planos/sessões e 6 migrations; zero grupos duplicados ou órfãos na amostra |
| Cópia `personalite_v2_migration_qa` | Criada a partir da restauração anterior, migration `20261028014653_V2AprendizagemIntegridade` aplicada explicitamente; 6 migrations e tabela nova presentes |
| Preservação | Antes/depois da migration: contagens, IDs e hashes de acesso das três contas fictícias iguais; comparação feita em memória, sem imprimir hashes |
| API anterior `f47657a` no esquema expandido | Build aprovado; iniciou em `127.0.0.1:5001`, saúde 200, cadastro fictício e GET `/api/usuario` aprovados. Instância encerrada após o ensaio |

Os comandos executados foram `./scripts/audit-v2-local.ps1`, `./scripts/audit-v2-local.ps1 -Database personalite_v2_local`, `createdb -T personalite_v2_restorecheck personalite_v2_migration_qa`, `dotnet-ef database update --no-build` com conexão explícita para essa cópia, e um build da revisão anterior extraída em `.local`. A primeira tentativa de build legado no sandbox não trouxe erro de compilação e falhou na execução; o restore/build fora do sandbox passou com zero avisos/erros. O teste de API antiga cobre apenas as rotas citadas, não todos os clientes concorrentes.

**Ainda necessário com dados reais, em leitura:** executar auditoria de duplicidades/índices/migrations e conferir volume, retenção de mídia e um backup restaurável. Não criar UNIQUE, remover/fundir registros, usar `Down()` da migration, nem copiar dados pessoais para o Git. Uma cópia de homologação precisa de anonimização e controle de acesso definidos antes de ser criada.

## 3. QA de aceite

Os resultados existentes estão em `03-implementacao-completa.md` e `04-prontidao-local.md`: 17 testes .NET, 19 testes de frontend, 25 verificações integradas, build de ambas as partes, exportação CSV e PWA de duas abas no navegador local. Em 29/10, `node scripts/qa-v2-publicacao.mjs` passou em **8 verificações adicionais** com dados fictícios: rota protegida, cadastro concorrente normalizado, login inválido, cadastro de menor, acesso e edição cruzados de medida, conflito de data e preservação após conflito. Resultado sanitizado em `evidencias/13-qa-publicacao.json`.

| Critério | Estado |
| --- | --- |
| Regressões automatizadas e fluxos locais básicos | Evidência parcial aprovada nos comandos acima |
| Matriz RF01–RF23 e cenários transversais de `especificacao/07-aceite.md` | **Pendente** de rastreio por cenário, execução e evidência; não inferir aprovação por testes agregados |
| PWA com formulário, avaliação e fila pendentes em duas abas/instalado | Ensaio parcial anterior; completar em dispositivos definidos |
| Android/iOS reais, leitor de tela, teclado, zoom e navegadores | **Pendente**; definir versões/aparelhos de D26 |
| Falha entre gravações, reenvio após reinício, clientes antigos e novos simultâneos | **Pendente**, além da compatibilidade básica da API antiga já observada |
| Históricos grandes, exportação integral e desempenho de login/cadastro | **Pendente** de fixtures representativas e medição autenticada em homologação |

Falha em qualquer cenário crítico gera correção e nova execução do cenário antes da publicação. O conteúdo fictício não deve ser apresentado como conselho clínico ou curso editorialmente aprovado.

## 4. Plano de implantação e reversão — a ensaiar

1. Confirmar commits realmente publicados, configurações e deploy automático nos painéis. Definir responsável, janela, comunicação e critérios de interrupção. A `main` local não está no remoto.
2. Definir homologação isolada com dados fictícios ou anonimizados, e-mail simulado e mídia própria. Ensaiar backup e restauração do banco **e** arquivos; medir tempos. Decidir RTO após conhecer custos e recursos disponíveis. RPO zero continua objetivo não comprovado.
3. Em homologação, auditar esquema/dados, obter backup consistente, aplicar a migration **explicitamente** e verificar contagens, vínculos e dados. A API V2 não aplica migrations ao iniciar e recusa esquema pendente. O `Down()` da V2 é deliberadamente bloqueado para evitar perda de dados.
4. Ensaiar ordem de troca: esquema expandido → API V2 saudável → frontend V2. Testar API anterior e V2 durante a transição, chamadas em andamento, sessões, fila offline, PWA instalado e arquivos. Verificar se a infraestrutura sustenta sobreposição real de versões; se não, apresentar alternativa e impacto antes de prometer ausência de interrupção.
5. Definir sinais de avanço/parada: taxa de 5xx/429, saúde e latência autenticada de cadastro/login/treino, erros de banco, backlog de sincronização e acesso à mídia; registrar valores de referência em homologação. Logs não devem conter corpo de requisição, token, código, endereço pessoal ou dados de saúde.
6. Ensaiar reversão de frontend e API **mantendo o esquema expandido** e os dados V2. Reverter apenas a API enquanto o frontend V2 permanece ativo pode quebrar novas rotas; a reversão deve ser coordenada e testada. Não executar downgrade destrutivo nem restaurar backup por cima de dados confirmados depois da implantação.
7. Somente após evidências de homologação, decisões de dados/mídia/recuperação e aceite dos cenários críticos: planejar push e publicação, observar sinais definidos e registrar o resultado. Este documento não executa nem autoriza esse passo final automaticamente.

## Bloqueios atuais para produção

Faltam auditoria de dados reais, informação verificada dos provedores/planos/regiões e da persistência de mídia, estratégia de migração sem corrida entre deploys, homologação e reversão ensaiadas, matriz de QA em dispositivos reais e política operacional para as decisões abertas. A amostra pré-V2 restaurada tem somente três contas e nenhum histórico; não representa o volume ou as anomalias possíveis em produção.
