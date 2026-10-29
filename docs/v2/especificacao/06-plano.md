# Plano da nova versão e condições de início

Data: 26/10/2026. Versão do levantamento: 0.13. Estado: vinte decisões encerradas; D04, D17, D20, D24, D26 e D29 parcialmente resolvidas; outras seis decisões abertas; implementação não iniciada.

Base GitHub: `ArthurCarValho0001/PersonaLite`, revisão `23ab62d46a77683f38df72c38d8b2785ea19bce8`.

## Estratégia recomendada

Refatoração gradual no mesmo projeto e arquitetura, mantendo a aplicação atual como referência de regressão. Não há necessidade demonstrada de microserviços, novo framework, aplicativo nativo, novo provedor de banco ou serviço pago para atender às duas ODS.

A preservação integral de contas e históricos foi confirmada pelo responsável. Uma mudança maior de arquitetura ou identidade visual deve ter escopo separado. Não transformar inconsistências do documento em regras implementadas por engano.

## E0 — consolidar o levantamento

**Trabalho:** primeira rodada D01/D02/D06 concluída. Registrar as escolhas confirmadas, corrigir a regra acadêmica de conclusão e continuar as decisões por lote. Atribuir responsáveis antes da implementação.

**Saída desta rodada:** versão 0.2 com usuários reais em uso diário, preservação integral e conclusão automática/manual registradas. Se uma decisão for adiada, registrar qual lote permanece bloqueado.

**Não exige:** acesso ao banco real ou publicação. Levantar outras decisões pode continuar em paralelo à reprodução local.

## E1 — reproduzir e caracterizar a base

**Trabalho:** preparar cópia isolada, inventariar SDK e dependências, reproduzir instalação e build, criar dados fictícios e testes dos comportamentos atuais. Conferir F01, contratos reais e campos obrigatórios no servidor.

**Saída:** build reproduzível e testes de cadastro, autenticação, medidas, séries, conclusão, perfil, histórico e relatórios. Divergências são registradas como questões ou bugs demonstrados.

**Limite:** testes de caracterização não tornam um comportamento desejável; registram o que ele faz. Nenhuma instalação ou teste dessa etapa foi realizado neste levantamento.

## E2 — proteger a base que será preservada

**Trabalho:** titularidade em fotos, validação de entrada, resposta de erros, consumo de código atômico, fonte segura de códigos, índices e controles de frequência. Corrigir filas e chaves de reenvio com migração segura das pendências antigas. Implementar fuso do dispositivo e treinos anteriores sem limite de dias conforme D08; preservar conclusão automática/manual de D06 e manter a conclusão após correções conforme D07.

**Saída:** regressão física passando; acessos cruzados bloqueados; reenvio e concorrência sem duplicidade; datas coerentes. Tratar arquivos incompletos no servidor até haver fluxo completo.

**Dependências:** política de identidade, sessão, mídia e dados. Correções isoladas e bem definidas podem ser entregues sem esperar o curso inteiro.

## E3 — catálogo educativo e estudo

**Trabalho:** pacote versionado, validação de publicação, tela Aprender, aulas textuais e conclusão individual de estudo. Não criar painel administrativo.

**Saída:** três módulos e seis aulas de teste com metadados, marcação por conta/versão e acesso por teclado.

**Dependências:** D13/D14/D16 confirmadas: conclusão suficiente, histórico de conteúdo retirado e navegação livre. Usar conteúdo fictício ou claramente de teste até D17, sem declarar revisão editorial realizada.

## E4 — avaliação e progresso

**Trabalho:** cinco questões por módulo, elegibilidade, correção no servidor, transação, idempotência, tentativas ilimitadas e progresso. D15 confirmada: memória temporária e aviso ao sair, sem rascunho persistente. Tratar versão retirada e confirmação perdida.

**Saída:** duas aulas + quatro acertos concluem; três acertos não; nova tentativa inferior não retira conclusão; contas e versões não se misturam.

**Dependências:** E3; D15 confirmada; D18/D19 pendentes. Contratos devem ser acordados antes de desenvolver front e API independentemente.

## E5 — experiência integrada e homologação

**Trabalho:** estados vazios e de erro, atualização de PWA, matriz de navegadores, zoom, contraste e leitor de tela. Ensaiar implantação e restauração em ambiente isolado. Validar conteúdo real e dados de teste.

**Saída:** cenários de aceite executados com evidências; falhas conhecidas documentadas; regressão antiga preservada. Metas de desempenho medidas, não apenas declaradas.

## E6 — preparação de publicação

**Trabalho:** decisões de público, dados, sessão, mídia, privacidade, logs e recuperação fechadas; migração ensaiada; configuração, rollback e monitoramento revisados.

**Saída:** resultado concreto de homologação, plano de implantação com responsáveis e possibilidade de avaliar a publicação. Esse lote não é autorização para publicar.

## O que bloqueia cada início

