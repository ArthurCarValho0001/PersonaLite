# Requisitos funcionais da nova versão

Data: 26/10/2026. Versão do levantamento: 0.13. Estado: vinte decisões encerradas; D04, D17, D20, D24, D26 e D29 parcialmente resolvidas; outras seis decisões abertas; implementação não iniciada.

Base GitHub: `ArthurCarValho0001/PersonaLite`, revisão `23ab62d46a77683f38df72c38d8b2785ea19bce8`.

RF01–RF15 preservam os identificadores acadêmicos para manter a rastreabilidade. O detalhamento atual não altera silenciosamente as regras anteriores: divergências recebem uma decisão. RF16–RF23 descrevem necessidades de implementação e pontos condicionais encontrados nesta análise.

P0 indica integridade, segurança ou regra que precisa estar resolvida antes da entrega afetada. P1 indica função da versão planejada. Condicional não entra automaticamente no desenvolvimento; depende da decisão indicada. Todos os critérios são futuros, salvo os testes de caracterização que descrevem a base observada.

## RF01 — Criar conta

**Situação:** Base a preservar e validar. **Prioridade:** P0. **Decisões relacionadas:** D01 D03 D04.

**Critérios de aceite:**

1. **RF01-CA01:** Criar com dados obrigatórios da base e e-mail opcional; permitir cadastro em qualquer idade, conforme D03 atualizada. Validar nascimento válido e não futuro no servidor, sem impor limite de 18 ou 19 anos.
2. **RF01-CA02:** Normalizar nome de usuário e impedir duplicidade inclusive em duas solicitações simultâneas; não revelar senha em retorno ou log.
3. **RF01-CA03:** Preservar todas as contas existentes. Não aplicar reset de dados nem bloqueio de contas por idade; a política vigente permite qualquer idade. Obrigatoriedade de e-mail não foi aprovada. Quando informado, o e-mail deve ser único conforme D04; tratar duplicidades legadas sem perda de contas.

## RF02 — Entrar e encerrar acesso

**Situação:** Base a preservar e endurecer. **Prioridade:** P0. **Decisões relacionadas:** D05 D20.

**Critérios de aceite:**

1. **RF02-CA01:** Credenciais válidas abrem a própria área e permitem acesso por até 30 dias; credenciais inválidas não autenticam. Proposta técnica: prazo contado da autenticação, sem prolongamento indefinido por atividade.
2. **RF02-CA02:** Ao sair, avisar sobre registros físicos não sincronizados e preservá-los vinculados à conta e ao ambiente de origem. Limpar acesso e dados visíveis da sessão, sem apagar a fila; outra conta não lê nem envia pendências. Reentrada da mesma conta permite retomada e sincronização com a chave original.
3. **RF02-CA03:** Expiração após 30 dias pede novo login e preserva pendências da própria conta. Recuperação de senha encerra todos os acessos existentes, em todos os dispositivos, inclusive o que realizou a recuperação, e exige novo login; remover token somente no navegador atual não satisfaz a regra.

## RF03 — Manter perfil

**Situação:** Base a preservar. **Prioridade:** P1. **Decisões relacionadas:** D04 D09.

**Critérios de aceite:**

1. **RF03-CA01:** Manter nome, nascimento, sexo, metas textuais e avatar conforme base; e-mail e usuário exigem senha atual.
2. **RF03-CA02:** Trocar e-mail retira verificação anterior e exige unicidade normalizada, inclusive em concorrência; correções de perfil respeitam política histórica D09. Eventuais duplicidades legadas exigem resolução preservando as contas.
3. **RF03-CA03:** Correção dos dados do perfil usados nos cálculos recalcula todo o histórico corporal da própria conta, conforme D09, com informação clara sobre o efeito. Edição de altura ainda precisa de fluxo definido; não descrevê-la como tela já existente.

## RF04 — Verificar e-mail e recuperar senha

**Situação:** Base com lacunas a corrigir. **Prioridade:** P0. **Decisões relacionadas:** D04 D05 D18 D28.

**Critérios de aceite:**

