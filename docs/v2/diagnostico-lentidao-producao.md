# Diagnóstico inicial de lentidão em produção

Coleta em 27/10/2026, aproximadamente 21h30–21h36 (America/Sao_Paulo). Consultas públicas de produção: site, bundle, service worker, saúde, resposta sem token e preflight CORS; também três tentativas de login com um único nome aleatório inexistente e senha fictícia. Nenhum login bem-sucedido, cadastro, escrita de dados de negócio ou alteração de hospedagem de produção. As alterações locais da Tarefa 01 foram preservadas. Este documento não representa uma correção publicada.

## Resultado executivo

Não foi reproduzida lentidão extrema no endpoint público de saúde durante a amostra. Há gargalos demonstráveis no código de treino e resumo: consultas sequenciais por exercício, leitura de históricos completos e recarregamento de todo o treino após alterações em uma série. O impacto exato em produção depende da latência API–PostgreSQL, volume de dados e recursos da instância, ainda não medidos.

Inicialização a frio no Render é uma hipótese para esperas após inatividade, não um diagnóstico confirmado. Não foi consultado o plano contratado nem logs privados. A rota de saúde não consulta banco e respostas 401/204 não medem os casos de uso autenticados. Portanto, os números abaixo não provam que as operações do usuário estão rápidas.

## Evidência pública

A URL da API foi extraída do bundle efetivamente publicado em `/assets/index-WdrJ6DnJ.js`: `https://personalite-api.onrender.com`.

| Requisição | HTTP | Tempo total |
| --- | --- | --- |
| HTML frontend, primeira amostra | 200 | 2,627 s (TLS: 2,601 s) |
| HTML frontend, três repetições | 200 | 0,083 / 0,105 / 0,092 s |
| Bundle público com gzip | 200 | 0,122 s; 221.003 bytes transferidos; X-Vercel-Cache HIT |
| GET /api/saude, primeira amostra | 200 | 1,326 s |
| GET /api/saude, cinco repetições | 200 | 0,221 / 0,177 / 0,190 / 0,400 / 0,197 s |
| GET /api/usuario sem token | 401 | 0,184 s |
| OPTIONS /api/usuario com Origin de produção | 204 | 0,188 s; origem e headers permitidos |
| POST /api/auth/login com nome aleatório inexistente, três tentativas | 401 | 2,396 / 0,592 / 0,299 s |

Mediana das cinco repetições de saúde: ~197 ms. Amostra curta, sequencial, de uma única máquina; não é p95, teste de carga ou medição do dispositivo do usuário. Cada curl abre uma conexão nova. O TLS explica quase toda a primeira amostra lenta do HTML; não atribuir esse valor ao processamento do Vercel. A primeira saúde de 1,326 s não permite atribuir causa a cold start.

O teste de login inexistente executa a consulta por nome no banco; não verifica PBKDF2 nem emite JWT. A primeira tentativa levou 2,396 s mesmo após as medições de saúde; isso demonstra demora adicional naquele percurso, mas não separa inicialização EF/JIT, abertura da conexão, pool e SQL. A queda nas repetições é compatível com aquecimento, sem provar qual camada foi aquecida.

## Cadastro e login: prioridade ajustada ao relato

O usuário informou espera após inatividade **e durante todo o uso**, sobretudo em cadastro/login. Por isso os gargalos de treino não devem ser apresentados como causa única do incidente.

- Login executa consulta por nome → PBKDF2 → JWT. Não envia e-mail e não carrega histórico de treino no próprio endpoint.
- Cadastro executa busca de nome disponível → PBKDF2 → consulta adicional `AnyAsync` pelo novo Id → INSERT → JWT. Não envia e-mail nesse fluxo.
- `UsuarioRepository.ObterPorNomeUsuarioAsync` usa igualdade com nome normalizado, mas não há índice de NomeUsuario nas migrations fornecidas. Confirmar índice e volume reais antes de atribuir a demora a isso.
- `PasswordHasher` usa PBKDF2-SHA256 com 100.000 iterações para novos hashes; a verificação usa o número gravado em cada hash. É custo de CPU intencional. Medir sua duração na instância, principalmente sob CPU restrita, sem reduzir a proteção como atalho.
- Tanto `Login.tsx` quanto `Registrar.tsx` fazem navigate + `window.location.reload()` após obter o token; a nova montagem espera GET /api/usuario e só então inicia requisições do Dashboard. O tempo percebido para entrar inclui esse percurso posterior, não só o POST de autenticação.

