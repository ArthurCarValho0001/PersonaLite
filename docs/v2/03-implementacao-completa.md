# V2 local — execução e rastreabilidade

## Autorização e base

O responsável ampliou explicitamente o escopo para a V2 local completa, substituindo a limitação anterior à T01. Branch `codex/v2-local-completa`, baseada em f47657a e preservando testes/documentação não commitados da etapa anterior. A cópia principal com alterações locais permanece intacta. Sem autorização de publicação, push, merge ou acesso a dados reais.

Fontes fornecidas preservadas em `especificacao/`. As descrições de levantamento “não implementado” referem-se à revisão documental original. Resultados reais de implementação serão registrados aqui, sem converter critérios planejados em testes aprovados.

## Decisões locais confirmadas neste chat

- Avatar PNG/JPEG, até 5 MB e 4096×4096 pixels; parâmetros configuráveis.
- Limites por minuto configuráveis para autenticação/códigos, somente como política de teste local.
- Chaves idempotentes preservadas sem exclusão automática.
- Três módulos de aprendizagem com conteúdo fictício identificado, sem alegação de revisão editorial ou orientação clínica.

## Proposta visual antes da implementação (D25)

Preservar `client/public/icon-192.png` e os arquivos atuais da logo. Navegação lateral no desktop e inferior em celulares, com Início, Treinos, Evolução, Aprender e Perfil. Fundo claro #f4f7f5, superfícies brancas, texto #142d2a, verde principal #166b50, apoio azul-escuro #102b35. Tipografia do sistema, títulos claros e controles grandes. Estados de vazio, erro, carregamento, envio e confirmação mantêm conteúdo utilizável. Layout fluido de 360 a 1280 px; foco visível e texto junto a ícones. Proposta apresentada na conversa antes de editar telas.

Inventário: login/cadastro/recuperação; Dashboard; Treinos/configuração; registro/edição de medidas; retrospectiva; perfil/informações/privacidade; catálogo/aula/avaliação/progresso educativos; fila/atualização PWA.

## Lotes e estado — 28/10/2026

Esta é uma branch de integração local, sem PR nem publicação. O documento técnico propõe PRs separados por lote; a separação para revisão/publicação continua necessária. “Implementado” abaixo não significa aceite integral de todos os cenários da especificação.

| Lote | Implementação e evidência local |
| --- | --- |
| T01 bootstrap | Fonte única, abort/timeout, sem reload; 14 testes de autenticação e navegador com um GET |
| T02–T04 treino/resumo | Histórico em lote; POST retorna exercício atualizado; teste sem GET adicional; recordes e total agregados no banco; retrospectiva em lote por identidade estável |
| T05–T06 fila | Conta/ambiente/fuso/chave antes do envio, legado isolado, atenção por erro permanente; recibo e escrita na mesma transação; testes de concorrência e isolamento |
| T07 sessão/códigos | 30 dias absolutos, versão de sessão revogada após redefinição, código criptográfico/15 minutos, consumo transacional, limites configuráveis; integração aprovada |
| T08 mídia | Avatar privado com assinatura/dimensões/tamanho, arquivo anterior preservado em rejeição; upload corporal responde 410; decodificação PNG/JPEG real antes de salvar, incluindo rejeição de PNG sem pixels |
| T09 calendário/histórico | Data/fuso do dispositivo, seleção retroativa, planos antigos, arquivamento sem exclusão; perfil inclui altura e recalcula histórico com entradas/versão; concorrência de medidas testada |
| T10 interface | Layout claro, navegação responsiva, identidade existente; fluxo educativo validado no navegador estreito; revisão completa de acessibilidade/dispositivos pendente |
| T11–T12 aprendizagem | Três módulos fictícios; duas aulas, cinco questões, nota no servidor, elegibilidade, tentativa idempotente e histórico; importação local imutável e retirada testadas |
| T13 exportação | ZIP/CSVs por tipo, snapshot, campos privados restritos e aviso de pendências; download autenticado/isolamento testados |
| T14 PWA | API NetworkOnly, sem skipWaiting/clientsClaim; atualização só após todas as abas fecharem, limpeza apenas do cache antigo; worker real ensaiado em fixture com duas abas, rascunho preservado e zero respostas API em cache; matriz móvel ainda pendente |
| T15 prontidão | Build/testes, backup restaurado em outro banco local, comandos e limitações registrados; nenhuma autorização de produção |

## Alterações principais