1. **RF04-CA01:** Código exige finalidade correta, validade de quinze minutos e consumo único; solicitação de recuperação não revela existência de conta.
2. **RF04-CA02:** Recuperação só envia para e-mail verificado; tentativas e reenvios obedecem política configurada.
3. **RF04-CA03:** Consumo do código, gravação de nova senha e invalidação de todos os acessos existentes são confirmados atomicamente; falha não deixa redefinição parcial. Após sucesso, exigir novo login sem autenticação automática. Novos códigos usam gerador apropriado para segurança.

## RF05 — Registrar e corrigir medidas

**Situação:** Base a preservar. **Prioridade:** P1. **Decisões relacionadas:** D08 D09 D29.

**Critérios de aceite:**

1. **RF05-CA01:** Manter formulário completo: data, peso, quatorze circunferências e sete dobras; validar valores e unidades no servidor.
2. **RF05-CA02:** Calcular indicadores no servidor sem aceitar IMC ou gordura arbitrários do cliente; erro não grava parcialmente.
3. **RF05-CA03:** Permitir uma medição por conta e data de negócio, com edição da existente; criação concorrente ou alteração de data não pode gerar duplicidade. Reenvio com mesma chave retorna o resultado original. Preservar eventuais duplicidades legadas até regularização. Editar só medição própria; medição simplificada não está incluída.

## RF06 — Consultar histórico corporal

**Situação:** Base a preservar. **Prioridade:** P1. **Decisões relacionadas:** D08 D09 D29.

**Critérios de aceite:**

1. **RF06-CA01:** Mostrar estado vazio, última medição e histórico ordenado de forma determinística.
2. **RF06-CA02:** Gráfico com mais de uma medição e representação textual acessível dos mesmos valores.
3. **RF06-CA03:** Continuar aviso de três meses da última medição, com calendário definido; não apagar histórico ao mudar perfil.

## RF07 — Configurar plano semanal

**Situação:** Base a preservar. **Prioridade:** P1. **Decisões relacionadas:** D10.

**Critérios de aceite:**

1. **RF07-CA01:** Criar plano inicial, organizar dias e exercícios, metas, ordem e descanso; manter um vigente por usuário.
2. **RF07-CA02:** Iniciar novo plano encerra anterior sem apagar sessões; exercícios já usados seguem política de arquivamento.
3. **RF07-CA03:** Operações cruzadas entre usuários são negadas; validar reordenação sem itens estranhos ou duplicados.

## RF08 — Registrar e corrigir séries

**Situação:** Base a preservar com coerência de histórico. **Prioridade:** P1. **Decisões relacionadas:** D06 D07 D08 D10.

**Critérios de aceite:**

1. **RF08-CA01:** Registrar série comum ou etapas de drop set com carga e repetições válidas; grupo permanece íntegro ao editar.
2. **RF08-CA02:** Permitir selecionar a data de um treino anterior sem limite de dias; selecionar outro treino continua sendo operação distinta de selecionar a data. Aplicar RF20 e preservar o vínculo histórico correto, sem atribuir automaticamente o plano vigente a uma data anterior.
3. **RF08-CA03:** Edição e remoção de séries respeitam titularidade, mantêm o exercício concluído e recalculam resultados com as séries restantes, mesmo abaixo da meta; nunca alteram outro exercício por nome igual. Sem séries restantes, não fabricar resultados.

## RF09 — Concluir execução

**Situação:** Regra confirmada: automática ao atingir a meta e botão manual preservado. **Prioridade:** P0. **Decisões relacionadas:** D06 D07.

**Critérios de aceite:**

1. **RF09-CA01:** Garantir conclusão automática ao atingir ou ultrapassar a meta de séries e manter a possibilidade de concluir manualmente antes da meta quando houver séries válidas.
2. **RF09-CA02:** Concluir o dia considera somente sessões existentes com séries; não cria execução fictícia.
3. **RF09-CA03:** Atualizar RN09 acadêmica e os casos de uso para refletir a conclusão automática e manual confirmada. D07 confirmada: editar ou remover séries mantém a conclusão e recalcula resultados, inclusive abaixo da meta; ausência de séries não gera desempenho fictício.

