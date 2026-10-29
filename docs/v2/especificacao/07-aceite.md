# Aceite, regressão e rastreabilidade

Data: 26/10/2026. Versão do levantamento: 0.13. Estado: vinte decisões encerradas; D04, D17, D20, D24, D26 e D29 parcialmente resolvidas; outras seis decisões abertas; implementação não iniciada.

Base GitHub: `ArthurCarValho0001/PersonaLite`, revisão `23ab62d46a77683f38df72c38d8b2785ea19bce8`.

Todos os cenários abaixo são planejados; nenhuma linha representa teste executado nesta rodada. Os critérios completos estão no arquivo 03. Casos de uso acadêmicos são preservados como referência e serão refinados após as decisões. RF17 está definido por D15; RF23 inclui somente exportação, com detalhes pendentes em D22.

## Matriz de referência

| Requisito | Caso de uso relacionado | Lote | Decisões | Cenários |
|---|---|---|---|---|
| RF01 | UC01 | E1/E2 | D01 D03 D04 | T-RF01-01, T-RF01-02, T-RF01-03 |
| RF02 | UC02 | E1/E2 | D05 D20 | T-RF02-01, T-RF02-02, T-RF02-03 |
| RF03 | UC03 | E1 | D04 D09 | T-RF03-01, T-RF03-02, T-RF03-03 |
| RF04 | UC04 | E2 | D04 D05 D18 D28 | T-RF04-01, T-RF04-02, T-RF04-03 |
| RF05 | UC05 | E1/E2 | D08 D09 D29 | T-RF05-01, T-RF05-02, T-RF05-03 |
| RF06 | UC08 | E1/E5 | D08 D09 D29 | T-RF06-01, T-RF06-02, T-RF06-03 |
| RF07 | UC06 | E1/E2 | D10 | T-RF07-01, T-RF07-02, T-RF07-03 |
| RF08 | UC07 | E1/E2 | D06 D07 D08 D10 | T-RF08-01, T-RF08-02, T-RF08-03 |
| RF09 | UC07 | E1/E2 | D06 D07 | T-RF09-01, T-RF09-02, T-RF09-03 |
| RF10 | UC08 | E1/E2 | D06 D07 D08 D10 | T-RF10-01, T-RF10-02, T-RF10-03 |
| RF11 | UC09 | E3 | D14 D16 D17 D25 | T-RF11-01, T-RF11-02, T-RF11-03 |
| RF12 | UC09 | E3 | D13 D14 D17 | T-RF12-01, T-RF12-02, T-RF12-03 |
| RF13 | UC10 | E4 | D15 D18 D19 D32 | T-RF13-01, T-RF13-02, T-RF13-03, T-RF13-04 |
| RF14 | UC11 | E4 | D13 D14 D16 | T-RF14-01, T-RF14-02, T-RF14-03 |
| RF15 | UC12 | E2 | D08 D19 D20 D21 D30 | T-RF15-01, T-RF15-02, T-RF15-03, T-RF15-04 |
| RF16 | Processo editorial sem novo ator de interface | E3 | D13 D14 D17 | T-RF16-01, T-RF16-02, T-RF16-03 |
| RF17 | Extensão de UC10: aviso e descarte | E4 | D15 D20 D30 | T-RF17-01, T-RF17-02, T-RF17-03 |
| RF18 | UC02/UC04 | E2 | D04 D05 D18 | T-RF18-01, T-RF18-02, T-RF18-03 |
| RF19 | UC03/UC05, detalhar leitura de mídia | E2 | D11 D12 | T-RF19-01, T-RF19-02, T-RF19-03 |
| RF20 | UC05/UC07/UC08 | E2 | D08 D09 D29 | T-RF20-01, T-RF20-02, T-RF20-03 |
| RF21 | UC06/UC08 | E2 | D07 D10 D21 | T-RF21-01, T-RF21-02, T-RF21-03 |
| RF22 | UC09/UC10/UC11 | E4/E5 | D13 D14 D19 D30 | T-RF22-01, T-RF22-02, T-RF22-03 |
| RF23 | Exportar os próprios dados | E6 | D02 D22 D24 D27 | T-RF23-01, T-RF23-02, T-RF23-03 |

