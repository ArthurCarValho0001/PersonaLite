import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  alterarEmail,
  alterarNomeUsuario,
  alterarSenha,
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
      <SecaoSenha />
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

function SecaoSenha() {
  const [aberto, setAberto] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmarNovaSenha

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!senhaAtual || !senhasConferem || novaSenha.length < 6) return

    setSalvando(true)
    setErro(null)
    try {
      await alterarSenha({ senhaAtual, novaSenha })
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarNovaSenha('')
      setSucesso(true)
      setTimeout(() => setSucesso(false), 2500)
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem ?? 'Não foi possível alterar a senha.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <div className="dados-priv__item-cabecalho" onClick={() => setAberto((v) => !v)}>
        <span className="dados-priv__item-label">Senha</span>
        <span className="dados-priv__seta">{aberto ? '▲' : '▼'}</span>
      </div>

      {aberto && (
        <form onSubmit={salvar} className="dados-priv__form">
          <FormField
            id="senhaAtualSenha"
            label="Senha atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
          <FormField
            id="novaSenha"
            label="Nova senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="mínimo 6 caracteres"
          />
          <div className="registrar__campo-com-olho">
            <FormField
              id="confirmarNovaSenha"
              label="Confirmar nova senha"
              type={mostrarConfirmacao ? 'text' : 'password'}
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            />
            <button
              type="button"
              className="registrar__olho"
              onClick={() => setMostrarConfirmacao((v) => !v)}
              aria-label={mostrarConfirmacao ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {mostrarConfirmacao ? '🙈' : '👁'}
            </button>
          </div>
          {confirmarNovaSenha.length > 0 && !senhasConferem && (
            <p className="dados-priv__erro">As senhas não conferem.</p>
          )}
          {erro && <p className="dados-priv__erro">{erro}</p>}
          {sucesso && <p className="dados-priv__sucesso">✓ Senha alterada com sucesso.</p>}
          <Button type="submit" disabled={!senhaAtual || !senhasConferem || novaSenha.length < 6 || salvando}>
            {salvando ? 'Salvando...' : 'Alterar senha'}
          </Button>
        </form>
      )}
    </Card>
  )
}