## RF10 — Consultar desempenho e ciclos

**Situação:** Base a preservar e esclarecer. **Prioridade:** P1. **Decisões relacionadas:** D06 D07 D08 D10.

**Critérios de aceite:**

1. **RF10-CA01:** Resumo e retrospectiva só expõem dados próprios; comparação ausente não aparece como zero.
2. **RF10-CA02:** Distinguir contagem de dias com sessões concluídas de conclusão integral de todos os exercícios; resolver nomenclatura com D06.
3. **RF10-CA03:** Ciclos aparecem somente quando existentes; início de novo ciclo exige ação explícita, sem alterar plano silenciosamente.

## RF11 — Explorar a área Aprender

**Situação:** Documentado academicamente, ainda não implementado. **Prioridade:** P1. **Decisões relacionadas:** D14 D16 D17 D25.

**Critérios de aceite:**

1. **RF11-CA01:** Mostrar três módulos gratuitos da primeira versão e entrada clara na navegação autenticada.
2. **RF11-CA02:** Cada módulo apresenta objetivo, duas aulas, fontes, versão e situação de estudo.
3. **RF11-CA03:** Módulo retirado permite somente consulta do próprio histórico de estudo, notas e tentativas, sem aulas antigas ou novas tentativas; módulos e aulas têm ordem livre conforme D16; questionário exige as duas aulas da versão avaliada. Sem professor, cobrança ou editor de curso na interface.

## RF12 — Estudar e marcar aula

**Situação:** Documentado academicamente, ainda não implementado. **Prioridade:** P1. **Decisões relacionadas:** D13 D14 D17.

**Critérios de aceite:**

1. **RF12-CA01:** Exibir texto acessível, fonte, versão e revisão; marcação requer ação explícita do usuário.
2. **RF12-CA02:** Gravar uma marcação por usuário, versão e aula; repetir não aumenta a contagem.
3. **RF12-CA03:** A aula deve pertencer à versão solicitada; acesso a outra conta ou conteúdo desconhecido é negado. Abrir a página não comprova aprendizagem.

## RF13 — Responder questionário e receber devolutiva

**Situação:** Documentado academicamente, ainda não implementado. **Prioridade:** P1. **Decisões relacionadas:** D15 D18 D19 D32.

**Critérios de aceite:**

1. **RF13-CA01:** Liberar após as duas aulas da mesma versão; apresentar cinco questões com quatro alternativas e uma correta, sem gabarito inicial.
2. **RF13-CA02:** Exigir uma resposta válida por questão; conferir IDs, versão e elegibilidade no servidor; nota = acertos/5 × 100.
3. **RF13-CA03:** Guardar tentativa e efeito no progresso em transação; quatro acertos aprovam. Repetir mesma chave retorna resultado; chave com payload diferente gera conflito.
4. **RF13-CA04:** Mostrar nota e explicações após confirmação; permitir novas tentativas ilimitadas sem apagar anteriores. Limitação de frequência não significa limite de quantidade de tentativas.

## RF14 — Consultar aprendizagem

**Situação:** Documentado academicamente, ainda não implementado. **Prioridade:** P1. **Decisões relacionadas:** D13 D14 D16.

**Critérios de aceite:**

1. **RF14-CA01:** Exibir aulas estudadas, histórico de tentativas, melhor nota e estado por usuário e versão.
2. **RF14-CA02:** Concluir somente com as duas aulas e nota mínima de oitenta por cento na mesma versão.
3. **RF14-CA03:** Nota menor posterior não desfaz conclusão; versão nova não sobrescreve o histórico da antiga. D13 confirmada: conclusão anterior continua suficiente para o mesmo módulo, com aviso de atualização e indicação da versão concluída. Não atribuir nota ou aulas antigas à versão nova; nova participação é opcional e segue os pré-requisitos da versão.

## RF15 — Sincronizar novas medições e séries

**Situação:** Parcial; isolamento e idempotência ainda necessários. **Prioridade:** P0. **Decisões relacionadas:** D08 D19 D20 D21 D30.

