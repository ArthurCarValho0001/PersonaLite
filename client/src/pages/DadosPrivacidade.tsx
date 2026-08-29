import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  alterarEmail,
  alterarNomeUsuario,
  confirmarVerificacaoEmail,
  solicitarVerificacaoEmail,
} from '../api/perfilApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { useUsuario } from '../hooks/useUsuario'
import './DadosPrivacidade.css'

export function DadosPrivacidade() {
  const { usuario, recarregar } = useUsuario()

  if (!usuario) return null

  return (
    <div className="dados-priv">
      <header className="dados-priv__cabecalho">
        <h1 className="dados-priv__titulo">Dados e privacidade</h1>
        <Link to="/perfil">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      <SecaoEmail emailAtual={usuario.email} verificado={usuario.emailVerificado} onSalvo={recarregar} />
      <SecaoNomeUsuario nomeUsuarioAtual={usuario.nomeUsuario} onSalvo={recarregar} />
      <SecaoRedefinirSenha />
    </div>
  )
}

function SecaoEmail({
  emailAtual,
  verificado,
  onSalvo,
}: {
  emailAtual: string | null
  verificado: boolean
  onSalvo: () => void
}) {
  const [aberto, setAberto] = useState(false)
  const [email, setEmail] = useState(emailAtual ?? '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [enviandoCodigo, setEnviandoCodigo] = useState(false)
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  async function salvarEmail(evento: FormEvent) {
    evento.preventDefault()
    if (!email.trim() || !senhaAtual) return

    setSalvando(true)
    setErro(null)
    try {
      await alterarEmail({ novoEmail: email.trim(), senhaAtual })
      setSenhaAtual('')
      setAberto(false)
      onSalvo()
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem ?? 'Não foi possível alterar o e-mail.')
    } finally {
      setSalvando(false)
    }
  }

  async function pedirCodigo() {
    setEnviandoCodigo(true)
    try {
      await solicitarVerificacaoEmail()
      setCodigoEnviado(true)
    } finally {
      setEnviandoCodigo(false)
    }
  }

  async function confirmarCodigo() {
    if (!codigo.trim()) return
    setConfirmando(true)
    setErro(null)
    try {
      await confirmarVerificacaoEmail({ codigo: codigo.trim() })
      setCodigo('')
      setCodigoEnviado(false)
      onSalvo()
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem ?? 'Código inválido.')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <Card>
      <div className="dados-priv__item-cabecalho" onClick={() => setAberto((v) => !v)}>
        <div>
          <span className="dados-priv__item-label">E-mail</span>
          <span className="dados-priv__item-valor">
            {emailAtual ?? 'não cadastrado'}
            {emailAtual && (
              <span className={`dados-priv__badge ${verificado ? 'dados-priv__badge--ok' : 'dados-priv__badge--pendente'}`}>
                {verificado ? '✓ verificado' : 'não verificado'}
              </span>
            )}
          </span>
        </div>
        <span className="dados-priv__seta">{aberto ? '▲' : '▼'}</span>
      </div>

      {aberto && (
        <div className="dados-priv__corpo">
          {emailAtual && !verificado && !codigoEnviado && (
            <button type="button" className="dados-priv__link" onClick={pedirCodigo} disabled={enviandoCodigo}>
              {enviandoCodigo ? 'Enviando...' : 'Enviar código de verificação'}
            </button>
          )}

          {codigoEnviado && (
            <div className="dados-priv__verificacao">
              <p className="dados-priv__texto">Enviamos um código para {emailAtual}. Confira sua caixa de entrada (e o spam).</p>
              <FormField id="codigoEmail" label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="000000" />
              <Button type="button" onClick={confirmarCodigo} disabled={confirmando}>
                {confirmando ? 'Confirmando...' : 'Confirmar código'}
              </Button>
            </div>
          )}

          <form onSubmit={salvarEmail} className="dados-priv__form">
            <p className="dados-priv__texto">Alterar e-mail:</p>
            <FormField id="novoEmail" label="Novo e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FormField
              id="senhaEmail"
              label="Senha atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
            {erro && <p className="dados-priv__erro">{erro}</p>}
            <Button type="submit" disabled={!email.trim() || !senhaAtual || salvando}>
              {salvando ? 'Salvando...' : 'Alterar e-mail'}
            </Button>
          </form>
        </div>
      )}
    </Card>
  )
}

function SecaoNomeUsuario({ nomeUsuarioAtual, onSalvo }: { nomeUsuarioAtual: string; onSalvo: () => void }) {
  const [aberto, setAberto] = useState(false)
  const [novoNomeUsuario, setNovoNomeUsuario] = useState(nomeUsuarioAtual)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!novoNomeUsuario.trim() || !senhaAtual) return

    setSalvando(true)
    setErro(null)
    try {
      await alterarNomeUsuario({ novoNomeUsuario: novoNomeUsuario.trim(), senhaAtual })
      setSenhaAtual('')
      setAberto(false)
      onSalvo()
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem ?? 'Não foi possível alterar o nome de usuário.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <div className="dados-priv__item-cabecalho" onClick={() => setAberto((v) => !v)}>
        <div>
          <span className="dados-priv__item-label">Nome de usuário</span>
          <span className="dados-priv__item-valor">@{nomeUsuarioAtual}</span>
        </div>
        <span className="dados-priv__seta">{aberto ? '▲' : '▼'}</span>
      </div>

      {aberto && (
        <form onSubmit={salvar} className="dados-priv__form">
          <FormField
            id="novoNomeUsuario"
            label="Novo nome de usuário"
            value={novoNomeUsuario}
            onChange={(e) => setNovoNomeUsuario(e.target.value)}
            autoCapitalize="off"
          />
          <FormField
            id="senhaUsuario"
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          {erro && <p className="dados-priv__erro">{erro}</p>}
          <Button type="submit" disabled={!novoNomeUsuario.trim() || !senhaAtual || salvando}>
            {salvando ? 'Salvando...' : 'Alterar nome de usuário'}
          </Button>
        </form>
      )}
    </Card>
  )
}

function SecaoRedefinirSenha() {
  return (
    <Card>
      <Link to="/esqueci-senha" className="dados-priv__item-cabecalho dados-priv__item-cabecalho--link">
        <span className="dados-priv__item-label">Senha</span>
        <span className="dados-priv__seta">›</span>
      </Link>
    </Card>
  )
}