## Cenários transversais indispensáveis

1. **Conta A e B:** B tenta consultar, alterar e enviar arquivo na medição de A; tenta ler tentativa e fila de A. Nenhum efeito nem conteúdo exposto.
2. **Concorrência de cadastro:** duas solicitações para o mesmo usuário normalizado não criam duas contas; eventual conflito do banco é traduzido sem erro interno.
3. **Concorrência de sessão:** duas séries do mesmo exercício/data não criam sessões diárias duplicadas nem perdem uma série válida.
4. **Confirmação perdida:** servidor grava série e a rede cai; cliente reenvia com a mesma chave e recebe o mesmo resultado sem repetição.
5. **Chave alterada:** mesma conta/chave com conteúdo diferente é rejeitada; outra conta não recupera o resultado.
6. **Código de recuperação:** código expirado, usado ou de outra finalidade falha; dois consumos simultâneos não alteram senha duas vezes; falha de persistência reverte o conjunto.
7. **Elegibilidade educativa:** envio direto sem duas aulas não produz nota ou conclusão; questões de outra versão são rejeitadas.
8. **Notas de referência:** zero, três, quatro e cinco acertos correspondem a 0, 60, 80 e 100 por cento. Quatro aprova e três não.
9. **Nova tentativa inferior:** aprovação prévia permanece; tentativa posterior é preservada no histórico e não reduz a melhor nota.
10. **Falha na transação:** falhar entre tentativa e progresso não deixa registro parcialmente confirmado.
11. **Atualização de curso:** uma versão nova não recebe automaticamente as marcações da antiga; versão retirada não inicia nova tentativa e ainda permite recuperar resultado próprio já confirmado.
12. **Aplicativo aberto à noite:** Brasília, fronteira UTC, virada do mês, aniversário e meia-noite com tela aberta seguem o mesmo calendário escolhido.
13. **Plano e nome:** exercício renomeado/arquivado e plano encerrado não somem com o histórico fora da política definida. Não unir movimentos diferentes por nome igual.
14. **Fila legada:** item sem dono não é enviado após login de outra conta. Tratamento exige decisão explícita, sem apagar silenciosamente.
15. **Conflito permanente:** item rejeitado por validação fica visível apenas à conta correta e não impede indefinidamente outros itens elegíveis.
16. **Arquivos:** conteúdo incompatível com extensão, excesso de tamanho/dimensões, falha de gravação e acesso sem sessão não produzem arquivo público ou referência órfã.
17. **Acessibilidade:** teclado, leitor de tela, contraste, erro por campo, 200% de zoom e larguras definidas permitem concluir o fluxo; resultados dos gráficos também são legíveis como texto.
18. **Operação:** nova implantação mantém arquivos necessários; restauração testada recupera esquema, dados e vínculo com arquivos sem misturar ambientes.
19. **Sem vazamento de avaliação:** GET inicial não inclui correta/explicação com gabarito; resultado próprio confirmado pode incluir a devolutiva educativa prevista.
20. **Conteúdo e erros:** texto renderizado não executa scripts; erro técnico não apresenta nota zero, gabarito, token ou stack trace.

## Evidências a registrar na implementação

Para cada teste: revisão, ambiente, navegador quando aplicável, dados fictícios, passos, resultado esperado, resultado observado, data e evidência sanitizada. Falha cria pendência com ID; repetição do teste aponta a correção. Este documento não deve receber status “passou” sem execução.

Os testes acadêmicos TC01–TC24 continuam como referência do pacote anterior. Os identificadores T-RFxx-yy detalham o aceite técnico da V2; não alegam substituir retroativamente aquela evidência, que também era planejada.

## Confirmações da rodada 0.2 e regressão adicional

D01/D02/D06 estão confirmadas: usuários reais em uso diário, todas as contas e históricos preservados, conclusão automática ao atingir a meta e botão manual mantido. Não substituir a lógica por conclusão exclusivamente manual.