| Ação | Precisa antes | Pode continuar sem isso |
|---|---|---|
| Ler código, desenhar contratos e caracterizar localmente | Cópia isolada e dados fictícios | Quase todas as decisões de publicação |
| Preservar conclusão e revisar métricas | D06/D07 confirmadas; regressão da conclusão e recálculo | Desenvolvimento do catálogo |
| Fechar modelo de datas e medições | D08/D09 confirmadas; D29 com unicidade escolhida e legado pendente; D21 confirma histórico original, inclusive arquivado/encerrado | Conteúdo educativo de teste |
| Migrar dados reais | Preservação integral confirmada em D02; identidade/histórico pertinentes, cópia e restauração | Desenvolvimento local sem migração real |
| Gravar avaliação educativa | Contrato, transação, titularidade, versão e idempotência | Rascunho avançado entre dispositivos |
| Publicar catálogo real | D17 e revisão de fontes/gabaritos | Testes com catálogo fictício |
| Abrir cadastro ao público | Políticas e verificações de E6 | Piloto isolado conforme escopo decidido |

## Migração e preservação

1. Capturar referência da aplicação atual e inventário do banco, arquivos e filas, sem expor dados no Git.
2. Fazer cópia autorizada e testar restauração em ambiente separado.
3. Acrescentar estruturas novas e campos compatíveis; usar estratégia de expansão antes de remover ou renomear.
4. Levantar duplicidades e referências inválidas; resolver por política explícita antes de impor restrições.
5. Popular catálogo de teste versionado e conferir totais. O primeiro catálogo real depende da revisão editorial.
6. Verificar compatibilidade do cliente antigo, autenticação, dados e arquivos com o esquema expandido.
7. Implantar em homologação, executar roteiro e só preparar a publicação depois de evidências.
8. Em falha, reverter aplicação/flags conforme compatibilidade. Não usar exclusão de tabelas ou down destrutivo como solução automática. Restauração real tem efeitos sobre dados criados após a cópia e exige plano.

## Organização sugerida do trabalho

Usar branches pequenas por lote, por exemplo `feature/v2-aprendizagem-catalogo` e `fix/v2-fila-isolamento`. Separar alteração de regra de refatoração que apenas reorganiza código. Preparar testes antes de trocar o comportamento protegido. Nenhuma branch foi criada por este pacote.

A documentação acadêmica recebe atualização de regras e diagramas depois das decisões. O material já entregue é referência, não precisa ser reescrito inteiro para iniciar a análise técnica. Atualizar especialmente UC07, RN09 e os cenários afetados pela conclusão automática.

## Critério para considerar uma entrega pronta

Requisito e decisão rastreáveis, código revisável, testes adequados executados, dados preservados, estados de erro e acessibilidade conferidos e documentação correspondente atualizada. Não marcar como pronto porque existe uma tela ou porque um teste unitário de fórmula passou.

## Continuidade da aplicação que já está em uso

- Manter a versão atual atendendo os usuários enquanto a nova é desenvolvida e validada em ambiente separado. Isso é orientação de implementação, não uma alteração já aplicada ao serviço.
- A homologação usa base separada. Começar com dados fictícios; qualquer uso de cópia real precisa de tratamento específico de acesso e dados pessoais.
- Evoluir o esquema de maneira compatível. Não recriar o banco, renumerar IDs, apagar contas, redefinir senhas em massa ou eliminar históricos como atalho de refatoração.
- Ensaiar migração e restauração antes da implantação real. Conferir contas, planos, medições, séries, imagens referenciadas e integridade dos vínculos, sem expor esses dados no Git.
- Definir a janela aceitável de implantação, comunicação aos usuários e objetivos de recuperação. D24 exige implantação sem interrupção perceptível; demonstrar a estratégia antes da publicação, sem declarar garantia ainda não testada.
- Só atualizar a aplicação em uso após regressão, validação em homologação e preparação concreta da implantação. Não há autorização de publicação ou mudança de produção nesta rodada.

## Atualização da rodada 0.3

Aplicar D07 na modelagem e nos testes; calendário adota fuso do dispositivo e captura a data de origem na fila. D08 está confirmada: permitir treinos anteriores sem limite de dias. D04 fixa unicidade de e-mail, mas exige inventário e política de regularização de eventuais duplicados antes da migração da restrição. Toda solução preserva D02.

## Atualização da rodada 0.4

Implementar seleção de treino anterior sem limite, recálculo integral das avaliações após correções relevantes do perfil e arquivamento com consulta histórica. Ensaiar mudanças com dados fictícios antigos, múltiplos planos e avaliações; preservar todas as contas e históricos. D21 confirma uso das referências originais arquivadas ou de planos encerrados; D29 define uma medição por data, com regularização de conflitos legados pendente. Não aplicar migrações reais nesta fase documental.

## Atualização da rodada 0.5