**Critérios de aceite:**

1. **RF15-CA01:** Gerar chave única antes do primeiro envio, tanto online quanto na fila; associar item à conta e ao ambiente de origem.
2. **RF15-CA02:** Após confirmação perdida, reenviar com a mesma chave sem duplicar; remover pendência só após confirmação do servidor. Exercício arquivado ou plano encerrado não impede registro atrasado próprio: salvar no histórico original, preservando referência e data, sem reativar/mover registros.
3. **RF15-CA03:** Outra conta não lê nem envia itens; fila legada sem dono fica isolada para análise. Erro permanente não bloqueia silenciosamente todos os demais itens.
4. **RF15-CA04:** Sincronização educativa, edição e conclusão sem internet ficam fora do escopo inicial documentado.

## RF16 — Publicar catálogo versionado por processo controlado

**Situação:** Proposta de detalhamento técnico. **Prioridade:** P1. **Decisões relacionadas:** D13 D14 D17.

**Critérios de aceite:**

1. **RF16-CA01:** Cadastrar pacote com três módulos, seis aulas e quinze questões, identificadores estáveis e versão imutável após publicar.
2. **RF16-CA02:** Validar antes de publicar: objetivos, ordem, fontes, uma correta por questão, cardinalidades e revisão editorial pela equipe. Registrar pessoa responsável pela liberação final, ainda a indicar; não publicar conteúdo real enquanto faltar indicação e revisão.
3. **RF16-CA03:** Nova revisão cria versão; retirada mantém conclusão e resultados antigos consultáveis, sem disponibilizar as aulas retiradas. Não acrescentar perfil administrativo só para executar carga controlada.

## RF17 — Avisar ao sair e descartar respostas não enviadas

**Situação:** D15 confirmada: somente memória da tela, sem persistência. **Prioridade:** P1. **Decisões relacionadas:** D15 D20 D30.

**Critérios de aceite:**

1. **RF17-CA01:** Manter respostas não enviadas apenas em memória da tela; não gravar em armazenamento local, cache persistente, URL ou servidor. Navegação controlada com respostas preenchidas exige aviso de perda antes de sair.
2. **RF17-CA02:** No aviso de saída, continuar na tela preserva respostas em memória; confirmar saída descarta. Troca de conta limpa a memória sem expor respostas a outro titular. Fechamento/recarregamento usa aviso nativo quando permitido pelo navegador; interrupção abrupta pode perder respostas sem aviso.
3. **RF17-CA03:** Descartar respostas não enviadas não gera tentativa, nota ou progresso. Falha temporária sem sair da tela preserva memória para retentar com a mesma chave. Uma submissão enviada com confirmação perdida é tratada por idempotência e consulta do resultado, sem presumir que foi descartada no servidor.

## RF18 — Controlar abuso e invalidar acesso conforme política

**Situação:** Correção técnica necessária; parâmetros pendentes. **Prioridade:** P0. **Decisões relacionadas:** D04 D05 D18.

**Critérios de aceite:**

1. **RF18-CA01:** Limitar login, envio e conferência de códigos sem distinguir indevidamente contas existentes.
2. **RF18-CA02:** Retorno ao exceder limite informa espera sem vazar dados; testes usam valores configurados.
3. **RF18-CA03:** Garantir validade de até 30 dias e recusar credenciais de sessão emitidas antes da redefinição de senha em todos os endpoints protegidos, inclusive arquivos. Novos acessos exigem senha redefinida. Não criar nova arquitetura de autenticação sem necessidade.

## RF19 — Proteger envio e consulta de imagens

**Situação:** D11 confirmada: somente avatar; parâmetros técnicos ainda dependem de D12. **Prioridade:** P0. **Decisões relacionadas:** D11 D12.

**Critérios de aceite:**