Prioridade imediata: decompor a duração de login/cadastro em conexão/pool, SQL, PBKDF2, emissão de JWT e chamadas pós-login. Rever plano/CPU/regiões, conferir índice de nome e eliminar reload completo/consulta redundante de usuário. A consulta extra antes de inserir um usuário novo pode ser removida numa correção pequena com testes; não explica sozinha uma espera de dezenas de segundos em banco saudável.

Comando-base de coleta:

```powershell
curl.exe -sS --max-time 20 -o NUL -w 'HTTP=%{http_code} DNS=%{time_namelookup} CONNECT=%{time_connect} TLS=%{time_appconnect} TTFB=%{time_starttransfer} TOTAL=%{time_total}\n' https://personalite-api.onrender.com/api/saude
```

O sandbox bloqueou DNS inicialmente; as medições válidas foram executadas com autorização fora do sandbox. Os downloads e headers de apoio ficaram em `.local`, ignorada pelo Git.

## Gargalos demonstráveis no código local

O backend publicado não expõe seu commit: os achados abaixo são confirmados no código fornecido (base 23ab62d), mas a correspondência exata com o deploy do backend deve ser verificada no Render.

### 1. Treino faz consultas sequenciais por exercício

- `src/PersonaLite.Application/UseCases/ObterTreinoDoDiaUseCase.cs:34`: foreach com await do mapeador.
- `src/PersonaLite.Application/UseCases/ObterTreinoPorDiaUseCase.cs:33`: mesmo padrão.
- `src/PersonaLite.Application/UseCases/MapeadorTreinoDoDia.cs:16`: uma busca do último histórico por exercício.
- `src/PersonaLite.Infrastructure/Repositories/SessaoExercicioRepository.cs:40`: consulta com séries, filtro por nome e joins até usuário.

No treino de hoje, aproximadamente duas consultas iniciais mais N consultas históricas, para N exercícios, assumindo o modo padrão de consulta única do EF. São round trips **API–banco**, não N requisições HTTP do navegador. Exemplo meramente ilustrativo: oito consultas sequenciais de 150 ms acrescentariam 1,2 s; esse valor não foi medido no banco de produção.

Solução: buscar os últimos históricos necessários em lote com filtro de proprietário, preservar a escolha do último treino por nome/data e mapear os DTOs em memória. Não substituir simplesmente por Task.WhenAll no mesmo DbContext: EF Core não permite operações concorrentes nessa instância.

### 2. Uma série provoca novo carregamento do treino inteiro

- `client/src/components/SerieRegistro.tsx:95`: chama onSerieRegistrada depois de salvar.
- `client/src/components/CardExercicio.tsx:83`: encaminha onAtualizar.
- `client/src/pages/Treinos.tsx:109`: onAtualizar é recarregar.
- `client/src/hooks/useTreinoSelecionavel.ts`: recarregar repete GET do treino.
- `client/src/pages/Treinos.tsx:81`: os cards só são exibidos quando !carregando; o recarregamento desmonta a lista durante a espera.

Além do POST e suas consultas, repete-se o custo descrito acima. Isso explica um mecanismo de espera e desaparecimento dos cards a cada interação, ainda sem cronometragem autenticada em produção.

Solução: atualizar somente o exercício afetado com o resultado confirmado pelo servidor; manter os cards visíveis durante revalidação. Se houver atualização otimista, prever reconciliação, falha e idempotência; não repetir automaticamente POSTs sem proteção contra duplicatas.

### 3. Resumo de progresso percorre históricos repetidamente

- `ObterResumoProgressoUseCase.cs:57–73`: consulta recorde anterior em loop por nome de exercício.
- `SessaoExercicioRepository.cs:121`: a busca de recorde faz duas consultas e materializa sessões/séries anteriores para calcular em memória.
- A contagem histórica também materializa sessões para depois aplicar Distinct/Count em memória (`ContarTreinosConcluidosTotalAsync`).

O loop pode encerrar cedo ao achar um recorde, portanto o custo varia por usuário/dados. No pior percurso cresce com o número de nomes de exercícios e volume histórico.

Solução: agregar no PostgreSQL e buscar os recordes em lote, preservando a semântica existente de drop sets e comparações. Usar projeções apenas dos campos necessários. Testes de equivalência são essenciais; não mudar a regra de recorde dentro de uma otimização.

### 4. Índices relevantes não aparecem nas migrations

O snapshot e as migrations fornecidas não declaram índices para `SessoesExercicio(ExercicioPlanejadoId, Data)`, `RegistrosMedidas(UsuarioId, Data)`, filtros de vigência de planos/trimestres ou nome de usuário. Há índices em algumas FKs e na tabela de séries, mas não nos filtros listados.

Isso não prova ausência no banco real: índices podem ter sido criados manualmente. Tampouco prova que uma varredura seja lenta com os volumes atuais.

