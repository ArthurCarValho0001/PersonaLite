# Registro de respostas e consolidação

Data: 26/10/2026. Versão do levantamento: 0.13. Estado: vinte decisões encerradas; D04, D17, D20, D24, D26 e D29 parcialmente resolvidas; outras seis decisões abertas; implementação não iniciada.

Base GitHub: `ArthurCarValho0001/PersonaLite`, revisão `23ab62d46a77683f38df72c38d8b2785ea19bce8`.

Preencha em texto curto ou responda pelas rodadas na conversa. As escolhas serão incorporadas numa versão consolidada. D01, D02, D06, D07, D08, D09, D10, D13, D15 e D16 estão confirmadas. D04 tem unicidade de e-mail definida e tratamento do legado pendente. Outras seis decisões permanecem abertas.

## Rodada inicial

- D01 — **confirmada em 26/10/2026:** A aplicação já tem usuários reais em uso diário, inclusive o responsável. A V2 deve ser preparada como evolução de uma aplicação em uso. Não foi decidido alterar a política atual de novos cadastros.
- D02 — **confirmada em 26/10/2026:** Preservar todas as contas e todos os seus históricos. Nenhum reset, descarte ou seleção de contas para migração está autorizado.
- D06 — **confirmada em 26/10/2026:** Concluir automaticamente ao atingir a meta de séries, mantendo o botão de conclusão manual.

## Demais decisões

### D03 — Público e idade

Resposta registrada em 26/10/2026: Qualquer idade pode se cadastrar. Esta resposta substitui a restrição anterior a adultos e encerra a dúvida sobre 18 ou 19 anos. Não aplicar idade mínima nem bloquear contas por idade. Continuar validando nascimento válido e não futuro; cadastro permitido não significa que todas as fórmulas ou conteúdos são adequados a qualquer idade.

Responsável pela escolha: Produto.

Estado: confirmada.

### D04 — Identidade e e-mail

Resposta registrada em 26/10/2026: Cada e-mail identifica uma única conta. A resposta não torna o e-mail obrigatório. O tratamento de eventuais duplicidades existentes ainda precisa ser definido, preservando todas as contas e históricos; não há autorização para mesclar, excluir ou bloquear contas automaticamente.

Responsável pela escolha: Produto e engenharia.

Estado: parcialmente resolvida.

### D05 — Sessões

Resposta registrada em 26/10/2026: Permitir permanecer conectado por 30 dias. Ao redefinir senha esquecida, encerrar todos os acessos existentes e exigir novo login em todos os dispositivos, inclusive no dispositivo que realizou a recuperação. A redefinição não autentica automaticamente. Não foi solicitada uma nova ação de saída global no menu nem renovação automática ilimitada da sessão.

Responsável pela escolha: Produto e engenharia.

Estado: confirmada.

### D07 — Correção após conclusão

Resposta registrada em 26/10/2026: Manter o exercício concluído após edição ou remoção de séries e recalcular os resultados a partir das séries válidas restantes, mesmo abaixo da meta. Se todas forem removidas, preservar o estado de conclusão e mostrar ausência de séries válidas, sem inventar resultados ou divisões por zero.

Responsável pela escolha: Produto.

Estado: confirmada.

### D08 — Data do treino

Resposta registrada em 26/10/2026: Fuso do dispositivo define o dia do treino e os períodos dos relatórios. Permitir registrar treinos de dias anteriores sem limite de dias. Preservar a data escolhida no reenvio e as datas históricas existentes. A escolha não autoriza lançamentos futuros.

Responsável pela escolha: Produto.

Estado: confirmada.

### D09 — Mudança no perfil

Resposta registrada em 26/10/2026: Ao corrigir dados do perfil usados nos cálculos corporais, recalcular todo o histórico de avaliações da própria conta. Preservar medições brutas, datas e vínculos; atualizar resultados derivados e gráficos. A decisão define o efeito das correções e não confirma que todos os campos já sejam editáveis na interface.

Responsável pela escolha: Produto.

Estado: confirmada.

### D10 — Histórico de exercícios

