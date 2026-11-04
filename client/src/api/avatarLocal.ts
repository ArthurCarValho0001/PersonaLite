// Cópia local da foto de perfil, por conta, neste aparelho.
// Enquanto a API não serve o arquivo (/api/usuario/avatar/arquivo), é isto que o app exibe.
import { titularAtual } from './identidade'

const EVENTO = 'personalite:avatar'
const chave = () => `personalite_avatar:${titularAtual() ?? 'visitante'}`
const LIMITE_BYTES = 5 * 1024 * 1024

export function obterAvatarLocal(): string | null {
  try { return localStorage.getItem(chave()) } catch { return null }
}

export function observarAvatarLocal(ouvinte: () => void) {
  window.addEventListener(EVENTO, ouvinte)
  return () => window.removeEventListener(EVENTO, ouvinte)
}

function lerComoDataUrl(arquivo: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    leitor.readAsDataURL(arquivo)
  })
}

// Reduz para 256 px (JPEG) quando o navegador permite; senão usa o arquivo como está.
async function reduzir(arquivo: File): Promise<string> {
  if (typeof createImageBitmap === 'function' && typeof document !== 'undefined') {
    try {
      const imagem = await createImageBitmap(arquivo)
      const lado = Math.min(imagem.width, imagem.height)
      const tela = document.createElement('canvas')
      tela.width = tela.height = 256
      const ctx = tela.getContext('2d')
      if (ctx) {
        ctx.drawImage(imagem, (imagem.width - lado) / 2, (imagem.height - lado) / 2, lado, lado, 0, 0, 256, 256)
        imagem.close?.()
        return tela.toDataURL('image/jpeg', 0.85)
      }
    } catch { /* usa o arquivo original */ }
  }
  return lerComoDataUrl(arquivo)
}

export async function salvarAvatarLocal(arquivo: File): Promise<void> {
  if (!arquivo.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.')
  if (arquivo.size > LIMITE_BYTES) throw new Error('A imagem deve ter até 5 MB.')
  const dataUrl = await reduzir(arquivo)
  try { localStorage.setItem(chave(), dataUrl) } catch { throw new Error('Não foi possível guardar a foto neste aparelho.') }
  window.dispatchEvent(new Event(EVENTO))
}
