import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { atualizarAvatar } from '../api/perfilApi'
import { limparToken } from '../api/authToken'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { useUsuario } from '../hooks/useUsuario'
import './Perfil.css'

export function Perfil() {
  const { usuario, recarregar } = useUsuario()
  const navigate = useNavigate()
  const inputArquivoRef = useRef<HTMLInputElement>(null)
  const [enviandoFoto, setEnviandoFoto] = useState(false)

  if (!usuario) return null

  async function lidarComTrocaFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    setEnviandoFoto(true)
    try {
      await atualizarAvatar(arquivo)
      recarregar()
    } finally {
      setEnviandoFoto(false)
      if (inputArquivoRef.current) inputArquivoRef.current.value = ''
    }
  }

  function sair() {
    if (!confirm('Sair da conta?')) return
    limparToken()
    window.location.href = '/'
  }

  return (
    <div className="perfil">
      <header className="perfil__topo">
        <Link to="/">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      <div className="perfil__cabecalho">
        <Avatar nome={usuario.nome} avatarUrl={usuario.avatarUrl} tamanho="grande" />
        <h1 className="perfil__nome">{usuario.nome}</h1>
        <span className="perfil__usuario">@{usuario.nomeUsuario}</span>

        <input
          ref={inputArquivoRef}
          type="file"
          accept="image/*"
          className="perfil__input-arquivo"
          onChange={lidarComTrocaFoto}
        />
        <button
          type="button"
          className="perfil__trocar-foto"
          onClick={() => inputArquivoRef.current?.click()}
          disabled={enviandoFoto}
        >
          {enviandoFoto ? 'Enviando...' : 'Trocar foto'}
        </button>
      </div>

      <nav className="perfil__menu">
        <button type="button" className="perfil__menu-item" onClick={() => navigate('/perfil/informacoes-pessoais')}>
          <span>Informações pessoais</span>
          <span className="perfil__menu-seta">›</span>
        </button>
        <button type="button" className="perfil__menu-item" onClick={() => navigate('/perfil/dados-privacidade')}>
          <span>Dados e privacidade</span>
          <span className="perfil__menu-seta">›</span>
        </button>
        <button type="button" className="perfil__menu-item perfil__menu-item--sair" onClick={sair}>
          <span>Sair da conta</span>
        </button>
      </nav>
    </div>
  )
}
