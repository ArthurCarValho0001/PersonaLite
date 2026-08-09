import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrar } from '../api/authApi'
import { salvarToken } from '../api/authToken'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { SeletorSexo } from '../components/SeletorSexo'
import type { Sexo } from '../types'
import './Registrar.css'
import { Eye, EyeOff } from 'lucide-react';

export function Registrar() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)
  const [sexo, setSexo] = useState<Sexo | null>(null)
  const [dataNascimento, setDataNascimento] = useState('')
  const [alturaCm, setAlturaCm] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const senhasConferem = senha.length > 0 && senha === confirmarSenha

  const formularioValido =
    nome.trim().length > 0 &&
    nomeUsuario.trim().length >= 3 &&
    senha.length >= 6 &&
    senhasConferem &&
    sexo !== null &&
    dataNascimento !== '' &&
    Number(alturaCm) > 0

  async function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!formularioValido || !sexo) return

    setEnviando(true)
    setErro(null)
    try {
      const resultado = await registrar({
        nome: nome.trim(),
        nomeUsuario: nomeUsuario.trim(),
        senha,
        sexo,
        dataNascimento,
        alturaCm: Number(alturaCm),
        email: email.trim() || null,
      })
      salvarToken(resultado.token)
      navigate('/')
      window.location.reload()
    } catch (erro: any) {
      if (erro?.response?.status === 409) {
        setErro('Esse nome de usuário já está em uso.')
      } else {
        setErro('Não foi possível criar a conta. Confira se a API está rodando.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="registrar">
      <div className="registrar__conteudo">
        <h1 className="registrar__titulo">Criar conta no PersonaLite</h1>
        <p className="registrar__subtitulo">
          Suas medidas e treinos ficam vinculados só à sua conta.
        </p>

        <Card>
          <form onSubmit={lidarComEnvio}>
            <FormField
              id="nome"
              label="Nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como devo te chamar?"
            />

            <FormField
              id="nomeUsuario"
              label="Nome de usuário"
              type="text"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="mínimo 3 caracteres"
              autoCapitalize="off"
            />

            <FormField
              id="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoCapitalize="off"
            />

            <FormField
              id="senha"
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="mínimo 6 caracteres"
            />

            <div className="registrar__campo-com-olho">
              <FormField
                id="confirmarSenha"
                label="Confirmar senha"
                type={mostrarConfirmacao ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="repita a senha"
              />
              <button
                type="button"
                className="registrar__olho"
                onClick={() => setMostrarConfirmacao((v) => !v)}
                aria-label={mostrarConfirmacao ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarConfirmacao ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmarSenha.length > 0 && !senhasConferem && (
              <p className="registrar__erro">As senhas não conferem.</p>
            )}

            <SeletorSexo valor={sexo} onChange={setSexo} />

            <FormField
              id="dataNascimento"
              label="Data de nascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />

            <FormField
              id="alturaCm"
              label="Altura"
              unidade="cm"
              type="number"
              step="0.1"
              min="0"
              value={alturaCm}
              onChange={(e) => setAlturaCm(e.target.value)}
              placeholder="175"
            />

            {erro && <p className="registrar__erro">{erro}</p>}

            <Button type="submit" disabled={!formularioValido || enviando}>
              {enviando ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <p className="registrar__login-link">
              Já tem conta? <Link to="/login">Entrar</Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}