Resposta registrada em 26/10/2026: Ao remover um exercício do plano, arquivá-lo e manter seu histórico consultável. Preservar identidade, sessões, séries e resultados; não excluir fisicamente o histórico nem associar exercícios diferentes por nome igual.

Responsável pela escolha: Produto.

Estado: confirmada.

### D11 — Fotos

Resposta registrada em 26/10/2026: Somente avatar do perfil na primeira entrega. Não oferecer novos envios de fotos corporais de progresso; desabilitar a respectiva rota de gravação no servidor. Preservar eventuais arquivos e vínculos existentes conforme D02, sem apagamento automático. Limites e armazenamento do avatar continuam em D12.

Responsável pela escolha: Produto.

Estado: confirmada.

### D12 — Política de imagens

Resposta: pendente.

Responsável pela escolha: Produto e engenharia.

Data e observações: a preencher.

### D13 — Versões educativas

Resposta registrada em 26/10/2026: Manter a conclusão anterior suficiente quando o mesmo módulo receber nova versão e avisar sobre a atualização. Preservar a versão efetivamente estudada e aprovada no histórico; não fabricar estudo, tentativas ou nota na versão nova. Novo estudo é opcional; concluir originalmente uma versão ainda exige suas duas aulas e aprovação.

Responsável pela escolha: Produto e editorial.

Estado: confirmada.

### D14 — Retirada de conteúdo

Resposta registrada em 26/10/2026: Quando um módulo educativo for retirado do catálogo, permitir somente consulta ao próprio histórico de estudo, notas e tentativas, em modo de leitura. Não disponibilizar as aulas antigas nem iniciar novo estudo ou tentativa na versão retirada. Preservar resultados e conclusão já obtidos, sem fabricar progresso em outras versões.

Responsável pela escolha: Produto e editorial.

Estado: confirmada.

### D15 — Respostas em preenchimento

Resposta registrada em 26/10/2026: Não salvar respostas de questionário ainda não enviado. Manter somente em memória da tela enquanto aberta, avisar antes de sair e descartar ao confirmar a saída. Não criar rascunhos locais nem no servidor. Respostas não enviadas não geram tentativa, nota ou progresso.

Responsável pela escolha: Produto.

Estado: confirmada.

### D16 — Ordem das aulas e módulos

Resposta registrada em 26/10/2026: Permitir escolha livre da ordem das aulas e dos módulos. Liberar o questionário somente após estudar as duas aulas do próprio módulo na versão correspondente; estudar aulas de módulos ou versões diferentes não satisfaz essa condição.

Responsável pela escolha: Produto.

Estado: confirmada.

### D17 — Revisão editorial

Resposta registrada em 26/10/2026: A equipe do projeto ficará responsável pela revisão e liberação das aulas e questões educativas antes da publicação. Uma pessoa responsável pela liberação final ainda será indicada. Não presumir pessoa específica nem revisão profissional realizada. Registrar autoria, fontes, revisão, data e liberação por versão; conteúdo real não é publicado enquanto faltar a indicação e a revisão.

Responsável pela escolha: Produto e editorial.

Estado: parcialmente resolvida.

### D18 — Autenticação e abuso

Resposta: pendente.

Responsável pela escolha: Engenharia com produto.

Data e observações: a preencher.

### D19 — Chaves de reenvio

Resposta: pendente.

Responsável pela escolha: Engenharia.

Data e observações: a preencher.

### D20 — Fila antiga e saída da conta

Resposta registrada em 26/10/2026: Ao sair com registros não sincronizados, avisar e guardar as pendências para sincronizar ao entrar novamente na mesma conta. Permitir sair sem obrigar sincronização e sem descartar automaticamente. Outra conta não pode ver ou enviar essas pendências. A resposta vale para registros físicos da fila, não para respostas educativas ainda não enviadas (D15). A identificação e regularização de itens legados sem dono continuam pendentes; não atribuí-los ao próximo login.

Responsável pela escolha: Produto e engenharia.

Estado: parcialmente resolvida.

### D21 — Conflito de sincronização

