-- Aggregate-only legacy audit. Run with a read-only role or against an isolated
-- restore. No row identifiers, emails, names, hashes or media paths are emitted.
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '15s';
SET LOCAL lock_timeout = '2s';

SELECT 'usuarios' AS metrica, count(*) AS total FROM "Usuarios"
UNION ALL SELECT 'medidas', count(*) FROM "RegistrosMedidas"
UNION ALL SELECT 'planos', count(*) FROM "PlanosTreino"
UNION ALL SELECT 'sessoes', count(*) FROM "SessoesExercicio"
UNION ALL SELECT 'fotos_legadas', count(*) FROM "FotosProgresso"
UNION ALL SELECT 'migrations_aplicadas', count(*) FROM "__EFMigrationsHistory";

SELECT 'nomes_usuario_normalizados_duplicados' AS metrica, count(*) AS grupos,
       coalesce(sum(total - 1), 0) AS registros_excedentes
FROM (SELECT count(*) AS total FROM "Usuarios"
      GROUP BY lower(btrim("NomeUsuario")) HAVING count(*) > 1) AS conflitos
UNION ALL
SELECT 'emails_normalizados_duplicados', count(*), coalesce(sum(total - 1), 0)
FROM (SELECT count(*) AS total FROM "Usuarios"
      WHERE "Email" IS NOT NULL AND btrim("Email") <> ''
      GROUP BY lower(btrim("Email")) HAVING count(*) > 1) AS conflitos
UNION ALL
SELECT 'medidas_mesma_conta_data', count(*), coalesce(sum(total - 1), 0)
FROM (SELECT count(*) AS total FROM "RegistrosMedidas"
      GROUP BY "UsuarioId", "Data" HAVING count(*) > 1) AS conflitos;

SELECT 'medidas_sem_usuario' AS metrica, count(*) AS total
FROM "RegistrosMedidas" m LEFT JOIN "Usuarios" u ON u."Id" = m."UsuarioId"
WHERE u."Id" IS NULL
UNION ALL SELECT 'planos_sem_usuario', count(*)
FROM "PlanosTreino" p LEFT JOIN "Usuarios" u ON u."Id" = p."UsuarioId"
WHERE u."Id" IS NULL
UNION ALL SELECT 'sessoes_sem_exercicio', count(*)
FROM "SessoesExercicio" s LEFT JOIN "ExerciciosPlanejados" e ON e."Id" = s."ExercicioPlanejadoId"
WHERE e."Id" IS NULL
UNION ALL SELECT 'fotos_sem_medida', count(*)
FROM "FotosProgresso" f LEFT JOIN "RegistrosMedidas" m ON m."Id" = f."RegistroMedidasId"
WHERE m."Id" IS NULL;

SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN
  ('Usuarios', 'RegistrosMedidas', 'PlanosTreino', 'SessoesExercicio', 'ExerciciosPlanejados')
ORDER BY tablename, indexname;

SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";
COMMIT;
