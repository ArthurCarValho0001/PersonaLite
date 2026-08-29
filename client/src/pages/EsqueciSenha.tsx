import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { esqueciSenha, redefinirSenha } from '../api/authApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import './Registrar.css'

export function EsqueciSenha() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('')
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const senhasConferem = novaSenha.length > 0 && novaSenha === confirmarNovaSenha

  async function solicitarCodigo(evento: FormEvent) {
    evento.preventDefault()
    if (!email.trim()) return

    setEnviando(true)
    try {
      await esqueciSenha(email.trim())
      setEtapa('codigo')
    } finally {
      setEnviando(false)
    }
  }

  async function confirmarRedefinicao(evento: FormEvent) {
    evento.preventDefault()
    if (!codigo.trim() || !senhasConferem || novaSenha.length < 6) return

    setEnviando(true)
    setErro(null)
    try {
      await redefinirSenha({ email: email.trim(), codigo: codigo.trim(), novaSenha })
      navigate('/login')
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem ?? 'Código inválido ou expirado.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="registrar">
      <div className="registrar__conteudo">
        <h1 className="registrar__titulo">Redefinir senha</h1>

        <Card>
          {etapa === 'email' ? (
            <form onSubmit={solicitarCodigo}>
              <p className="registrar__subtitulo">
                Digite o e-mail verificado da sua conta. Se ele existir, enviaremos um código.
              </p>
              <FormField id="email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" disabled={!email.trim() || enviando}>
                {enviando ? 'Enviando...' : 'Enviar código'}
              </Button>
            </form>
          ) : (
            <form onSubmit={confirmarRedefinicao}>
              <p className="registrar__subtitulo">Confira seu e-mail e digite o código recebido.</p>
              <FormField id="codigo" label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="000000" />
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
                <p className="registrar__erro">As senhas não conferem.</p>
              )}
              {erro && <p className="registrar__erro">{erro}</p>}
              <Button type="submit" disabled={!codigo.trim() || !senhasConferem || novaSenha.length < 6 || enviando}>
                {enviando ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>
            </form>
          )}

          <p className="registrar__login-link">
            <Link to="/login">Voltar pro login</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
