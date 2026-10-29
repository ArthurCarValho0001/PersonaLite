# PersonaLite V2 — Especificação técnica e rota de desenvolvimento

**Versão:** 1.0 — 28/10/2026
**Base de código revisada:** `ArthurCarValho0001/PersonaLite`, commit `23ab62d46a77683f38df72c38d8b2785ea19bce8`
**Estado:** especificação para desenvolvimento local. Sem alterações ou publicação em produção.

## 1. Objetivo e limites

Evoluir o PWA PersonaLite que já tem usuários diários. Preservar todas as contas e históricos, manter as tecnologias existentes e entregar uma experiência redesenhada, incluindo a área educativa ligada às ODS 3 e 4. A primeira implementação deve ocorrer localmente, com PostgreSQL isolado e dados fictícios.

Esta especificação define o resultado esperado, as interfaces, os dados, as proteções e a ordem do trabalho. Os arquivos `02_Decisoes_Pendentes.md`, `03_Requisitos_Funcionais.md`, `04_Regras_Qualidade_e_Estados.md`, `05_Dados_e_Contratos.md` e `07_Aceite_e_Rastreabilidade.md` permanecem a fonte detalhada de requisitos e critérios. Em divergência, usar a decisão explícita mais recente registrada em `09_Respostas_do_Responsavel.md`; não assumir como aprovada uma recomendação técnica.

## 2. Estado observado e limitações da revisão

A base consultada contém frontend React/TypeScript com Vite, PWA e IndexedDB; backend ASP.NET Core/.NET com EF Core e PostgreSQL; autenticação JWT. A revisão foi estática, ancorada no commit indicado. Não acessamos dados, configuração privada, plano do Render/Supabase, logs autenticados ou deploy atual. A correspondência entre commit e produção precisa ser verificada antes de qualquer publicação.

Achados a tratar ou caracterizar:

- `Program.cs` executa `Database.Migrate()` no startup. Isso acopla a disponibilidade da API à conexão e às migrations.
- `offlineQueue.ts` guarda operações sem titular/ambiente explícito; o hook reenvia com a identidade autenticada no momento. Há risco de fila associada à conta errada.
- A chave local de operação não é enviada como idempotency key do servidor; uma confirmação perdida pode duplicar gravações.
- Os mapeadores de treino consultam histórico sequencialmente por exercício; o resumo percorre históricos e materializa dados em memória.
- Salvar uma série dispara novo GET do treino inteiro e a página oculta a lista enquanto carrega.
- App e telas repetem busca do usuário; login/cadastro navegam e recarregam a página inteira.
- A rota de foto corporal não confirma titularidade da medição no caso de uso. Escopo futuro: somente avatar; bloquear novos envios corporais no servidor.
- A configuração de cache PWA encontrada cobre `localhost:5000`, não prova cache eficaz do serviço publicado. Não colocar respostas privadas em cache compartilhado.
- Manifesto indica React 19 e tipos React 18, além de dependência local `client:file:`. Reproduzir instalação/build e corrigir apenas incompatibilidades demonstradas, preservando lockfile.
- Migrations consultadas não provam os índices efetivamente existentes no PostgreSQL de produção. Auditar índices/duplicatas antes de impor unicidade.
- A amostra pública anterior não mediu endpoints autenticados de cadastro, login, treino ou histórico; hipótese de cold start continua hipótese.

## 3. Arquitetura alvo sem troca de stack

Manter o cliente PWA React/TypeScript/Vite, API .NET, EF Core e PostgreSQL. Preservar separação por camadas já existente: UI → clientes/hooks → endpoints → casos de uso → interfaces de persistência → repositórios/DbContext. Não introduzir framework, serviço pago, provedor ou arquitetura distribuída sem justificativa e decisão.

Regras de titularidade, validação, autorização, conclusão, cálculo, pontuação, idempotência e elegibilidade pertencem ao servidor. O frontend apresenta estado, coleta entradas, envia comandos e reconcilia a resposta. O cliente nunca decide nota, resultado corporal ou acesso autorizado.

Desenvolvimento local:

