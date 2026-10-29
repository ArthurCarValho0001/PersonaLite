# HAR após merge da V2: latência e rotas ausentes

Análise em 29/10/2026 do HAR Firefox fornecido pelo responsável. O arquivo original contém dados de sessão e permanece fora do Git. As contagens abaixo usam somente método, rota sem parâmetros pessoais, status e tempos. Branch local desta análise: `codex/v2-har-layout`, criada de `origin/main` em `517a97c` após o merge do PR #9. Nenhum deploy, migration ou escrita em produção foi executado nesta análise.

## Requisições acima de 500 ms

O HAR contém 64 entradas: 19 acima de 500 ms, 29 respostas 200, 28 respostas 204 e 7 respostas 404. As durações são do navegador e não medem o tempo de SQL isoladamente.

| Rota | Ocorrências acima de 500 ms / total | Duração observada |
| --- | ---: | ---: |
| `GET /api/progresso/resumo` | 3/3 | 663–6.870 ms; mediana 3.742 ms |
| `GET /api/retrospectiva` | 2/2 | 5.932–6.550 ms |
| `GET /api/medidas/reavaliacao-pendente` | 2/3 | até 5.321 ms |
| `GET /api/medidas` | 2/3 | até 5.229 ms |
| `GET /api/trimestre/atual` | 2/3 | até 5.225 ms |
| `GET /api/trimestre/sugestao-troca` | 2/3 | até 5.213 ms |
| `GET /api/usuario/avatar/arquivo` (404) | 2/4 | até 3.022 ms |
| `GET /api/treino-do-dia` | 1/1 | 1.298 ms |
| `GET /api/dias-treino/:id/treino-do-dia` | 1/1 | 1.172 ms |
| `OPTIONS /api/usuario/avatar/arquivo` | 1/4 | 988 ms |
| `POST /api/auth/login` | 1/1 | 767 ms |

Em todas as 19 entradas lentas, a maior parte da duração está na fase `wait` do HAR. Um grupo de GETs iniciado praticamente ao mesmo tempo demorou cerca de 5,2 s em rotas diferentes. Isso indica espera comum do lado da API ou banco, mas não identifica sozinho CPU, pool, rede API–banco ou consultas SQL. Os dois GETs de retrospectiva demoraram cerca de 6 s em momentos diferentes e merecem medição própria. Não houve amostra suficiente para p95 ou para afirmar melhora em produção.

## Sete respostas 404

| Rota | Quantidade | Diagnóstico |
| --- | ---: | --- |
| `GET /api/usuario/avatar/arquivo` | 4 | Rota de leitura adicionada na V2; a API antiga só oferece envio de avatar. |
| `GET /api/planos-treino/historico` | 1 | Rota adicionada na V2. |
| `GET /api/aprender/modulos` | 2 | Rota adicionada na V2. |

As três rotas continuaram retornando 404 em consultas públicas pontuais, sem autenticação (0,230 / 0,557 / 0,209 s, respectivamente); `/api/saude` retornou 200 em 0,249 s. Os logs de deploy fornecidos pelo responsável explicam a divergência: o build e o publish da imagem V2 terminaram sem erros às 19h14, mas a nova API saiu ao iniciar com `InvalidOperationException: Existem migrations pendentes. Aplique-as explicitamente antes de iniciar a API.` O Render manteve a versão anterior. Portanto, esses 404 **não comprovam perda de avatar**: o frontend V2 está chamando uma API anterior. As consultas públicas de confirmação foram apenas GETs, sem carga.

## Correção operacional necessária antes de medir a V2 publicada

1. Identificar no Render a revisão do serviço e confirmar que o deploy falhado corresponde ao merge `517a97c`. Confirmar também o destino do PostgreSQL e as migrations pendentes por ID, sem copiar connection strings para logs ou Git.
2. Executar a auditoria de dados e índices reais, conferir backup restaurável e ensaiar a migration em ambiente isolado. O roteiro e os limites estão em `05-preparacao-publicacao.md`. O comando `--apply-local-migrations` do aplicativo **só aceita** o perfil local isolado; não é comando de produção.
3. Planejar uma janela coordenada: aplicar explicitamente apenas as migrations verificadas por um operador com acesso ao banco, verificar contagens e vínculos, então redeploy da API V2. O aplicativo deliberadamente recusa esquema pendente no startup. Não usar `Down()` como reversão automática; preservar o esquema expandido e os dados confirmados.
4. Confirmar que as rotas V2 respondem com a semântica esperada após autenticação e que o frontend e a API publicados estão na mesma revisão. Repetir medição autenticada com conta fictícia, na mesma rede e cenário do HAR, registrando rota, duração da API, contagem/duração SQL, espera por conexão, CPU/memória e região API–banco. Não registrar token, corpo ou dados pessoais.
5. Priorizar `/api/retrospectiva` e `/api/progresso/resumo` se permanecerem acima de 500 ms com a V2 ativa. A V2 já contém busca de recordes em lote e projeção do período, mas o HAR mediu a API anterior; não atribuir ganho a essas mudanças antes de nova medição. Para os GETs simultâneos, verificar pool/conexões e recursos da instância antes de alterar consultas sem evidência.

## Alterações locais de interface

O bloco **Último treino** foi alinhado aos cartões claros e à paleta verde do site, sem emojis no bloco, mantendo suas informações e o botão de expansão. A página **Aprender** recebeu três cartões estáticos com amostras explicitamente fictícias, visíveis mesmo se o catálogo estiver indisponível; eles não fingem progresso, não substituem as aulas da API e não trazem recomendações de saúde.

Esses ajustes locais não resolvem a latência medida no serviço antigo. O próximo dado decisivo é a execução segura da migration e uma nova captura autenticada após o deploy completo da API V2.

## Validação desta branch

- `npm test --prefix client`: 21 testes passaram, inclusive catálogo indisponível com prévias visíveis e expansão do bloco Último treino.
- `npm run build --prefix client`: TypeScript e Vite/PWA concluíram com código 0. O Vite avisou que o bundle principal excede 500 kB; não foi feito fracionamento nesta alteração visual.
- `git diff --check`: sem erros de espaço/formatação.

Não houve ensaio visual em dispositivo físico nem medição autenticada nova. A API e o banco locais não foram alterados ou iniciados nesta branch.