21. **Conclusão automática:** registrar a série que atinge a meta; exercício fica concluído sem outro clique. Ultrapassar meta não duplica sessão nem conclusão.
22. **Conclusão manual:** concluir com séries válidas antes de atingir a meta continua possível; nenhuma série fictícia é criada.
23. **Preservação integral:** em ensaio de migração, contas, hashes de acesso e históricos mantêm identidade e vínculos; conferir contagens e amostras sem divulgar dados pessoais. Nenhum reset é aceitável.
24. **Compatibilidade de implantação:** ensaiar versão atual com esquema expandido e atualização da aplicação; definir janela de indisponibilidade conforme decisão operacional futura, sem prometer zero por suposição.

D07 foi resolvida na rodada 0.3: manter conclusão e recalcular resultados. Nenhum dos cenários acima foi executado nesta rodada de documentação.

## Cenários adicionais da rodada 0.3 — planejados, não executados

25. **Correção após concluir:** atingir meta, editar carga/repetições e remover uma série; conclusão permanece e todos os resultados derivados refletem as séries restantes, inclusive abaixo da meta.
26. **Remoção de todas as séries:** preservar conclusão e sessão histórica; apresentar ausência de séries e não gerar volume, médias ou recordes fictícios.
27. **Fuso e mudança de dia:** dispositivo e servidor em fusos diferentes, virada de mês e aplicativo aberto à meia-noite; data de negócio e período de relatório seguem o dispositivo.
28. **Fila e mudança de fuso:** criar pendência sem rede, mudar de fuso/dispositivo e reenviar; preservar a data de origem, sem duplicar nem deslocar o treino para o dia do reenvio. Datas antigas continuam intactas.
29. **Unicidade de e-mail:** novos cadastros e alterações, inclusive simultâneos e com variação de caixa/espaços externos, não associam a mesma chave normalizada a duas contas. Contas existentes sem e-mail não são excluídas nem obrigadas a preenchê-lo por suposição.
30. **Legado com duplicidades:** ensaio identifica conflitos sem apagamento, mesclagem ou bloqueio automático; implantação da restrição aguarda política de regularização. Não afirmar que existem duplicidades sem inventário.

## Cenários adicionais da rodada 0.4 — planejados, não executados

31. **Sem janela retroativa:** registrar treino de ontem, mais de um ano atrás e anterior à criação da conta em cenário fictício com referências válidas; não rejeitar apenas por antiguidade. Preservar data no histórico e reenvio; não presumir permissão para datas futuras.
32. **Recálculo completo:** corrigir dado de perfil relevante e comparar todas as avaliações com resultados de referência da fórmula vigente, inclusive datas com idades diferentes. Valores brutos, datas e quantidade de avaliações permanecem iguais; gráficos e resumos refletem os novos resultados.
33. **Falha e concorrência no recálculo:** interromper processamento e executar correções simultâneas; não publicar conjunto parcialmente atualizado nem perder nova medição. Dado insuficiente produz indicação explícita, sem cálculo inventado.
34. **Exercício arquivado:** remover exercício com séries registradas, trocar plano e consultar histórico; sessões, séries e resultados continuam acessíveis somente ao titular. Novo exercício de nome igual não recebe o histórico do arquivado.

A seleção do contexto histórico e o tratamento de pendências de exercícios arquivados/planos encerrados ainda serão detalhados em D21.

## Cenários adicionais da rodada 0.5 — planejados, não executados

35. **Navegação livre:** abrir módulos e aulas em qualquer ordem. Uma aula de cada versão não libera questionário; duas aulas da mesma versão e módulo liberam.
36. **Atualização após conclusão:** publicar nova versão do mesmo módulo; conclusão anterior permanece suficiente com aviso e versão de origem, sem notas/tentativas/aulas fabricadas na nova. Novo módulo de nome igual não herda conclusão.
37. **Estudo opcional atualizado:** usuário já aprovado pode estudar a versão nova; nova avaliação exige suas duas aulas, e nota menor não remove a conclusão anterior.
38. **Sair do questionário:** preencher respostas, tentar navegar e cancelar; memória preservada. Repetir e confirmar saída; respostas descartadas sem tentativa, nota ou progresso. Voltar à tela ou entrar em outro dispositivo não recupera respostas.
39. **Limites do navegador e envio incerto:** conferir aviso nativo nos navegadores definidos, sem exigir aviso impossível em fechamento forçado. Após envio com resposta perdida, recuperar resultado pela chave original, sem criar nova tentativa nem confundir com respostas nunca enviadas.