- branch curta por tarefa, baseada na `main` conferida; primeiro verificar `git status` e preservar mudanças do operador;
- conexão própria para PostgreSQL local, sem usar dados nem segredos de produção;
- dados fictícios e serviços externos simulados; e-mail de teste não pode alcançar usuários reais;
- configurações/secrets fora do Git; amostras contêm nomes de variável e placeholders;
- nenhum deploy, merge ou migration executado contra produção como parte da especificação.

## 4. Escopo funcional completo

### 4.1 Conta, sessão e perfil

- Cadastro permitido em qualquer idade. Validar formato de nascimento e impedir data futura, sem idade mínima.
- Nome de usuário normalizado e único sob concorrência. E-mail opcional; quando informado, único. Antes de constraint nova, inventariar conflitos sem fundir/bloquear/excluir contas automaticamente.
- Login e cadastro não recarregam toda a página. Estado autenticado/usuário é carregado uma vez e reutilizado por telas. Logout limpa credenciais e estado visível da sessão.
- Sessão de até 30 dias. Redefinição de senha invalida no servidor todos os acessos existentes e exige autenticação nova, inclusive no dispositivo de recuperação.
- Consumo de código, gravação de senha e revogação devem ser atômicos. Não reduzir segurança PBKDF2 por atalho de performance; medir duração e pressão de CPU.
- Todas as operações derivam titular da sessão. Não confiar em `usuarioId` enviado pelo frontend para autorização.

### 4.2 Treinos e desempenho

- Conclusão automática quando a meta de séries for atingida, mantendo conclusão manual válida antes da meta quando houver séries.
- Editar/remover séries depois de concluir mantém conclusão e recalcula métricas. Se não restarem séries, conservar sessão/conclusão e apresentar indisponibilidade de métricas sem inventar valores.
- Permitir data anterior sem limite de dias. Preservar data escolhida e contexto original na fila/reenvio.
- Remover exercício arquiva; histórico, identidade, séries e sessões permanecem consultáveis. Treino atrasado pode ser associado ao exercício original arquivado/plano encerrado sem reabrir plano, reativar exercício ou mover ao plano vigente.
- Reduzir consultas sequenciais por exercício: buscar históricos necessários em lote com projeções e filtro de titular. Não usar `Task.WhenAll` no mesmo `DbContext`.
- Reescrever resumo/recordes para agregação e lote no PostgreSQL, preservando semântica atual de nome/data, drop sets e critérios de recorde. Fazer testes de equivalência antes de trocar implementação.
- Após POST de série confirmado, atualizar o exercício afetado com resposta do servidor; não desmontar lista inteira. Não repetir POST incerto sem idempotência.

### 4.3 Medidas corporais

- Manter formulário completo atual: peso, quatorze circunferências e sete dobras, com validação de unidade/faixa no servidor.
- Uma medida por titular/data de negócio, permitindo editar a existente. Criação simultânea e mudança de data não podem criar duplicidade.
- Auditar duplicatas históricas antes de índice único. Preservar registros até política de regularização; sem exclusão ou fusão automática.
- Corrigir dado de perfil usado em cálculos recalcula todo o histórico daquela conta, gráficos e resumos. Preservar medidas brutas/datas/vínculos, registrar perfil/fórmula usados e não publicar resultados parcialmente recalculados.
- Rejeitar leitura/edição de medida de outra conta.

### 4.4 Imagens

- Somente avatar pode receber novos uploads nesta entrega. Bloquear endpoint corporal diretamente na API, não apenas remover botão.
- Confirmar que o avatar pertence ao usuário, validar bytes reais, limite/dimensões (D12 ainda precisa definição), salvar em armazenamento persistente privado e servir por autorização.
- Preservar arquivos históricos; exportação não inclui avatar. Não retornar caminho físico do servidor.

### 4.5 Aprender — ODS 3 e 4