Resposta registrada em 26/10/2026: Permitir que um treino registrado com atraso seja vinculado ao exercício original, mesmo arquivado ou pertencente a plano encerrado; salvar no histórico original, preservando a data escolhida. Aplicar a mesma regra à sincronização de registros pendentes. Validar titularidade e referências; não reabrir plano nem reativar exercício automaticamente, não mover registros para o plano vigente e não associar por nome.

Responsável pela escolha: Produto.

Estado: confirmada.

### D22 — Conta e privacidade

Resposta registrada em 26/10/2026: Exportar somente dados confirmados no servidor em arquivos CSV separados por tipo de dado, sem incluir o arquivo do avatar. Avisar quando houver pendências locais conhecidas fora do arquivo, sem exigir sincronização prévia nem incluí-las. Informar referência temporal e alcance; não presumir conhecimento da fila de outros aparelhos. Excluir credenciais. Encerramento/exclusão de conta não entra nesta entrega.

Responsável pela escolha: Produto.

Estado: confirmada.

### D23 — Ambientes e orçamento

Resposta registrada em 26/10/2026: Somente desenvolvimento e testes locais nesta primeira etapa. Usar banco separado do serviço atual e dados fictícios; não criar ou contratar homologação hospedada nem alterar produção. Ambiente externo para validação de implantação será planejado depois, se necessário, antes de publicar.

Responsável pela escolha: Produto e engenharia.

Estado: confirmada para esta etapa.

### D24 — Recuperação operacional

Resposta registrada em 26/10/2026: Manter os objetivos de implantação sem interrupção perceptível e perda zero dos dados confirmados (RPO zero), ainda a demonstrar. O prazo de recuperação em incidente grave (RTO) será definido após avaliação de custos e alternativas, sem prazo presumido. Aplicação e banco atuais estão em serviços separados, conforme informação do responsável; provedores, planos, regiões, arquivos e recursos disponíveis ainda não foram identificados. Essa separação não comprova redundância, backup ou recuperação sem perda. Nenhuma contratação, publicação ou alteração de produção está autorizada nesta etapa local.

Responsável pela escolha: Produto e engenharia.

Estado: parcialmente resolvida.

### D25 — Visual

Resposta registrada em 26/10/2026: Fazer um redesenho completo da interface, mantendo a logo atual e explorando melhor as cores. Preservar funcionalidades, contas, históricos e regras aprovadas. Paleta, tipografia, componentes e telas serão apresentados em proposta visual antes da implementação das telas; não substituir a logo nem inventar funcionalidades durante o redesenho.

Responsável pela escolha: Produto.

Estado: confirmada.

### D26 — Dispositivos

Resposta registrada em 26/10/2026: Incluir iOS, Android e navegadores na validação. Proposta inicial de matriz: Safari no iOS, Chrome no Android e Chrome/Edge/Firefox em computador. Navegadores, versões, aparelhos e modos de uso exatos ainda precisam ser registrados na matriz de aceite; essa proposta não equivale a suporte a todos os navegadores ou versões nem à criação de aplicativos nativos.

Responsável pela escolha: Produto e QA.

Estado: parcialmente resolvida.

### D27 — Observabilidade

Resposta: pendente.

Responsável pela escolha: Engenharia com produto.

Data e observações: a preencher.

### D28 — E-mails

Resposta: pendente.

Responsável pela escolha: Produto e engenharia.

Data e observações: a preencher.

### D29 — Medições duplicadas

Resposta registrada em 26/10/2026: Uma medição corporal por conta e por data, permitindo editar a existente. Impedir novas duplicidades também em concorrência e ao alterar a data de uma medição. Eventuais duplicidades históricas devem ser inventariadas e preservadas; regularização depende de definição, sem descarte ou fusão automática.

Responsável pela escolha: Produto.

Estado: parcialmente resolvida; política escolhida.

### D30 — Atualização de interface instalada

Resposta registrada em 26/10/2026: Atualizar automaticamente somente quando não houver trabalho em andamento. Adiar ativação/recarregamento enquanto houver formulário com alterações não enviadas, questionário preenchido, operação em envio ou registros pendentes de sincronização. Verificar novamente imediatamente antes de atualizar. Não descartar trabalho para viabilizar atualização.

