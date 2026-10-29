# Regras, requisitos de qualidade e estados

Data: 26/10/2026. Versão do levantamento: 0.13. Estado: vinte decisões encerradas; D04, D17, D20, D24, D26 e D29 parcialmente resolvidas; outras seis decisões abertas; implementação não iniciada.

Base GitHub: `ArthurCarValho0001/PersonaLite`, revisão `23ab62d46a77683f38df72c38d8b2785ea19bce8`.

## Referência de negócio preservada

| Regra acadêmica | Tratamento na V2 |
|---|---|
| RN01 usuário único e mínimos de formulário | Preservar como mínimo da base, ampliar validação no servidor; não confundir validação da tela com proteção do endpoint. |
| RN02 dados do próprio usuário | Obrigatória em todos os fluxos, inclusive arquivos e fila. |
| RN03 troca de e-mail/usuário com senha atual | Preservar; metas continuam texto livre. |
| RN04 e-mail verificado, código de quinze minutos e uso único | Preservar e tornar consumo atômico; definir frequência e revogação. |
| RN05 medição completa | Preservar quatorze circunferências e sete dobras; não introduzir formulário simplificado sem novo escopo. |
| RN06 aviso após três meses | Preservar com calendário explícito. |
| RN07 um plano vigente | Preservar e garantir em concorrência, com migração de eventuais duplicados antes de restrição. |
| RN08 grupos de série e etapas válidas | Preservar; retroatividade e calendário seguem D08. |
| RN09 conclusão de exercício | D06 confirmada: automática ao atingir a meta, mantendo botão manual. Corrigir o documento acadêmico. D07 confirmada: edição ou remoção mantém conclusão e recalcula resultados. |
| RN10 retrospectiva do plano vigente e ciclos | Caracterizar; D10 confirma arquivamento de exercícios removidos e histórico consultável. |
| RN11 três módulos e duas aulas | Referência inicial, sem editor administrativo. |
| RN12 estudo por conta e versão | Preservar; marcação é ação explícita e idempotente. |
| RN13 cinco questões, quatro alternativas, uma correta, aprovação em oitenta por cento | Preservar; sem arredondar sessenta por cento para aprovação. |
| RN14 tentativas ilimitadas com histórico | Preservar; limite de frequência técnica não muda quantidade total permitida. |
| RN15 conclusão com duas aulas e aprovação, sem regressão por tentativa posterior | Preservar por versão. |
| RN16 fila da conta e envio sem duplicação | Ainda não existe integralmente; implementar, testar e migrar itens legados com segurança. |

## Regras de detalhamento propostas

- **V2-RN17:** só uma versão publicada e imutável pode gerar avaliação. Aula, questão e alternativa devem pertencer ao pacote correto; não aceitar mistura de versões.
- **V2-RN18:** uma chave de operação pertence ao titular, tipo de operação e conteúdo. Reenvio idêntico devolve resultado original; conteúdo divergente com a mesma chave gera conflito. A proteção existe também sob concorrência e reinício.
- **V2-RN19:** tentativa e atualização do progresso são salvas juntas. Consumo de código e nova senha também devem ser atômicos.
- **V2-RN20:** nova versão mantém resultados anteriores. D13 mantém a conclusão suficiente para o mesmo módulo identificado de forma estável, com aviso de atualização; não copiar notas, tentativas ou aulas para a nova versão.
- **V2-RN21:** questionário exige todas as respostas; rascunho não conta como tentativa nem como estudo concluído.
- **V2-RN22:** falha técnica não significa erro de resposta, nota zero ou perda da aprovação anterior.
- **V2-RN23:** caminho de disco não é endereço de imagem para o usuário. Todo arquivo privado depende de autorização antes de retornar conteúdo.
- **V2-RN24:** itens sem dono conhecido não são atribuídos ao usuário atualmente conectado. Permanecem isolados até decisão de migração.
- **V2-RN25:** afirmação de impacto em saúde ou aprendizagem exige evidência específica. Contagem de aulas e acertos são indicadores do produto, não comprovação de efeito clínico ou indicador oficial das ODS.

## Estados da aprendizagem

| Estado por módulo e versão | Condição | Transição permitida |
|---|---|---|
| Não iniciado | Nenhuma aula marcada | Primeira marcação → Em estudo |
| Em estudo | Uma das duas aulas marcada | Segunda marcação → Aguardando avaliação |
| Aguardando avaliação | Duas aulas e nenhuma tentativa aprovada | Nota ≥80% → Concluído; nota menor permanece |
| Concluído | Duas aulas e pelo menos uma aprovação | Consultar/refazer mantém conclusão na mesma versão |