- Área autenticada com três módulos gratuitos iniciais, cada qual com duas aulas e avaliação de cinco questões/quatro opções/uma correta.
- Módulos e aulas em ordem livre. Questionário só libera após as duas aulas estudadas na mesma versão do mesmo módulo.
- Marcação de aula exige ação explícita, é por titular/aula/versão e idempotente. Abrir texto não comprova estudo.
- Nota no servidor: acertos/5 × 100; mínimo 80% (quatro acertos). Tentativas ilimitadas com histórico; resultado inferior posterior não remove conclusão anterior.
- Atualização da versão mantém conclusão suficiente no mesmo módulo e mostra aviso; não copia aulas, tentativas ou notas antigas para a versão nova. Estudo da nova versão é opcional; sua avaliação exige as duas aulas dela.
- Respostas de questionário não enviadas existem apenas em memória de tela. Avisar antes de navegação controlada; confirmar saída descarta. Não persistir rascunho local/servidor. Após envio confirmado ou resposta perdida, recuperar pela chave idempotente.
- Módulo retirado: somente histórico próprio de estudos, notas e tentativas em leitura. Sem aulas antigas, novas tentativas ou estudo da versão retirada.
- Revisão/publicação de conteúdo pela equipe; pessoa final de liberação ainda será indicada. Sem responsável/revisão/fontes registrados, usar apenas conteúdo fictício.
- Não afirmar desfecho clínico, melhoria de saúde ou aprendizagem por contagem de acessos/acertos. Conteúdo precisa de fontes e revisão registradas.

### 4.6 Exportação

- Ação de conta da primeira entrega: exportar somente dados já confirmados no servidor em CSV separados por tipo. Não incluir avatar, credenciais, hashes, tokens, códigos ou pendências locais.
- Ao detectar fila pendente neste dispositivo, avisar que não consta no arquivo; não obrigar sincronização nem afirmar que o servidor conhece pendências de outros dispositivos.
- Arquivo privado do titular, data/hora de referência, versão do esquema, unidades, datas e IDs relacionais documentados. Proposta de pacote: ZIP com CSVs UTF-8 e dicionário. Proteger conteúdo CSV de interpretação como fórmula em planilhas.
- Encerramento de conta fora do escopo.

## 5. Contratos de API e persistência

Antes de codificar, documentar os contratos atuais e evitar renomear rotas existentes sem necessidade. Novas rotas de aprendizagem devem separar consulta de comandos e nunca devolver gabarito antes da submissão.

Entidades candidatas a validar contra o domínio atual: `ModuloEducativo`, `ModuloVersao`, `AulaVersao`, `QuestionarioVersao`, `QuestaoVersao`, `AlternativaVersao`, `AulaEstudada`, `Tentativa`, `RespostaTentativa`, `ProgressoModulo`, `OperacaoProcessada`. Não adicionar colunas/tabelas por cópia cega: fechar diagrama/restrições antes da migration.

Regras de persistência:

- titular obtido da autenticação;
- FK/índices para consultas por conta, versão e data;
- constraints concorrentes para unicidade escolhida, depois de auditar dados;
- tentativa, respostas e progresso salvos em uma transação;
- operação idempotente armazena titular, tipo, chave e hash do payload; mesma chave/payload retorna resultado original, payload divergente resulta conflito;
- série/medida guarda chave antes do primeiro envio, online ou offline;
- filas identificadas por conta e ambiente; legacy sem dono é isolada, jamais atribuída ao próximo login;
- treinos atrasados mantêm data e associação histórica no envio posterior;
- recálculo corporal publica conjunto consistente, sem valores misturados.

Erros estáveis: 400 validação, 401 sessão, 404 ausente/não autorizado sem revelar titular, 409 conflito/idempotência, 429 limite e 5xx falha genérica com trace ID. Logs nunca incluem senha, token, corpo do questionário, medidas ou conteúdo pessoal.

## 6. Frontend e experiência