- `client/src/components/AppLayout.*`, páginas e estilos: navegação/visual V2 e estados educativos.
- `client/src/pages/Aprender.tsx`, `api/aprenderApi.ts`, domínio/aplicação/repositório/endpoints educativos: estudo, correção, tentativas, versões e histórico.
- `OperacoesMiddleware.cs`, fila offline e cliente HTTP: recibos por usuário, transações, bloqueios de concorrência e reenvio seguro. Resposta tardia de outra sessão não encerra a atual.
- Use cases/repos de treino, `Treinos`, `HistoricoTreinos`, hook selecionável e registro de séries: carga em lote, atualização pontual, calendário e histórico estável.
- Perfil/medidas/avatar/exportação: validação local, recálculo, consulta privada e portabilidade por CSV.
- `Program.cs`, `CatalogoLocal.cs`, `scripts/start-local-api.ps1`: startup sem migrations automáticas; operações administrativas explícitas somente no perfil local guardado.
- Migration `20261028014653_V2AprendizagemIntegridade`: aditiva; tabelas educativas/recibos e colunas de sessão, cálculo e arquivamento. `Down` destrutivo bloqueado.
- Testes e scripts: cenários reproduzíveis abaixo; lockfiles e stack preservados; acrescentada somente StbImageSharp 2.30.16 na infraestrutura para validar decodificação de avatar.

## Comandos e resultados reais

Executados na raiz do worktree `.local-tools/auth-bootstrap` (PowerShell 7). Runtime .NET 8, SDK 10.0.402; Node 22.22.0/npm 10.9.4; PostgreSQL 16.6 local. Os caminhos portáteis constam em `01-ambiente-local.md`.

| Comando | Resultado |
| --- | --- |
| `dotnet build PersonaLite.sln --no-restore` | Êxito, zero erros/avisos |
| `dotnet test PersonaLite.sln --no-build --no-restore` | 17 testes de domínio aprovados |
| `npm test --prefix client` | 19 testes aprovados, incluindo autenticação, fila, respostas atrasadas, atualização pontual e navegação/reenvio da avaliação |
| `npm run build --prefix client` | Êxito, bundle aproximadamente 809 kB; aviso >500 kB permanece |
| `node scripts/validate-v2.mjs` | 24 verificações reais da API/banco local aprovadas |
| `node scripts/measure-v2-local.mjs` | 100 consultas/operação, dez contas simultâneas, API aquecida; p95 catálogo 414,37 ms e histórico educativo 419,55 ms |
| `./scripts/start-local-api.ps1 -CatalogFile .local/catalogo-teste.json` | Nova versão fictícia importada; repetir mesma versão foi recusado |
| `node scripts/validate-catalog-local.mjs` | Retirada bloqueia aula/questionário/novas tentativas e preserva histórico/nota sem conteúdo |
| `pg_restore ... .local/pre-v2.dump` | Restaurado em `personalite_v2_restorecheck`, separado do banco em uso; três contas originais presentes, nenhuma ausente |

O script de integração cria dados fictícios e mantém credenciais/códigos somente em memória. A fase de redefinição lê o código no cluster local fixo, depois de confirmar o e-mail pelo próprio fluxo. Não roda contra URL configurável/produção. Reexecuções próximas podem atingir o limite local de autenticação/códigos; aguardar a janela de um minuto, sem desativar a proteção. O benchmark respeita Retry-After.

Falhas demonstradas e corrigidas: testes de navegação ambíguos após nova barra; temporizador não limpo no ambiente DOM; campo de altura ausente no contrato de edição; parâmetro opcional nulo no comando de catálogo. O teste inicial de redefinição foi corrigido para primeiro verificar o e-mail, preservando a regra existente. Windows PowerShell 5 não suporta a chamada de geração de chave do script: executar em `pwsh`/PowerShell 7. A primeira restauração tentou uma role inexistente; repetida com a role local existente, sem alterar permissões.

## Evidências e execução

- [Integração](evidencias/05-integracao-v2.json), [desempenho](evidencias/06-desempenho-local.json), [restore](evidencias/07-restauracao-local.json), [retirada](evidencias/08-catalogo-retirado.json).
- [Captura do aprendizado local](evidencias/04-aprendizado-local.png): aulas estudadas, avaliação e histórico conferidos pelo navegador.
- Login local neste lote: 311,9 ms da resposta de autenticação ao painel utilizável; um GET `/api/usuario`, zero documentos novos. Amostra única; comparação anterior está em `02-fluxo-autenticacao.md`, não equivale a p95 da jornada.
- O benchmark educativo usa três módulos e uma tentativa/duas aulas por conta, loopback sem rede móvel. Não comprova desempenho de produção ou histórico volumoso.
- API: `http://localhost:5000`; frontend: `http://localhost:5173`.
- Banco guardado pelo script/API: host loopback, porta 55432, nome `personalite_v2_local`. E-mail substituído pelo serviço local. Nenhum segredo real necessário ou incluído neste documento.

