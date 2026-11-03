// Chaves de recursos que dependem da API publicada.
// Enquanto a API v2 (rotas /api/aprender e /api/usuario/avatar/arquivo) não estiver no ar,
// o app não chama essas rotas, evitando 404 no console e na rede.
//
// Para ligar de novo, defina no build do Vercel:
//   VITE_APRENDER_API=true       -> Aprender passa a usar a API real
//   VITE_AVATAR_ARQUIVO=true     -> Avatar passa a buscar o arquivo na API
const env = (import.meta.env ?? {}) as Record<string, string | undefined>

export const aprenderUsaApi = () =>
  (globalThis as { __APRENDER_API__?: boolean }).__APRENDER_API__ === true || env.VITE_APRENDER_API === 'true'

export const avatarBuscaArquivo = () => env.VITE_AVATAR_ARQUIVO === 'true'