## Cenários adicionais da rodada 0.6 — planejados, não executados

40. **Somente avatar:** avatar válido pode ser alterado pelo titular conforme D12; envio corporal direto é recusado sem novos arquivos/metadados. Arquivos legados e referências continuam preservados, sem exposição a outra conta.
41. **Medição por data:** duas criações para mesma conta/data, inclusive simultâneas, não criam duas medições novas; contas distintas podem usar a mesma data. Reenvio idempotente não é tratado como novo registro conflitante.
42. **Edição:** alterar valores mantém identidade; alterar data para outra já ocupada retorna conflito sem perda. Datas consideram o calendário de negócio, inclusive servidor em outro fuso.
43. **Duplicidade legada:** conjunto fictício com múltiplas medições antigas na mesma data permanece íntegro; nenhum registro é removido ou fundido automaticamente. Política de regularização antecede restrição definitiva.
44. **Cadastro em qualquer idade — substitui o cenário etário da 0.6:** testar contas fictícias abaixo, no dia e acima de 18 anos; nenhuma é recusada apenas pela idade. Nascimento inválido/futuro é rejeitado também por chamada direta. Não bloquear contas antigas por idade.

## Cenários adicionais da rodada 0.7 — planejados, não executados

45. **Logo e redesenho:** nova proposta cobre telas e estados do inventário, usa a logo atual e demonstra paleta, hierarquia, navegação e mensagens. Conferir contraste, teclado, foco e leitura; nenhuma funcionalidade aprovada desaparece na troca de layout.
46. **Matriz de plataformas:** executar jornada de conta, medidas, treino, fila, relatórios, aprendizagem e atualização em iOS, Android e navegadores definidos, registrando versões e modo de uso. Não considerar uma plataforma aprovada apenas por emulação de largura de tela.
47. **Adequação por idade:** inventariar domínios das fórmulas e conteúdos, testar limites documentados e ausência de entradas válidas. Cadastro permitido em qualquer idade não autoriza exibir indicadores fora do domínio sem tratamento explícito.

## Cenários adicionais da rodada 0.8 — planejados, não executados

48. **Validade de sessão:** com relógio controlado, validar imediatamente antes e no instante de expiração de 30 dias, conforme contrato de expiração; atividade não prolonga silenciosamente o prazo proposto. Expiração exige login e não apaga fila.
49. **Recuperação e revogação:** abrir acessos em dois dispositivos e redefinir senha; todas as credenciais anteriores são rejeitadas após confirmação, inclusive em API/arquivos e no dispositivo da recuperação. Não há login automático; novo login exige senha nova. Reinício do servidor não restaura credenciais revogadas.
50. **Atomicidade:** falha entre consumo do código, senha e revogação não deixa mudança parcial. Uso concorrente de código só permite uma redefinição; sessão emitida concorrentemente não pode contornar a revogação.
51. **Saída com fila:** criar pendência offline, sair e verificar aviso; item permanece no dispositivo vinculado à conta. Outra conta não lê nem envia; reentrar na conta original retoma sem duplicidade e com data original.
52. **Troca e expiração durante envio:** confirmar resposta perdida, logout e login em outra conta; não reenviar com identidade diferente. Recuperar senha e reentrar na conta original preserva pendências. Respostas educativas nunca enviadas seguem descarte de D15.

## Cenários adicionais da rodada 0.9 — planejados, não executados

53. **Atualização ociosa:** detectar versão nova sem alterações, submissões ou fila; atualizar automaticamente e manter acesso/dados conforme política. Reavaliar condição imediatamente antes da ativação.
54. **Trabalho em andamento:** com formulário alterado, questionário preenchido, operação em envio ou fila pendente, não ativar/recarregar. Testar segunda aba ociosa e janela instalada; nenhuma pode causar perda na aba ocupada. Após concluir/sincronizar, atualizar sem descarte forçado.
55. **Conteúdo retirado:** histórico próprio, notas, tentativas e conclusão continuam consultáveis; aulas e novas tentativas ficam indisponíveis inclusive por URL/API direta. Outra conta não acessa histórico. Reenvio confirmado recupera resultado, sem nova tentativa.
56. **Exportação:** comparar arquivo com conjunto fictício de referência conforme formato/escopo ainda a decidir. Conferir unidades, datas, versão do formato, dados arquivados e isolamento entre contas; nenhuma credencial aparece. Exportar não altera dados nem cria encerramento de conta.
57. **Dados não sincronizados:** arquivo informa seu alcance; não declarar que fila local está incluída sem implementá-la. Downloads temporários, se adotados, não permitem acesso por outro titular nem permanecem públicos.