1. **RF19-CA01:** Permitir novos envios apenas de avatar da conta autenticada. Requisições diretas à rota de envio de fotos corporais devem ser recusadas no servidor sem gravar bytes ou metadados; ocultar botão não basta.
2. **RF19-CA02:** Validar formato real, tamanho e dimensões; não confiar em extensão; entregar identificador ou URL autorizada, nunca caminho de disco.
3. **RF19-CA03:** Garantir persistência entre implantações e descarte seguro de falhas; até concluir o fluxo, bloquear rota incompleta no servidor de forma controlada. Não basta ocultar botão.

## RF20 — Unificar calendário e dados de cálculo

**Situação:** Correção e detalhamento propostos. **Prioridade:** P0. **Decisões relacionadas:** D08 D09 D29.

**Critérios de aceite:**

1. **RF20-CA01:** Usar o fuso do dispositivo para determinar o dia do treino e os períodos dos relatórios, com a mesma interpretação na tela, API e fila; instantes técnicos são UTC. Capturar data local e fuso na operação e preservá-los no reenvio; não usar o fuso do servidor nem converter datas antigas em massa. D08 confirma treinos anteriores sem limite de dias.
2. **RF20-CA02:** Recalcular o dia ao atravessar meia-noite com aplicativo aberto; não capturar uma constante para toda a sessão.
3. **RF20-CA03:** Correção de dados do perfil usados nas fórmulas recalcula todas as avaliações da conta, gráficos e resumos, preservando medições brutas, datas e identidade. Registrar entradas e versão da fórmula do recálculo; testar fronteiras de mês e aniversário, falhas e concorrência.

## RF21 — Preservar identidade e histórico ao alterar plano

**Situação:** Arquivamento e consulta histórica confirmados em D10; D21 confirma registros atrasados no histórico original, inclusive arquivados e planos encerrados. **Prioridade:** P1. **Decisões relacionadas:** D07 D10 D21.

**Critérios de aceite:**

1. **RF21-CA01:** Remover exercício do plano o arquiva e mantém histórico consultável por seu identificador estável, incluindo sessões, séries e resultados. Não apagar dados ao arquivar nem ocultá-los por depender somente do plano vigente.
2. **RF21-CA02:** Renomear não associa automaticamente exercícios diferentes; usar identidade estável para agrupamento futuro.
3. **RF21-CA03:** Não inventar equivalência entre nomes iguais de exercícios legados; migração ambígua exige revisão.

## RF22 — Tratar conflito e mudança de versão na interface

**Situação:** Detalhamento técnico proposto. **Prioridade:** P1. **Decisões relacionadas:** D13 D14 D19 D30.

**Critérios de aceite:**

1. **RF22-CA01:** Envio com versão inexistente, alterada ou retirada recebe resposta determinística e orientação para recarregar ou retomar versão elegível.
2. **RF22-CA02:** Reenvio de tentativa já confirmada pode recuperar seu resultado mesmo após retirada; não cria nova tentativa.
3. **RF22-CA03:** Falha de rede ou servidor não aparece como nota zero nem conclusão; interface permite tentar novamente com a mesma chave.

## RF23 — Exportar os próprios dados

**Situação:** Exportação incluída; CSV por tipo e dados do servidor definidos; sem arquivo do avatar conforme D22. Encerramento fora desta entrega. **Prioridade:** P1. **Decisões relacionadas:** D02 D22 D24 D27.

**Critérios de aceite:**

1. **RF23-CA01:** Exportar somente dados da conta autenticada em arquivos CSV separados por tipo de dado, incluindo somente dados já confirmados no servidor; chamada direta com identificador de outra conta não pode acessar seu arquivo. Não incluir senhas, hashes, tokens ou códigos.
2. **RF23-CA02:** Gerar arquivo coerente com data/hora de referência, versão do formato, unidades e datas compreensíveis; informar abrangência e referência temporal. Ao detectar pendências locais da própria conta, avisar que estão fora do arquivo, sem exigir sincronização prévia; não afirmar inexistência de pendências em outros aparelhos. Entregar somente ao titular; arquivo do avatar não faz parte da exportação.
3. **RF23-CA03:** Exportação não altera nem exclui dados. Não criar botão, endpoint ou fluxo de encerramento/exclusão de conta nesta entrega por inferência; definir procedimento operacional separado se necessário, sem política de retenção presumida.