Uma versão nova tem outra instância de progresso. Catálogo retirado e falha de carregamento não são estados de aprendizagem; são disponibilidade do conteúdo e erro de operação. D13 mantém a conclusão do módulo suficiente após atualização, indicando a versão aprovada e o aviso de conteúdo novo; D14 permite somente histórico de estudo, notas e tentativas, sem acesso às aulas retiradas.

## Estados de uma operação de fila

Pendente → Em envio → Confirmada. Falha temporária retorna a Pendente com nova tentativa controlada. Erro permanente passa a Requer atenção. Conta incompatível fica Bloqueada para outra conta. Não converter erro permanente em sucesso ou excluir automaticamente o item. Descarte explícito requer política D20/D21; conteúdos da fila não devem ser mostrados à conta errada.

## Requisitos de qualidade

### RNF01 — Privacidade e isolamento

Nenhum recurso físico, tentativa, progresso, fila ou arquivo de outra conta pode ser lido ou alterado por troca de identificador. Usuário vem da sessão, não de um campo livre. Logs não contêm credenciais ou corpo sensível.

**Verificação:** Testar conta A contra recursos de B em todas as operações protegidas; verificar ausência de efeitos e de vazamentos nos logs.

### RNF02 — Acessibilidade

Preservar navegação por teclado, foco visível, rótulos, mensagens claras, ampliação a 200% e resultado de gráfico também em texto. Novas telas não dependem só de cor.

**Verificação:** Percorrer o fluxo completo com teclado e leitor de tela na matriz D26; registrar critérios selecionados das WCAG 2.2. Não declarar conformidade integral sem auditoria correspondente.

### RNF03 — Contraste

Nas novas telas, texto comum tem razão de contraste mínima 4,5:1; texto grande, 3:1.

**Verificação:** Medir combinações usadas no catálogo, formulário, feedback e progresso, inclusive estado desabilitado quando aplicável ao critério.

### RNF04 — Responsividade

Novas telas funcionam em 360 e 1280 pixels de largura sem corte de ações ou rolagem horizontal na leitura.

**Verificação:** Executar catálogo, aula, avaliação e progresso nessas larguras e na ampliação definida.

### RNF05 — Desempenho

Manter a meta acadêmica proposta: percentil 95 até dois segundos para catálogo e progresso, com dez usuários simultâneos e ambiente aquecido.

**Verificação:** Cem consultas por operação; registrar ambiente, conjunto de dados, concorrência e percentil. Não é SLA de disponibilidade nem resultado já obtido.

### RNF06 — Atomicidade, concorrência e reenvio

Efeitos dependentes são confirmados juntos; chaves repetidas não criam registros extras mesmo em chamadas simultâneas ou reinício.

**Verificação:** Testar cinco reenvios, concorrência entre duas sessões, confirmação perdida e falha entre gravações; conferir banco e resultado por chave.

### RNF07 — Conteúdo verificável

Toda aula tem objetivo, fonte, versão, autoria/revisão e data. Conteúdo real só é liberado pelo processo editorial definido.

**Verificação:** Validar seis aulas e quinze questões; links e gabaritos coerentes; nada é apresentado como revisado por profissional sem evidência.

### RNF08 — Credenciais

Senha é validada e armazenada por mecanismo de hash apropriado; códigos de verificação não usam fonte pseudoaleatória comum e não aparecem em logs; validade, finalidade, tentativas e uso são conferidos.

**Verificação:** Inspecionar retorno e logs, testar expiração e consumo simultâneo; usar provedor de teste sem enviar a destinatários reais.

### RNF09 — Build reproduzível

Uma cópia limpa deve instalar, compilar e executar testes com versões registradas e arquivo de dependências travado; nenhuma troca de stack é assumida.

**Verificação:** Registrar comandos, SDK/runtime, lockfile e resultados em ambiente isolado. Corrigir incompatibilidade demonstrada em alteração separada.

### RNF10 — PWA e preservação local

Atualização instalada ocorre automaticamente somente quando não há trabalho em andamento; não perde formulário ou fila. Dados de API privada não entram em cache compartilhado sem política explícita por conta.

**Verificação:** Trocar conta e versão instalada com pendência; testar atualização e funcionamento limitado sem rede na URL real de homologação.

### RNF11 — Erros e observabilidade

Respostas distinguem validação, ausência de sessão, conflito, limite e indisponibilidade. Logs contêm correlação e código estável, sem stack trace ao usuário.

**Verificação:** Simular cada classe de falha e cruzar identificador com log sanitizado. Prazo e destino dos logs dependem de D27.

