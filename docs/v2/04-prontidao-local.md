# Prontidão V2 local — pendências explícitas

Atualização: 29/10/2026. Execução local integrada, não liberação de produção.

## Antes de considerar o aceite integral

- Ampliar o ensaio já executado de atualização real com duas abas e rascunho para avaliação e fila pendente nos dispositivos-alvo; o harness de medição desativa registro PWA e não é evidência desse cenário. O código novo usa NetworkOnly para API, não força ativação/reload e conserva IndexedDB. A ativação nativa ocorre após todas as abas controladas fecharem.
- Completar matriz de erros/expiração/offline em dispositivos Android/iOS reais e acessibilidade com leitor de tela/teclado. A captura estreita no navegador desktop não substitui dispositivos reais.
- Completar testes de falha induzida entre gravações, cinco reenvios após reinício e concorrência entre versões antigas/novas de clientes. As escritas V2 já usam transação e advisory locks no banco; não foi provado comportamento com todas as versões legadas simultâneas.
- Avatar agora decodifica PNG/JPEG com biblioteca fixada após checar tamanho/dimensões. Arquivos malformados testados foram rejeitados; ampliar corpus de mídia e revisar armazenamento/retenção antes de produção. Não foi implementado re-encode nem migração de imagens legadas.
- Regularizar duplicidades legadas de identidade/medidas mediante auditoria autorizada. Nada foi apagado/fundido; locks impedem corrida entre comandos V2, mas ainda falta estratégia de índices únicos compatível com dados reais e clientes antigos.
- Conferir importação de várias versões/opcionalidade e retirada concorrente com envio sob falha, além do caso local já executado de retirada preservando histórico.
- Auditar exportação de grandes históricos e ampliar fixtures de todos os campos/unidades. ZIP privado, isolamento, fórmula textual e completude das 14 circunferências/sete dobras foram verificados; completude de cada caso documental ainda exige rastreabilidade detalhada.
- Revisar toda a matriz RF01–RF23, telas/estados e diagramas contra o diff antes de encerrar a V2. Não há evidência suficiente para marcar todos os critérios automaticamente.

## Externo ao ambiente autorizado

Conteúdo real e responsável editorial; regularização de dados reais; dispositivos reais; plano/região/conexões da hospedagem; armazenamento persistente e privacidade de mídia legada; índices/telemetria em dados reais; RTO e ensaio de rollback operacional. Nenhuma alteração, inspeção de banco, carga ou publicação em produção foi feita.

## Revisão e entrega

A branch local reúne os lotes para execução integrada a pedido do responsável. Antes de PRs/publicação, separar mudanças em lotes revisáveis conforme o documento técnico, com migrations, risco, comandos e evidências próprios. O merge local solicitado em 29/10 não representa aceite integral nem liberação de produção; não houve push ou deploy.

## Rodada de QA de 29/10/2026

Ambiente: worktree `codex/v2-local-completa`, API `localhost:5000`, frontend `localhost:5173`, PostgreSQL `personalite_v2_local` em `127.0.0.1:55432`, role `personalite_local`. A conexão foi consultada diretamente com `psql`; e-mail local é simulado. Foram usados somente dados fictícios. Um primeiro `dotnet build` falhou porque a API local mantinha o executável aberto; a instância deste worktree foi encerrada e o build repetido com êxito, zero avisos e zero erros.

| Verificação | Resultado real |
| --- | --- |
| `dotnet build PersonaLite.sln --no-restore` | Aprovado após encerrar API local: zero avisos/erros |
| `dotnet test PersonaLite.sln --no-build --no-restore` | 17/17 aprovados |
| `node ../package/bin/npm-cli.js test --prefix client` | 19/19 aprovados |
| `node ../package/bin/npm-cli.js run build --prefix client` | Aprovado; aviso de bundle de 809,10 kB |
| `node scripts/validate-v2.mjs` | 25/25 verificações locais aprovadas, incluindo reenvios concorrentes, isolamento entre contas, treino, medidas, aprendizado, avatar, exportação e revogação de sessão |
| `./scripts/validate-export-local.ps1` | Dez CSVs por tipo, 14 circunferências, sete dobras, isolamento, exclusão de credenciais/avatar e fórmula protegida |
| Navegador local | Cadastro de conta fictícia, painel, Treinos, catálogo Aprender, logout, retorno ao login e novo login observados |

Na sessão local, o reinício da API invalidou o token anterior e a rota protegida redirecionou ao login, conforme a chave JWT descartável por execução. Não houve teste em dispositivos reais, banco de produção, envio real de e-mail, carga de produção ou comprovação de todos os cenários RF01–RF23. As pendências acima continuam abertas; não declarar a V2 integralmente aceita para produção.

Sugestão de mensagem para um primeiro checkpoint local, após revisão: `feat: integra V2 local com aprendizagem, histórico e sincronização isolada`.