RF17 deixa de ser condicional: implementar aviso de saída e descarte sem persistência. Modelar conclusão suficiente do módulo separadamente do progresso por versão; atualizações não obrigam a nova conclusão. Navegação livre mantém o pré-requisito das duas aulas antes do questionário. Revisar documentação acadêmica que sugira nova conclusão obrigatória; este pacote registra a alteração, sem reescrever o DOCX nesta rodada.

## Atualização da rodada 0.6

Escopo de mídia limitado a avatar; bloquear novos envios corporais no servidor e preservar arquivos legados. Preparar unicidade de medição por conta/data, edição e tratamento de conflito, após inventário de eventuais duplicidades. Registro histórico da rodada 0.6, substituído na 0.7: o cadastro agora aceita qualquer idade. Nada nesta rodada autoriza apagar, mesclar ou bloquear automaticamente dados/contas existentes.

## Atualização da rodada 0.7

1. Remover do planejamento vigente a idade mínima antes de implementar cadastro; preservar nascimento válido/não futuro. Conferir adequação dos conteúdos e fórmulas por faixa etária sem inventar validação realizada.
2. Acrescentar etapa de proposta visual e protótipo navegável para o redesenho completo. Inventariar telas e estados, preservar logo e regras, propor paleta e componentes e validar acessibilidade. Não confundir redesenho com autorização para trocar stack ou expandir funcionalidades.
3. Validar fluxos em iOS, Android e navegadores na matriz concreta de homologação. Registrar versões e limitações encontradas; a indicação de plataformas não representa teste já executado.

## Atualização da rodada 0.8

D05 confirma 30 dias e revogação global após recuperação. Implementar e testar invalidação no servidor sem depender apenas de expiração de token ou logout local. D20 confirma aviso e preservação da fila no logout, retomada pela mesma conta; tratar concorrência de envio/logout e troca de conta. Fila legada sem dono continua isolada até regularização. Senha recuperada não altera identidade nem apaga históricos/pendências.

## Atualização da rodada 0.9

RF23 deixa de ser condicional: incluir somente exportação, após definir formato e abrangência. Encerramento de conta fica fora da primeira entrega. Implementar consulta histórica de módulos retirados sem aulas; preservar resultados. Atualização PWA automática aguarda ausência de trabalho em andamento e pendências, inclusive entre abas; testar compatibilidade da API para que a versão anterior consiga concluir sincronização antes de atualizar.

## Atualização da rodada 0.10

Planejar exportação em CSV por tipo e fixar esquema/abrangência antes do aceite. Implementar lançamento/sincronização de treino atrasado em exercício arquivado ou plano encerrado, preservando origem/data e sem reativação. Equipe responde pela revisão editorial; pessoa de liberação final ainda deve ser indicada, sem impedir build local ou conteúdo fictício.

## Atualização da rodada 0.11 — prevalece sobre etapas futuras sugeridas

A etapa autorizada agora é somente local, com dados fictícios e base isolada. As referências anteriores a homologação/produção são preparação futura, não tarefas para contratar ou implantar agora. D23 está resolvida quanto à etapa atual.

Exportação inclui somente servidor, com aviso de pendências; avatar ainda a decidir. D24 exige preparar implantação sem interrupção perceptível. Antes de publicar, inventariar infraestrutura e elaborar plano concreto com compatibilidade de esquema/API, troca de tráfego, arquivos, sessões, fila, requisições em andamento, reversão e evidências. Simular localmente quando útil, sem apresentar simulação como prova de produção. Se a infraestrutura atual não sustentar o requisito, apresentar alternativa e custo antes de contratar ou mudar serviço. RPO/RTO e tolerância de perda em incidentes continuam pendentes.

## Atualização da rodada 0.12

D22 tem escopo fechado: CSV por tipo, servidor, sem avatar e com aviso de pendências. D31 mantém plataformas, somente compatibilidade necessária. D24 fixa perda zero de dados confirmados como objetivo, sem demonstrar viabilidade; levantar infraestrutura, RTO e domínios de falha, avaliar alternativas e custos antes de qualquer contratação. Continuar somente localmente com base isolada. Parâmetros operacionais pendentes não impedem reprodução da base e desenvolvimento dos lotes já definidos.

## Atualização da rodada 0.13

RTO será decidido após comparar custos/alternativas. Aplicação e banco estão em serviços separados; ainda falta inventário dos provedores. Não contratar, mudar plano ou migrar infraestrutura nesta etapa. Preparar comparação posteriormente com fontes atuais dos provedores e cenários definidos; não apresentar valores estimados sem base como orçamento aprovado.

A reprodução local da base continua disponível como primeiro lote. Parâmetros de mídia (D12), controles de frequência (D18), retenção de chaves (D19), logs (D27) e e-mail (D28) exigem detalhamento técnico nos lotes correspondentes. D32 registra o propósito educativo como referência; mudança para prova restrita depende de nova decisão. Responsável editorial, matriz de plataformas e conflitos legados continuam identificados, sem bloquear toda atividade local nem liberar produção por antecipação.