### RNF12 — Operação e restauração

Ambientes e segredos são separados; alterações de banco reais exigem cópia e restauração testada. D24 exige implantação sem interrupção perceptível; D24 fixa objetivo RPO zero para dados confirmados; RTO e cenários de falha ainda precisam ser definidos.

**Verificação:** Implantar em homologação, testar saúde e restaurar cópia num ambiente isolado. Não prometer recuperação por um processo que nunca foi ensaiado.

### RNF13 — Migração compatível

Nova versão não apaga nem associa arbitrariamente dados existentes; aplicações antigas e novas precisam de estratégia de compatibilidade durante a troca.

**Verificação:** Comparar contagens e amostras fictícias antes/depois, revisar duplicidades e testar versão anterior com esquema expandido; não aplicar down destrutivo como rollback automático.

### RNF14 — Validação no servidor

Campos, tamanhos, datas, referências, cardinalidades e estados são verificados no servidor, inclusive por requisição direta. Texto educativo é renderizado com política segura.

**Verificação:** Enviar payloads inválidos fora da interface; rejeitar sem gravação parcial, sem acesso alheio e sem execução de marcação ou scripts arbitrários.

## Regras confirmadas na rodada 0.3

- **Conclusão após correção (D07):** exercício concluído permanece concluído após editar ou remover séries, inclusive abaixo da meta. Recalcular cargas, repetições e demais resultados derivados; não preservar números obsoletos. Sem séries válidas, manter conclusão e indicar ausência de dados para desempenho. A definição dos indicadores deve separar conclusão de volume efetivamente registrado.
- **Calendário (D08, confirmada):** fuso do dispositivo define hoje e períodos de relatório. Proposta técnica: conservar data local do registro, identificador do fuso e instante UTC; sincronização usa a data de origem. Reavaliar hoje e filtros se o fuso do dispositivo mudar; não deslocar registros antigos silenciosamente. Permitir treinos de dias anteriores sem limite de dias, conforme D08.
- **E-mail (D04, parcial):** um e-mail identifica uma única conta. Proposta técnica: unicidade no servidor e no banco sobre chave normalizada, sem remover pontos ou sufixos específicos de provedores por suposição. Inventariar eventuais duplicidades antes de impor a restrição. Não mesclar, apagar ou bloquear contas automaticamente; fluxo de regularização ainda depende de definição. Obrigatoriedade de e-mail não foi aprovada.

## Consolidação da rodada 0.4

- **D08 confirmada:** seleção explícita de data anterior sem limite de dias. Não adicionar janela de sete, trinta dias ou início da conta por conveniência. Isso não aprova datas futuras nem remove validações de datas e referências. Não criar automaticamente um novo plano ou associar um treino antigo ao plano atual; validar o contexto histórico escolhido.
- **D09 confirmada:** corrigir dados de perfil usados nos cálculos recalcula todo o histórico corporal. Não alterar valores brutos medidos, datas, titularidade ou fórmulas sem necessidade. Proposta técnica: registrar revisão do perfil e versão da fórmula; quando a fórmula usa idade, derivá-la do nascimento corrigido e da data de cada avaliação, em vez da idade de hoje. Não inventar entradas ausentes; avaliações não calculáveis ficam identificadas. Exibir efeito antes de salvar; essa informação não é uma nova solicitação de aprovação na conversa.
- **D10 confirmada:** remover exercício do plano significa arquivá-lo. Histórico permanece consultável mesmo após troca de plano. Identidade independe do nome; renomear não une exercícios distintos. Arquivamento não decide sozinho se novas séries podem ser vinculadas retroativamente ao exercício arquivado; D21 permite novos registros atrasados e sincronização no histórico original, preservando a data e o arquivamento.

## Regras confirmadas na rodada 0.5

- **D16:** módulos e aulas em ordem livre. Questionário exige duas aulas estudadas na mesma versão do próprio módulo. Uma conclusão anterior suficiente não marca automaticamente as novas aulas como estudadas nem libera nova avaliação sem cumprir seus pré-requisitos.
- **D13:** separar conclusão obtida do módulo e progresso por versão. O módulo permanece concluído pela aprovação anterior e mostra aviso de atualização; a versão atual pode aparecer como ainda não estudada, sem impor nova conclusão. Não tratar um módulo diferente com título igual como atualização. Notas e tentativas mantêm a versão original.
- **D15:** respostas não enviadas vivem somente em memória. Avisar antes de navegação controlada que as descarte; cancelar a saída mantém a tela, confirmar descarta. Em recarga/fechamento, usar proteção nativa quando disponível, sem prometer aviso em encerramento forçado, queda do dispositivo ou restrição do navegador. Não criar rota ou armazenamento de rascunho. Idempotência continua necessária para submissões já enviadas.