- Redesenho completo, preservar arquivo/logo atual e explorar melhor a paleta. Elaborar inventário de telas/estados e proposta visual antes de migrar interface.
- Componentes compartilhados para layout, navegação, campos, alertas, diálogos, estados de carregamento, erros, vazio e confirmação. Manter acessibilidade, foco visível, teclado, rótulos, contraste, zoom e dados de gráficos em texto.
- Responsividade para iOS, Android e navegadores; registrar sistema, navegador, versão, aparelho e modo instalado/aba na matriz.
- Loading deve preservar conteúdo útil já renderizado quando revalidar. POST não dispara GET global sem razão; atualização local depende de resposta confirmada e reconciliação explícita.
- Compartilhar usuário autenticado em um estado/provider coerente; evitar `useUsuario` duplicado. Cancelar GET obsoleto ao trocar página/identidade. Definir timeout e estado de operação demorada sem cancelar comando que possa ter sido confirmado.
- PWA: não ativar atualização enquanto formulários alterados, operações em voo ou fila pendente, incluindo outras abas que compartilham service worker. Baixar pode ocorrer antes; ativação espera segurança. Não cachear APIs privadas sem desenho de isolamento por titular e limpeza no logout.
- Nenhuma idade mínima; validação de datas continua. Conteúdo e domínio das fórmulas para diferentes idades devem ser avaliados e comunicados sem inventar aconselhamento.

## 7. Performance: ordem de investigação e mudança

Separar medidas: cold start, autenticação HTTP, GET do usuário, SQL, PBKDF2, tela utilizável e API–banco. Sem token/segredo no log. Não usar respostas 401/saúde como substituto do fluxo autenticado.

1. **Autenticação/bootstrap UI:** remover `window.location.reload()` após login/cadastro e compartilhar GET do usuário. Medir antes/depois.
2. **GET treino N+1:** lote de consultas históricas e projeções; preservar semântica e provar contagem de SQL não cresce linearmente com N.
3. **POST série:** atualizar item afetado mantendo cards visíveis; reenvio só com idempotência.
4. **Resumo/recordes:** agregação em banco e consultas em lote; testes de equivalência, inclusive drop set.
5. **Auditoria de índices:** conferir índices reais e `EXPLAIN` read-only. Nunca criar UNIQUE sem auditoria nem executar análise de escrita em produção.
6. **Bootstrap e chamadas frontend:** remover consultas redundantes, usar cancelamento seguro, medir p50/p95 de jornada completa.
7. **Infra:** verificar plano, suspensão, região, CPU/memória, conexões/pool, startup migrations e armazenamento. Isso requer acesso do responsável aos painéis; não presumir plano Free ou latência de região.
8. **Bundle:** dividir rotas somente após medir primeiro carregamento mobile; não confundir com consultas lentas.

Instrumentar rota normalizada, status, duração, trace ID, contagem/duração SQL, CPU de hashing e tempo de conexão. Sem corpo, parâmetros pessoais ou credenciais. A comparação deve usar dados fictícios 1/8/20 exercícios e histórico pequeno/grande, aquecido e após pausa. Produção: observação passiva autorizada, sem teste de carga ou escrita sintética.

## 8. Banco, migração e produção

A versão atual permanece atendendo usuários durante implementação. Não alterar produção nesta rota.

- Desenvolvimento exclusivamente local, banco separado e dados fictícios.
- `Database.Migrate()` no startup precisa ser substituído por processo explícito e compatível antes de estratégia de troca sem interrupção. Não remover às cegas: primeira identificar como publicar/migrar hoje.
- Evolução expand/contract: adicionar esquema compatível, manter API/clientes antigos, migrar dados com ensaio, trocar aplicação, observar, retirar legado só depois de comprovar não uso.
- Nunca recriar banco, renumerar usuários, apagar históricos, resetar senhas, ou copiar dados de produção ao Git.
- Índices novos só após auditar duplicatas e examinar planos em ambiente adequado. Restrições escolhidas devem refletir decisão aprovada.
- RPO zero e implantação sem interrupção perceptível são objetivos, não garantias. RTO está adiado para avaliação de custos. Aplicação e banco são serviços separados, provedores/recursos ainda a inventariar.
- Antes de release: plano com compatibilidade de schema/API, sessões, filas, arquivos, requisições em curso, health checks, rollback e evidências. Sem contratação ou mudança de plano sem decisão.

## 9. Segurança, privacidade e confiabilidade