Responsável pela escolha: Engenharia com produto.

Estado: confirmada.

### D31 — Dependências

Resposta registrada em 26/10/2026: Manter as plataformas atuais e realizar somente ajustes necessários de compatibilidade. Não planejar troca de stack ou atualização ampla de plataforma nesta refatoração. Registrar versões e corrigir problemas demonstrados de instalação, build, tipos e dependências com alterações justificadas; não mascarar falhas apagando lockfile ou atualizando tudo.

Responsável pela escolha: Engenharia.

Estado: confirmada.

### D32 — Proteção de conteúdo e retentativas

Resposta: pendente.

Responsável pela escolha: Produto e editorial.

Data e observações: a preencher.

## Controle de alterações

| Versão | Data | Registro |
|---|---|---|
| 0.1 | 26/10/2026 | Levantamento e recomendações, sem escolhas presumidas ou implementação. |
| 0.2 | 26/10/2026 | D01: usuários reais em uso diário; D02: preservar todas as contas e históricos; D06: conclusão automática e botão manual. Outras 29 decisões abertas. |
| 0.3 | 26/10/2026 | D07 confirmada: manter conclusão e recalcular. D08: fuso do dispositivo; retroatividade pendente. D04: e-mail único; legado pendente. Quatro encerradas, duas parciais e 26 sem resposta. |
| 0.4 | 26/10/2026 | D08: treinos anteriores sem limite. D09: recálculo de todo o histórico. D10: arquivamento com consulta. Sete decisões encerradas, uma parcial e 24 sem resposta. |
| 0.5 | 26/10/2026 | D16: ordem livre. D13: conclusão suficiente após atualização, com aviso. D15: sem persistência de respostas não enviadas, com aviso ao sair. Dez encerradas, uma parcial e 21 abertas. |
| 0.6 | 26/10/2026 | D11: somente avatar. D29: uma medição por data, com edição; legado pendente. D03: adultos; fronteira dos 18 anos e legado pendentes. Onze encerradas, três parciais e 18 abertas. |
| 0.7 | 26/10/2026 | D03 substitui restrição adulta por qualquer idade. D25: redesenho completo, logo atual e melhor uso das cores. D26: iOS, Android e navegadores; matriz exata pendente. Treze encerradas, três parciais e 16 abertas. |
| 0.8 | 26/10/2026 | D05: acesso por 30 dias; recuperação encerra todos os acessos e exige login. D20: avisar e preservar fila ao sair, retomada pela mesma conta; legado sem dono pendente. Quatorze encerradas, quatro parciais e 14 abertas. |
| 0.9 | 26/10/2026 | D30: atualizar automaticamente sem trabalho em andamento. D14: somente histórico de módulos retirados. D22: somente exportação; formato/abrangência pendentes. Dezesseis encerradas, cinco parciais e 11 abertas. |
| 0.10 | 26/10/2026 | D22: CSV separado por tipo; abrangência pendente. D21: treino atrasado no histórico original, inclusive arquivado/plano encerrado. D17: equipe revisa/libera, pessoa a indicar. Dezessete encerradas, seis parciais e nove abertas. |
| 0.11 | 26/10/2026 | D22: somente dados do servidor, aviso de pendências fora do arquivo. D23: somente local nesta etapa. D24: preparar implantação sem interrupção perceptível; recuperação ainda a definir. Dezoito encerradas, sete parciais e sete abertas. |
| 0.12 | 26/10/2026 | D22 encerrada: somente CSV, sem avatar. D31: manter plataformas e ajustes necessários. D24: perda zero de dados confirmados como objetivo; RTO/cenários pendentes. Vinte encerradas, seis parciais e seis abertas. |
| 0.13 | 26/10/2026 | D24: RTO adiado até avaliar custos e alternativas. Aplicação e banco informados em serviços separados; provedores ainda desconhecidos. Contagens permanecem 20 encerradas, seis parciais e seis abertas. |

“Levantamento completo nesta rodada” significa que as lacunas identificadas estão registradas. Não significa que todo requisito já foi decidido ou que a publicação está liberada.
