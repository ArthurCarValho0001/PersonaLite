import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { adicionarDiaDeTreino, adicionarExercicio, criarPlanoTreino } from '../api/treinoApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { usePlanoAtual } from '../hooks/usePlanoAtual'
import { DIAS_SEMANA, LABEL_DIA_SEMANA, type DiaSemana } from '../types'
import './ConfigurarTreino.css'

export function ConfigurarTreino() {
  const { plano, carregando, recarregar } = usePlanoAtual()
  const [criando, setCriando] = useState(false)

  async function lidarComCriarPlano() {
    setCriando(true)
    try {
      await criarPlanoTreino({ inicioVigencia: new Date().toISOString().slice(0, 10) })
      recarregar()
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="config-treino">
      <header className="config-treino__cabecalho">
        <h1 className="config-treino__titulo">Configurar treinos</h1>
        <Link to="/treinos">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      {carregando && <p className="config-treino__mensagem">Carregando...</p>}

      {!carregando && !plano && (
        <Card>
          <p>Você ainda não tem um plano de treino. Crie um pra começar a montar sua semana.</p>
          <div className="config-treino__acao-inicial">
            <Button onClick={lidarComCriarPlano} disabled={criando}>
              {criando ? 'Criando...' : 'Criar plano de treino'}
            </Button>
          </div>
        </Card>
      )}

      {!carregando && plano && (
        <>
          <div className="config-treino__lista">
            {plano.dias.map((dia) => (
              <DiaCard key={dia.id} diaId={dia.id} nome={dia.nome} diaSemana={dia.diaSemana}
                exercicios={dia.exercicios} onAtualizar={recarregar} />
            ))}
          </div>

          <NovoDiaForm planoTreinoId={plano.id} diasJaUsados={plano.dias.map((d) => d.diaSemana)} onAdicionado={recarregar} />
        </>
      )}
    </div>
  )
}

interface DiaCardProps {
  diaId: string
  nome: string
  diaSemana: DiaSemana
  exercicios: { id: string; nome: string; grupoMuscular: string; seriesAlvo: number; repeticoesAlvo: number }[]
  onAtualizar: () => void
}

function DiaCard({ diaId, nome, diaSemana, exercicios, onAtualizar }: DiaCardProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nomeExercicio, setNomeExercicio] = useState('')
  const [grupoMuscular, setGrupoMuscular] = useState('')
  const [seriesAlvo, setSeriesAlvo] = useState('4')
  const [repeticoesAlvo, setRepeticoesAlvo] = useState('10')
  const [salvando, setSalvando] = useState(false)

  async function lidarComAdicionar(evento: FormEvent) {
    evento.preventDefault()
    if (!nomeExercicio.trim() || !grupoMuscular.trim()) return

    setSalvando(true)
    try {
      await adicionarExercicio(diaId, {
        nome: nomeExercicio.trim(),
        grupoMuscular: grupoMuscular.trim(),
        seriesAlvo: Number(seriesAlvo),
        repeticoesAlvo: Number(repeticoesAlvo),
      })
      setNomeExercicio('')
      setGrupoMuscular('')
      setMostrarForm(false)
      onAtualizar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <div className="config-treino__dia-cabecalho">
        <div>
          <h3 className="config-treino__dia-nome">{nome}</h3>
          <span className="config-treino__dia-semana">{LABEL_DIA_SEMANA[diaSemana]}</span>
        </div>
      </div>

      {exercicios.length > 0 && (
        <ul className="config-treino__exercicios">
          {exercicios.map((ex) => (
            <li key={ex.id}>
              <span>{ex.nome}</span>
              <span className="config-treino__exercicio-meta">
                {ex.seriesAlvo}×{ex.repeticoesAlvo}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!mostrarForm && (
        <button type="button" className="config-treino__link" onClick={() => setMostrarForm(true)}>
          + adicionar exercício
        </button>
      )}

      {mostrarForm && (
        <form onSubmit={lidarComAdicionar} className="config-treino__form-exercicio">
          <FormField
            id={`nome-${diaId}`}
            label="Exercício"
            value={nomeExercicio}
            onChange={(e) => setNomeExercicio(e.target.value)}
            placeholder="Supino reto"
          />
          <FormField
            id={`grupo-${diaId}`}
            label="Grupo muscular"
            value={grupoMuscular}
            onChange={(e) => setGrupoMuscular(e.target.value)}
            placeholder="Peito"
          />
          <div className="config-treino__grade-numeros">
            <FormField
              id={`series-${diaId}`}
              label="Séries"
              type="number"
              min="1"
              value={seriesAlvo}
              onChange={(e) => setSeriesAlvo(e.target.value)}
            />
            <FormField
              id={`reps-${diaId}`}
              label="Repetições"
              type="number"
              min="1"
              value={repeticoesAlvo}
              onChange={(e) => setRepeticoesAlvo(e.target.value)}
            />
          </div>
          <div className="config-treino__acoes-form">
            <Button type="button" variante="secundario" onClick={() => setMostrarForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}

interface NovoDiaFormProps {
  planoTreinoId: string
  diasJaUsados: DiaSemana[]
  onAdicionado: () => void
}

function NovoDiaForm({ planoTreinoId, diasJaUsados, onAdicionado }: NovoDiaFormProps) {
  const [mostrar, setMostrar] = useState(false)
  const [nome, setNome] = useState('')
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('Monday')
  const [salvando, setSalvando] = useState(false)

  async function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!nome.trim()) return

    setSalvando(true)
    try {
      await adicionarDiaDeTreino(planoTreinoId, { nome: nome.trim(), diaSemana })
      setNome('')
      setMostrar(false)
      onAdicionado()
    } finally {
      setSalvando(false)
    }
  }

  if (!mostrar) {
    return (
      <Button variante="secundario" onClick={() => setMostrar(true)}>
        + Adicionar dia de treino
      </Button>
    )
  }

  return (
    <Card titulo="Novo dia de treino">
      <form onSubmit={lidarComEnvio}>
        <FormField
          id="nomeDia"
          label="Nome (ex: Peito, Costas, Perna)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Peito"
        />

        <label className="config-treino__label-select" htmlFor="diaSemanaSelect">
          Dia da semana
        </label>
        <select
          id="diaSemanaSelect"
          className="config-treino__select"
          value={diaSemana}
          onChange={(e) => setDiaSemana(e.target.value as DiaSemana)}
        >
          {DIAS_SEMANA.map((dia) => (
            <option key={dia} value={dia}>
              {LABEL_DIA_SEMANA[dia]}
              {diasJaUsados.includes(dia) ? ' (já tem treino)' : ''}
            </option>
          ))}
        </select>

        <div className="config-treino__acoes-form">
          <Button type="button" variante="secundario" onClick={() => setMostrar(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!nome.trim() || salvando}>
            {salvando ? 'Salvando...' : 'Adicionar dia'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