## Políticas escolhidas na rodada 0.6

- **D11:** primeira entrega aceita somente avatar. Validar formato real, limites, titularidade e armazenamento conforme D12. Não habilitar fluxo corporal, inclusive via chamada direta. Arquivos e vínculos antigos não são apagados; acesso legado protegido deve ser inventariado e definido sem exposição indevida.
- **D29:** uma medição por usuário/data de negócio, editável. Proposta técnica: validação de conflito e restrição concorrente de unicidade após regularização do legado; não substituir silenciosamente uma medição por outra ao criar. Ao receber conflito, orientar abrir a medição existente. Edição de data também verifica conflito. Eventuais múltiplas medições antigas permanecem preservadas e ordenadas por identificador estável até definição de regularização.
- **D03 — substituída na rodada 0.7:** qualquer idade pode se cadastrar. Não impor limite etário; validar nascimento válido e não futuro. A antiga restrição a adultos deixou de vigorar.

## Consolidação vigente da rodada 0.7

- **Cadastro:** qualquer idade, sem fluxo de exclusão, bloqueio ou regularização por ser menor. A decisão não altera automaticamente campos obrigatórios, fórmulas ou a criação de perfil de responsável. Antes da liberação da V2, avaliar adequação dos conteúdos e dos indicadores à faixa etária: não extrapolar fórmulas além da população para a qual foram definidas. Registrar lacunas de conteúdo/dados, sem inventar resultados ou afirmar conformidade não verificada.
- **Visual:** redesenho completo das telas atuais e da área Aprender, preservando o arquivo da logo atual. Elaborar paleta com cores principais, apoio, superfícies e estados; verificar contraste, foco e leitura em todas as combinações. Proposta visual é etapa do redesenho; não existe paleta nova aprovada nesta rodada. Preservar operações, conteúdo e estados de erro existentes.
- **Plataformas:** validar uso web e PWA em iOS, Android e navegadores. Proposta de matriz: Safari/iOS, Chrome/Android e Chrome, Edge e Firefox no computador. Registrar sistema, aparelho, versão do navegador, modo aba/instalado, data e resultado. Não prometer suporte universal ou aplicativos nativos. Testar instalação quando suportada, fila, atualização, autenticação, gráficos, formulários e avisos de saída.

## Regras confirmadas na rodada 0.8

- **D05:** acesso por 30 dias, sujeito a invalidação por recuperação de senha. Proposta de detalhamento: expiração absoluta contada da autenticação, sem renovação deslizante silenciosa. Recuperação bem-sucedida revoga todos os acessos anteriores no servidor e exige login novamente; apagar somente o token local é insuficiente. Não criar botão de saída global por inferência.
- **D20:** antes da saída voluntária, avisar que há registros físicos pendentes e que serão retomados ao reentrar na mesma conta. A saída não exige conexão ou envio prévio; preserva fila vinculada ao titular. Sem login ou com outra conta, conteúdo e envio ficam indisponíveis. Senha recuperada não apaga fila: somente a mesma conta, autenticada novamente, pode retomá-la. Nenhum descarte automático está autorizado.
- **Limites:** fila persistida no dispositivo não implica transferência para outro aparelho nem sobrevivência à limpeza dos dados do navegador. Itens legados sem identidade confiável ficam isolados até regularização; o próximo login não prova propriedade. D15 permanece vigente: respostas de questionário nunca enviadas não entram nessa fila nem ganham persistência.

## Regras confirmadas na rodada 0.9

- **D30:** nova versão pode ser baixada/preparada em segundo plano, mas ativação com recarga espera ausência de alterações de formulário, respostas educativas não enviadas, requisições em voo e fila pendente. Revalidar condição antes de ativar. Proposta técnica: coordenar abas/janelas instaladas quando compartilham o mesmo service worker; uma aba ociosa não pode causar perda em outra. Falha de sincronização não autoriza descarte ou recarga forçada.
- **D14:** retirada oculta módulo do catálogo ativo e bloqueia acesso às aulas/novas tentativas no servidor; titular consulta histórico de estudo, notas e tentativas. Conclusão anterior permanece registrada e suficiente conforme D13. Retirada não é exclusão dos registros. Recuperação idempotente de tentativa confirmada retorna resultado, sem reabrir conteúdo ou criar nova tentativa. Exibição de questões/gabaritos retirados não está aprovada como acesso integral ao conteúdo.
- **D22:** somente exportação entra na primeira entrega. Não habilitar encerramento ou exclusão de conta por extensão do escopo. Arquivo tem dados próprios, sem credenciais; formato, inclusão do avatar e fila local ainda são decisões abertas. Não prometer cópia completa de dados locais se o arquivo for produzido apenas pelo servidor.