Solução: inventariar índices reais e consultar planos de execução. Avaliar primeiro sessões por exercício/data e medidas por usuário/data; índices parciais e expressões para concluída/nomes normalizados apenas se os planos justificarem. Não criar índice UNIQUE sem auditar duplicatas: isso acrescentaria uma restrição de comportamento. Não rodar EXPLAIN ANALYZE de escritas em produção.

### 5. Latência adicional do frontend

- `App.tsx` bloqueia a montagem das telas em GET /api/usuario; só depois o Dashboard inicia suas requisições independentes (evolução, trimestre, resumo, sugestão e reavaliação).
- `Treinos.tsx` usa outra instância de useUsuario, repetindo consulta já feita no App.
- Axios não define timeout nem cancelamento efetivo no cliente atual.
- O preflight testado custou ~188 ms. Com Authorization, preflight CORS é esperado; Content-Type JSON global também é desnecessário em GET. Remover esse header não elimina preflight em chamadas autenticadas. Avaliar cache de preflight com política explícita.
- O service worker publicado só tem runtimeCaching da API para localhost:5000; essa regra não cobre onrender.com. Não copiar a regra diretamente para produção: cache de dados privados exige isolamento por conta e limpeza no logout.
- O bundle é monolítico, mas foi entregue comprimido com HIT em ~122 ms nesta amostra. Dividir rotas pode melhorar o primeiro carregamento em celular; não resolverá queries lentas do backend.

## Infraestrutura: hipóteses a confirmar

1. **Plano Free do Render e suspensão por inatividade.** A documentação informa suspensão após 15 minutos sem tráfego e retorno em cerca de um minuto. Se o serviço estiver nesse plano e a espera se concentrar na primeira chamada após pausa, corresponde ao sintoma. Confirmar plano e eventos de spin-up. Solução operacional: instância que não suspenda por inatividade. Isso não corrige a lentidão das consultas com o serviço aquecido.
2. **Regiões distantes entre API e banco.** Cada consulta sequencial amplifica a distância. Confirmar região de ambos e medir tempo de conexão/SQL a partir da API. Preferir proximidade API–banco, considerando também usuários no Brasil; a localização do frontend no CDN não aproxima o banco da API.
3. **Conexões e capacidade.** Conferir saturação de CPU/memória, conexões ativas/espera, pool, modo de conexão Supabase e reinícios. Não assumir que pooling está desativado em produção: a configuração `Pooling=false` da Tarefa 01 é apenas local. Não copiar aquela configuração para produção.
4. **Migrations no startup.** Elas atrasam a abertura da API se banco/conexão estiverem lentos. Medir no log de inicialização. Separar aplicação de migrations do startup é uma melhoria de operação a planejar; não aplicar essa mudança às pressas sem um processo de deploy substituto.

## Ordem recomendada

| Prioridade | Ação | Evidência de sucesso |
| --- | --- | --- |
| Imediata | Conferir plano, reinícios, CPU/memória e regiões Render/Supabase; capturar uma navegação lenta autenticada | Distinguir cold start, GET lento e POST lento com seus tempos |
| Alta | Eliminar consultas por exercício e recarregamento completo após série | Número de SQLs do GET não cresce linearmente com exercícios; interface mantém cards |
| Alta | Medir SQL do resumo e criar apenas índices justificados | Queda de duração SQL, linhas lidas e tráfego de histórico |
| Média | Compartilhar usuário já carregado, cancelar requisições obsoletas e definir tratamento de demora | Menos chamadas redundantes e espera com estado previsível |
| Posterior | Dividir bundle e revisar cache/PWA privado | Melhora do carregamento inicial sem vazamento de dados entre contas |

Para confirmar a causa dominante faltam tempos dos endpoints autenticados durante o problema, quantidade/duração de SQLs por request, região/plano e logs de início. Não é necessário compartilhar senha, token ou conexão real. Instrumentação deve registrar rota padronizada, status, duração, trace ID, contagem/duração SQL e tempo de conexão, sem corpo, token ou parâmetros pessoais.

Uma validação posterior deve comparar conta fictícia com 1/8/20 exercícios e histórico pequeno/grande, com API aquecida e após inatividade. Medir GET do treino, resumo, salvar série e tempo até a interface estabilizar; registrar mediana e p95 com amostra apropriada. Não foi executado teste de carga em produção.

## Referências

- Render: https://render.com/docs/free e https://render.com/docs/faq
- EF Core, consultas/índices/projeções: https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying
- EF Core, concorrência no DbContext: https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/
- Supabase, regiões: https://supabase.com/docs/guides/platform/regions