## Repetir preparação

1. Iniciar o PostgreSQL isolado conforme `01-ambiente-local.md`; confirmar o nome/host/porta antes de qualquer comando.
2. Compilar: `dotnet build PersonaLite.sln`; `npm ci --prefix client`; `npm run build --prefix client`. Não remover lockfiles.
3. Somente se houver migrations pendentes, com backup local: `./scripts/start-local-api.ps1 -ApplyMigrations`. O comando aplica e termina; não inicia o servidor. Sem essa opção, startup recusa esquema pendente.
4. Iniciar API: `./scripts/start-local-api.ps1` (usa binários já compilados; uma chave descartável por execução encerra sessões locais após restart).
5. Iniciar frontend: `npm run preview --prefix client -- --host 127.0.0.1 --port 5173`.
6. Executar testes/comandos da tabela e usar apenas contas fictícias.
7. Catálogo: arquivo JSON local com os campos de `ModuloVersao`, `Demonstracao=true`, ID novo, versão crescente e `ConteudoJson` válido (duas aulas/cinco questões/quatro opções). `-CatalogFile` importa; `-WithdrawVersion <UUID>` retira sem excluir histórico. Não existe editor público nem processo de aprovação editorial inventado.

A restauração comprovada usa o backup anterior à V2, sem dados novos de aprendizado. Não é rollback de produção nem comprovação de RTO. Preserve esquema aditivo e dados; não executar downgrade destrutivo. Leia `04-prontidao-local.md` antes de propor publicação.
## Limites que continuam exigindo decisão/evidência

Regularização de duplicidades reais e fila legada sem dono; responsável e conteúdo editorial real; validação em dispositivos iOS/Android; infraestrutura, RTO e ensaios de publicação. Nenhum desses pontos autoriza descarte de dados ou alegação de conformidade/recuperação comprovada.

## Complementos de validação

O avatar passou em três situações reais: PNG válido; texto com extensão de imagem rejeitado; PNG com cabeçalho/dimensões válidos mas sem chunks de pixels rejeitado. O arquivo anterior permaneceu idêntico. A dependência fixada [StbImageSharp 2.30.16](https://www.nuget.org/packages/StbImageSharp/2.30.16) é usada somente para decodificação, após os limites estruturais; [documentação do projeto](https://github.com/StbSharp/StbImageSharp). A fonte externa foi consultada para API/compatibilidade da biblioteca, sem acrescentar requisitos de produto ao levantamento.

PWA: `node scripts/serve-pwa-check.mjs`, origem isolada `localhost:5174`, usa o `sw.js` real do build. Duas abas controladas; consulta a API fictícia; nova versão do script mantida em `waiting`; mesmo documento e rascunho preservados. Fechar apenas uma aba não ativou; após fechar ambas, a nova abertura exibiu worker ativo sem espera. Entradas de `/api/` no Cache Storage: zero. Evidência: `09-pwa-aguardando.png`. O fixture não substitui o ensaio completo de fila/quiz nos dispositivos reais.

Interface observada em 1280×900 e 360×800; catálogo móvel sem transbordamento horizontal (largura de conteúdo igual à largura útil). Viewport temporário restaurado. `10-v2-desktop.png` registra os três módulos no preview normal. O servidor de medição foi encerrado; `npm run preview` serve o build normal em 5173, com registro PWA habilitado.

## Retomada em 29/10/2026

A tentativa anterior de iniciar a API foi bloqueada por esgotamento do serviço de revisão automática, sem execução do comando. Na retomada, o mesmo comando autorizado iniciou normalmente a API em loopback com a guarda do banco local. O último ajuste de tratamento de erros foi validado: 25 verificações da API passaram, incluindo cinco reenvios simultâneos da mesma série sem duplicação.

`./scripts/validate-export-local.ps1` abriu o ZIP da conta fictícia e verificou os dez CSVs por tipo, um perfil/uma medida, 14 circunferências e sete dobras, ausência de campos de credencial/avatar e proteção do nome fictício `=1+1` contra interpretação como fórmula. Resultado em `evidencias/11-exportacao-local.json`. O pacote foi gerado do servidor, sem pendências locais.

O aceite integral da especificação continua pendente dos cenários listados em `04-prontidao-local.md`; esta documentação não declara a V2 pronta para produção. A rodada de QA e o merge local solicitados posteriormente estão registrados em `04-prontidao-local.md`. Não houve push nem deploy.