## Consolidação da rodada 0.10

- **D21:** aceitar treino atrasado da própria conta com o exercício/plano de origem, inclusive arquivado/encerrado. Preservar data, identidade e contexto; não reabrir plano, reativar exercício ou copiar registro para plano atual. Pendência com referência inexistente ou de outra conta continua inválida; não resolver pelo nome do exercício. Reenvio usa a chave original.
- **D22:** exportação em CSV separado por tipo. Proposta de entrega: ZIP com CSVs e um leia-me/dicionário, codificação UTF-8, cabeçalhos estáveis, datas ISO, unidades explícitas, IDs para relacionar arquivos e versão do formato. Delimitador, representação decimal e proteção de campos que planilhas possam interpretar como fórmulas serão documentados no contrato técnico, sem alterar medidas silenciosamente. Inclusão de avatar e fila ainda não está escolhida.
- **D17:** equipe do projeto revisa e libera. Uma pessoa ainda será indicada para liberação final; não atribuir essa função a um integrante por inferência. Cada pacote registra fontes, autores, revisão e liberação por versão; desenvolvimento com conteúdo fictício continua possível enquanto a indicação é concluída.

## Consolidação da rodada 0.11

- **Exportação:** somente registros confirmados no servidor, em CSV por tipo. Não bloquear pela fila local; não misturar pendências com dados confirmados. Aviso específico quando houver pendências conhecidas da conta no dispositivo, acompanhado de declaração geral de alcance do servidor e referência temporal. Não prometer verificação da fila em outros dispositivos. Avatar ainda depende de definição.
- **Etapa atual:** desenvolver/testar somente localmente, com banco isolado e dados fictícios. Homologação hospedada não integra a etapa autorizada; atividades futuras de implantação não se tornam dispensadas por essa escolha.
- **Disponibilidade:** implantação planejada deve ser imperceptível ao usuário. Converter esse objetivo em critérios verificáveis para login, leituras, gravações, requisições em andamento e reenvios. Proposta técnica: versões de aplicação coexistentes com esquema compatível, preparação da nova versão antes da troca, verificações de saúde, conclusão de requisições antigas e retorno seguro à versão anterior. A viabilidade depende da infraestrutura, ainda não inspecionada; não prometer zero falhas apenas por prever duas instâncias. RPO/RTO de desastres são decisões separadas da disponibilidade durante implantação.

## Consolidação vigente da rodada 0.12

- **Exportação:** somente CSV por tipo com dados do servidor, sem arquivo do avatar e sem pendências locais. Avisar o alcance e as pendências conhecidas. Não remover o avatar da conta por essa escolha; apenas não incluí-lo no pacote exportado.
- **Plataforma:** manter React/TypeScript, backend .NET e PostgreSQL da base, ajustando compatibilidade quando necessário e demonstrado. A escolha não significa que versões ou build já foram validados; inventariar a base atual antes de implementar. Redesenho não autoriza reescrever a stack.
- **Recuperação:** objetivo RPO zero para operações confirmadas ao usuário. Não confundir esse objetivo com fila ainda não sincronizada, que não foi confirmada pelo servidor. Definir domínios de falha e RTO antes de prometer cobertura. Cópias periódicas, isoladamente, não demonstram que todo dado confirmado possa ser recuperado após a perda da base principal. Avaliar confirmação durável e proteção em domínio de falha independente para o cenário escolhido, além de cópia/restauração verificadas. Escolha de tecnologia, infraestrutura, custo e viabilidade continuam pendentes; não contratar ou declarar garantia nesta etapa.

## Consolidação vigente da rodada 0.13

- Prazo de recuperação em incidente grave permanece sem valor aprovado: o responsável decidiu avaliar custos e alternativas antes de defini-lo. Perda zero dos dados confirmados e ausência de interrupção perceptível durante implantação continuam objetivos separados.
- Aplicação e banco estão em serviços separados, conforme declaração do responsável. Não inferir provedor, região, quantidade de instâncias, replicação, armazenamento persistente de arquivos, backup ou SLA a partir dessa informação.
- Antes de escolher proteção operacional, comparar alternativas contra cenários explicitados e inventário real; registrar custo total, esforço operacional, evidência de durabilidade e tempo de recuperação. Esta rodada não faz cotação nem verifica recursos dos provedores.
