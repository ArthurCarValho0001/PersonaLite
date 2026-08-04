import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/authApi'
import { salvarToken } from '../api/authToken'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import './Registrar.css'

export function Login() {
  const navigate = useNavigate()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!nomeUsuario.trim() || !senha) return

    setEnviando(true)
    setErro(null)
    try {
      const resultado = await login({ nomeUsuario: nomeUsuario.trim(), senha })
      salvarToken(resultado.token)
      navigate('/')
      window.location.reload()
    } catch {
      setErro('Usuário ou senha inválidos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="registrar">
      <div className="registrar__conteudo">
        <h1 className="registrar__titulo">Entrar no PersonaLite</h1>

        <Card>
          <form onSubmit={lidarComEnvio}>
            <FormField
              id="nomeUsuario"
              label="Nome de usuário"
              type="text"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              autoCapitalize="off"
            />

            <FormField
              id="senha"
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            {erro && <p className="registrar__erro">{erro}</p>}

            <Button type="submit" disabled={!nomeUsuario.trim() || !senha || enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="registrar__login-link">
              Ainda não tem conta? <Link to="/registrar">Criar conta</Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}