## Cenários adicionais da rodada 0.10 — planejados, não executados

58. **CSV por tipo:** validar arquivos do pacote contra o esquema acordado, inclusive IDs de relacionamento, datas, unidades, acentos, quebras de linha, aspas e campos semelhantes a fórmulas. Valores não devem mudar silenciosamente ao exportar; nenhuma credencial aparece.
59. **Treino atrasado original:** arquivar exercício, encerrar plano e registrar/sincronizar série atrasada; referência e data permanecem originais, sem reativar plano/exercício ou mover ao atual. Reenvio não duplica. Outra conta ou referência inexistente é recusada.
60. **Revisão editorial:** pacote real sem pessoa de liberação indicada ou sem revisão registrada não é publicado. Após indicação e revisão, validar autoria, fontes, versão e gabaritos antes da liberação. Conteúdo fictício de desenvolvimento é identificado como tal.

## Cenários adicionais da rodada 0.11 — planejados, não executados

61. **Exportação com pendências:** exportar com fila local da própria conta; arquivo contém só servidor, aviso informa exclusão das pendências e não exige envio prévio. Dados sincronizados depois do instante de referência não são declarados incluídos. Não presumir conhecimento da fila de outro aparelho.
62. **Isolamento local:** verificar conexões e serviços de teste; desenvolvimento não acessa banco real nem envia e-mails a usuários. Registrar evidência sem expor segredos.
63. **Implantação futura sem interrupção perceptível:** antes da publicação, ensaiar troca de versão enquanto clientes antigos/novos fazem login, leitura e gravação e há requisições em andamento. Conferir ausência de falhas e de gravações perdidas/duplicadas, continuidade dos arquivos/sessões e sincronização. Registrar ambiente, carga, duração e critérios mensuráveis. Ensaio local não substitui validação da infraestrutura real; nenhum resultado foi obtido nesta rodada.
64. **Reversão compatível:** falha da versão nova retorna ao serviço anterior sem apagar dados confirmados ou usar down destrutivo. Testar locks/migrações e compatibilidade dos clientes. Objetivos de restauração em desastre ainda dependem de D24.

## Cenários adicionais da rodada 0.12 — planejados, não executados

65. **Exportação sem avatar:** conferir CSVs da própria conta, ausência do arquivo da foto e de credenciais, aviso de pendências excluídas e referência temporal. Avatar permanece disponível na conta conforme política de mídia.
66. **Plataforma preservada:** conferir diff de dependências e plataforma; alterações de compatibilidade têm problema demonstrado e validação de build, sem migração de stack por iniciativa da refatoração.
67. **Objetivo de perda zero:** após definir cenário e infraestrutura, registrar conjunto de operações efetivamente confirmadas e provocar falha no componente coberto em ambiente de teste isolado. Recuperar e conferir presença/integridade de todas as operações confirmadas, sem duplicação de reenvios; medir tempo para confrontar RTO ainda a definir. Um ensaio em um cenário não comprova todos os desastres. Nenhum teste de falha real foi realizado nesta rodada.

## Cenários adicionais da rodada 0.13 — planejados, não executados

68. **Plano de recuperação sem prazo presumido:** comparação identifica serviços atuais e alternativas, cenários de falha, objetivo de perda, tempo estimado com evidência, custo e esforço. RTO só recebe valor após escolha explícita; não considerar o requisito cumprido pela existência de serviços separados.
69. **Inventário sem exposição:** documentar provedores/planos e recursos necessários sem incluir credenciais ou dados pessoais. Distinguir informação declarada, recurso verificado e teste realizado.
