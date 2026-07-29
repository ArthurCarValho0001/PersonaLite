import { useState, type FormEvent } from 'react'
import { criarUsuario } from '../api/usuarioApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { SeletorSexo } from '../components/SeletorSexo'
import type { Sexo } from '../types'
import './Onboarding.css'

interface OnboardingProps {
  onConcluido: () => void
}

export function Onboarding({ onConcluido }: OnboardingProps) {
  const [nome, setNome] = useState('')
  const [sexo, setSexo] = useState<Sexo | null>(null)
  const [dataNascimento, setDataNascimento] = useState('')
  const [alturaCm, setAlturaCm] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const formularioValido = nome.trim().length > 0 && sexo !== null && dataNascimento !== '' && Number(alturaCm) > 0

  async function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!formularioValido || !sexo) return

    setEnviando(true)
    setErro(null)
    try {
      await criarUsuario({
        nome: nome.trim(),
        sexo,
        dataNascimento,
        alturaCm: Number(alturaCm),
      })
      onConcluido()
    } catch {
      setErro('Não foi possível salvar. Confira se a API está rodando em localhost:5000.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding__conteudo">
        <h1 className="onboarding__titulo">Bem-vindo ao PersonaLite</h1>
        <p className="onboarding__subtitulo">
          Antes de começar, preciso de algumas informações básicas — elas são usadas nos cálculos
          de composição corporal a cada nova medição.
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

            {erro && <p className="onboarding__erro">{erro}</p>}

            <Button type="submit" disabled={!formularioValido || enviando}>
              {enviando ? 'Salvando...' : 'Começar'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