- Authorization server-side para todas as leituras e escritas; teste A contra B em contas, avatar, medida, exportação, sessões, fila, aprendizagem.
- Revogar tokens existentes após reset de senha no servidor, em todas as instâncias.
- Login/recuperação/code/quiz com limitação a definir; códigos criptograficamente aleatórios e uso único atômico.
- Upload valida bytes, dimensão, tamanho, titularidade e armazenamento. Negar corpo por rota direta.
- `Origin`, CORS e cache não substituem autenticação. Não adicionar cabeçalho/cache para acelerar dados privados.
- Chaves idempotentes e limites de retentativa contra duplicidade. Erro de rede não prova que servidor não confirmou operação.
- Exportação não expõe IDs de terceiros, dados não confirmados localmente ou credenciais.

## 10. Estratégia de branch e entregas

Uma tarefa por branch curta, um objetivo por PR, revisão e evidência antes da próxima.

| Ordem | Branch sugerida | Meta |
|---|---|---|
| T01 | `perf/v2-auth-bootstrap` | remover reload/login e GET duplicado, testes e medição local |
| T02 | `perf/v2-treino-batch-history` | resolver N+1 do GET treino com equivalência |
| T03 | `perf/v2-serie-local-update` | atualizar exercício após POST sem refetch global; depende de idempotência/resultado confirmado |
| T04 | `perf/v2-resumo-agregado` | recordes/contagem agregados no Postgres, teste semântico |
| T05 | `fix/v2-offline-identity` | titular/ambiente na fila, migração isolada do legado e troca segura de conta |
| T06 | `fix/v2-idempotency` | chaves de série/medida persistidas no servidor e proteção concorrente |
| T07 | `fix/v2-auth-revocation` | 30 dias e revogação global pós-reset |
| T08 | `fix/v2-media-avatar` | avatar privado seguro; recusar novos uploads corporais |
| T09 | `feature/v2-physical-rules` | calendário, histórico arquivado, recálculo, medição/data |
| T10 | `design/v2-redesign-system` | proposta visual, logo preservada, componentes e protótipo |
| T11 | `feature/v2-learning-catalog` | entidades e consulta de catálogo versionado |
| T12 | `feature/v2-learning-progress` | aulas, quiz, transação, histórico, módulo retirado e update |
| T13 | `feature/v2-data-export` | pacote CSV titular/servidor sem avatar e aviso de fila |
| T14 | `fix/v2-pwa-safe-update` | atualização adiada com trabalho em curso, abas/fila |
| T15 | `docs/v2-release-readiness` | inventário, restore/rollback, critérios de implantação, sem publicar |

Dependências mudam ordem se testes mostrarem que a UI necessita resposta de POST/idempotência. Não juntar T01–T15 em mega-branch. Cada PR deve declarar endpoints, migrations, risco, feature flag/rollback, comando/testes, telas e critério de aceite.

## 11. Definição de pronto por tarefa

- Branch baseada em estado conhecido; diff focado, sem segredo/dado real.
- Critério rastreado a requisito/decisão.
- Teste de unidade/integrado/UI adequado ao risco; regressão dos fluxos existentes.
- Migration revisada; sem escrita destrutiva; duplicatas analisadas quando necessário.
- Tela responsiva, acessível e com loading/erro/vazio.
- Medida anterior/posterior registrada quando a meta for performance; sem alegar causalidade além da evidência.
- Revisão do usuário antes de selecionar a próxima tarefa; nenhum push/merge/release presumido.

## 12. Pendências declaradas

Oito parâmetros operacionais/legado ainda estão parcialmente ou totalmente abertos conforme índice JSON e `02_Decisoes_Pendentes.md`, entre eles regularização de duplicatas e itens de fila legados, responsável final editorial, matriz exata de dispositivos, políticas de frequência/retensão/log/email, parâmetros de mídia, objetivos de recuperação além do RPO zero e impacto de custo. Eles não impedem leitura, instrumentação local ou tarefas isoladas, mas bloqueiam o lote específico que depende deles e qualquer publicação.
