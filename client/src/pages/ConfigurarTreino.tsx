import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  adicionarDiaDeTreino,
  adicionarExercicio,
  atualizarDiaDeTreino,
  atualizarExercicio,
  criarPlanoTreino,
  removerExercicio,
  reordenarExercicios,
} from '../api/treinoApi'
import { atualizarTempoDescanso } from '../api/usuarioApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { usePlanoAtual } from '../hooks/usePlanoAtual'
import { useUsuario } from '../hooks/useUsuario'
import {
  DIAS_SEMANA,
  LABEL_DIA_SEMANA,
  type DiaSemana,
  type ExercicioPlanejadoDto,
} from '../types'
import './ConfigurarTreino.css'

export function ConfigurarTreino() {
  const { plano, carregando, recarregar } = usePlanoAtual()
  const { usuario, recarregar: recarregarUsuario } = useUsuario()
  const [criando, setCriando] = useState(false)

  async function lidarComCriarPlano() {
    setCriando(true)
    try {
      await criarPlanoTreino({
        inicioVigencia: new Date().toISOString().slice(0, 10),
      })
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

      {usuario && (
        <ConfiguracaoDescanso
          segundosAtuais={usuario.tempoDescansoSegundos}
          onSalvo={recarregarUsuario}
        />
      )}

      {carregando && (
        <p className="config-treino__mensagem">
          Carregando...
        </p>
      )}

      {!carregando && !plano && (
        <Card>
          <p>
            Você ainda não tem um plano de treino. Crie um pra começar a
            montar sua semana.
          </p>

          <div className="config-treino__acao-inicial">
            <Button
              onClick={lidarComCriarPlano}
              disabled={criando}
            >
              {criando ? 'Criando...' : 'Criar plano de treino'}
            </Button>
          </div>
        </Card>
      )}

      {!carregando && plano && (
        <>
          <div className="config-treino__lista">
            {plano.dias.map((dia) => (
              <DiaCard
                key={dia.id}
                diaId={dia.id}
                nome={dia.nome}
                diaSemana={dia.diaSemana}
                exercicios={dia.exercicios}
                onAtualizar={recarregar}
              />
            ))}
          </div>

          <NovoDiaForm
            planoTreinoId={plano.id}
            diasJaUsados={plano.dias.map((d) => d.diaSemana)}
            onAdicionado={recarregar}
          />
        </>
      )}
    </div>
  )
}

interface DiaCardProps {
  diaId: string
  nome: string
  diaSemana: DiaSemana
  exercicios: ExercicioPlanejadoDto[]
  onAtualizar: () => void
}

function DiaCard({
  diaId,
  nome,
  diaSemana,
  exercicios,
  onAtualizar,
}: DiaCardProps) {
  const [editandoDia, setEditandoDia] = useState(false)
  const [nomeDia, setNomeDia] = useState(nome)
  const [diaSemanaEdicao, setDiaSemanaEdicao] =
    useState<DiaSemana>(diaSemana)
  const [salvandoDia, setSalvandoDia] = useState(false)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [exercicioEditandoId, setExercicioEditandoId] =
    useState<string | null>(null)

  async function salvarDia() {
    if (!nomeDia.trim()) return

    setSalvandoDia(true)

    try {
      await atualizarDiaDeTreino(diaId, {
        nome: nomeDia.trim(),
        diaSemana: diaSemanaEdicao,
      })

      setEditandoDia(false)
      onAtualizar()
    } finally {
      setSalvandoDia(false)
    }
  }

  async function mover(
    exercicioId: string,
    direcao: -1 | 1,
  ) {
    const ordenados = [...exercicios].sort(
      (a, b) => a.ordem - b.ordem,
    )

    const indice = ordenados.findIndex(
      (e) => e.id === exercicioId,
    )

    const novoIndice = indice + direcao

    if (
      novoIndice < 0 ||
      novoIndice >= ordenados.length
    ) {
      return
    }

    const copia = [...ordenados]
    ;[copia[indice], copia[novoIndice]] = [
      copia[novoIndice],
      copia[indice],
    ]

    await reordenarExercicios(diaId, {
      ordemExercicios: copia.map((e) => e.id),
    })

    onAtualizar()
  }

  async function excluirExercicio(
    exercicioId: string,
  ) {
    if (!confirm('Remover esse exercício do treino?')) {
      return
    }

    await removerExercicio(exercicioId)
    onAtualizar()
  }

  const exerciciosOrdenados = [...exercicios].sort(
    (a, b) => a.ordem - b.ordem,
  )

  return (
    <Card>
      {!editandoDia ? (
        <div className="config-treino__dia-cabecalho">
          <div>
            <h3 className="config-treino__dia-nome">
              {nome}
            </h3>

            <span className="config-treino__dia-semana">
              {LABEL_DIA_SEMANA[diaSemana]}
            </span>
          </div>

          <button
            type="button"
            className="config-treino__icone-botao"
            onClick={() => setEditandoDia(true)}
          >
            ✎
          </button>
        </div>
      ) : (
        <div className="config-treino__dia-edicao">
          <FormField
            id={`nome-dia-${diaId}`}
            label="Nome"
            value={nomeDia}
            onChange={(e) =>
              setNomeDia(e.target.value)
            }
          />

          <label
            className="config-treino__label-select"
            htmlFor={`dia-semana-${diaId}`}
          >
            Dia da semana
          </label>

          <select
            id={`dia-semana-${diaId}`}
            className="config-treino__select"
            value={diaSemanaEdicao}
            onChange={(e) =>
              setDiaSemanaEdicao(
                e.target.value as DiaSemana,
              )
            }
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>
                {LABEL_DIA_SEMANA[d]}
              </option>
            ))}
          </select>

          <div className="config-treino__acoes-form">
            <Button
              type="button"
              variante="secundario"
              onClick={() => setEditandoDia(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={salvarDia}
              disabled={
                !nomeDia.trim() || salvandoDia
              }
            >
              {salvandoDia
                ? 'Salvando...'
                : 'Salvar'}
            </Button>
          </div>
        </div>
      )}

      {exerciciosOrdenados.length > 0 && (
        <ul className="config-treino__exercicios">
          {exerciciosOrdenados.map(
            (ex, indice) =>
              exercicioEditandoId === ex.id ? (
                <li
                  key={ex.id}
                  className="config-treino__exercicio-edicao-item"
                >
                  <ExercicioEditForm
                    exercicio={ex}
                    onCancelar={() =>
                      setExercicioEditandoId(null)
                    }
                    onSalvo={() => {
                      setExercicioEditandoId(null)
                      onAtualizar()
                    }}
                  />
                </li>
              ) : (
                <li key={ex.id}>
                  <span className="config-treino__exercicio-nome">
                    {ex.nome}
                  </span>

                  <span className="config-treino__exercicio-meta">
                    {ex.seriesAlvo}×
                    {ex.repeticoesAlvo}
                  </span>

                  <div className="config-treino__exercicio-acoes">
                    <button
                      type="button"
                      className="config-treino__seta-botao"
                      onClick={() =>
                        mover(ex.id, -1)
                      }
                      disabled={indice === 0}
                      aria-label="Mover pra cima"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="config-treino__seta-botao"
                      onClick={() =>
                        mover(ex.id, 1)
                      }
                      disabled={
                        indice ===
                        exerciciosOrdenados.length - 1
                      }
                      aria-label="Mover pra baixo"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="config-treino__icone-botao"
                      onClick={() =>
                        setExercicioEditandoId(ex.id)
                      }
                      aria-label="Editar exercício"
                    >
                      ✎
                    </button>

                    <button
                      type="button"
                      className="config-treino__icone-botao config-treino__icone-botao--excluir"
                      onClick={() =>
                        excluirExercicio(ex.id)
                      }
                      aria-label="Excluir exercício"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ),
          )}
        </ul>
      )}

      {!mostrarForm && (
        <button
          type="button"
          className="config-treino__link"
          onClick={() => setMostrarForm(true)}
        >
          + adicionar exercício
        </button>
      )}

      {mostrarForm && (
        <NovoExercicioForm
          diaId={diaId}
          onCancelar={() => setMostrarForm(false)}
          onAdicionado={() => {
            setMostrarForm(false)
            onAtualizar()
          }}
        />
      )}
    </Card>
  )
}

interface ExercicioEditFormProps {
  exercicio: ExercicioPlanejadoDto
  onCancelar: () => void
  onSalvo: () => void
}

function ExercicioEditForm({
  exercicio,
  onCancelar,
  onSalvo,
}: ExercicioEditFormProps) {
  const [nome, setNome] = useState(
    exercicio.nome,
  )
  const [grupoMuscular, setGrupoMuscular] =
    useState(exercicio.grupoMuscular)
  const [seriesAlvo, setSeriesAlvo] = useState(
    String(exercicio.seriesAlvo),
  )
  const [repeticoesAlvo, setRepeticoesAlvo] =
    useState(String(exercicio.repeticoesAlvo))
  const [salvando, setSalvando] =
    useState(false)

  async function salvar(evento: FormEvent) {
    evento.preventDefault()

    if (
      !nome.trim() ||
      !grupoMuscular.trim()
    ) {
      return
    }

    setSalvando(true)

    try {
      await atualizarExercicio(exercicio.id, {
        nome: nome.trim(),
        grupoMuscular: grupoMuscular.trim(),
        seriesAlvo: Number(seriesAlvo),
        repeticoesAlvo: Number(repeticoesAlvo),
      })

      onSalvo()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="config-treino__form-exercicio"
    >
      <FormField
        id={`edit-nome-${exercicio.id}`}
        label="Exercício"
        value={nome}
        onChange={(e) =>
          setNome(e.target.value)
        }
      />

      <FormField
        id={`edit-grupo-${exercicio.id}`}
        label="Grupo muscular"
        value={grupoMuscular}
        onChange={(e) =>
          setGrupoMuscular(e.target.value)
        }
      />

      <div className="config-treino__grade-numeros">
        <FormField
          id={`edit-series-${exercicio.id}`}
          label="Séries"
          type="number"
          min="1"
          value={seriesAlvo}
          onChange={(e) =>
            setSeriesAlvo(e.target.value)
          }
        />

        <FormField
          id={`edit-reps-${exercicio.id}`}
          label="Repetições"
          type="number"
          min="1"
          value={repeticoesAlvo}
          onChange={(e) =>
            setRepeticoesAlvo(e.target.value)
          }
        />
      </div>

      <div className="config-treino__acoes-form">
        <Button
          type="button"
          variante="secundario"
          onClick={onCancelar}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

interface NovoExercicioFormProps {
  diaId: string
  onCancelar: () => void
  onAdicionado: () => void
}

function NovoExercicioForm({
  diaId,
  onCancelar,
  onAdicionado,
}: NovoExercicioFormProps) {
  const [nomeExercicio, setNomeExercicio] =
    useState('')
  const [grupoMuscular, setGrupoMuscular] =
    useState('')
  const [seriesAlvo, setSeriesAlvo] =
    useState('4')
  const [repeticoesAlvo, setRepeticoesAlvo] =
    useState('10')
  const [salvando, setSalvando] =
    useState(false)

  async function lidarComAdicionar(
    evento: FormEvent,
  ) {
    evento.preventDefault()

    if (
      !nomeExercicio.trim() ||
      !grupoMuscular.trim()
    ) {
      return
    }

    setSalvando(true)

    try {
      await adicionarExercicio(diaId, {
        nome: nomeExercicio.trim(),
        grupoMuscular: grupoMuscular.trim(),
        seriesAlvo: Number(seriesAlvo),
        repeticoesAlvo: Number(repeticoesAlvo),
      })

      onAdicionado()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={lidarComAdicionar}
      className="config-treino__form-exercicio"
    >
      <FormField
        id={`nome-${diaId}`}
        label="Exercício"
        value={nomeExercicio}
        onChange={(e) =>
          setNomeExercicio(e.target.value)
        }
        placeholder="Supino reto"
      />

      <FormField
        id={`grupo-${diaId}`}
        label="Grupo muscular"
        value={grupoMuscular}
        onChange={(e) =>
          setGrupoMuscular(e.target.value)
        }
        placeholder="Peito"
      />

      <div className="config-treino__grade-numeros">
        <FormField
          id={`series-${diaId}`}
          label="Séries"
          type="number"
          min="1"
          value={seriesAlvo}
          onChange={(e) =>
            setSeriesAlvo(e.target.value)
          }
        />

        <FormField
          id={`reps-${diaId}`}
          label="Repetições"
          type="number"
          min="1"
          value={repeticoesAlvo}
          onChange={(e) =>
            setRepeticoesAlvo(e.target.value)
          }
        />
      </div>

      <div className="config-treino__acoes-form">
        <Button
          type="button"
          variante="secundario"
          onClick={onCancelar}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Adicionar'}
        </Button>
      </div>
    </form>
  )
}

interface NovoDiaFormProps {
  planoTreinoId: string
  diasJaUsados: DiaSemana[]
  onAdicionado: () => void
}

function NovoDiaForm({
  planoTreinoId,
  diasJaUsados,
  onAdicionado,
}: NovoDiaFormProps) {
  const [mostrar, setMostrar] =
    useState(false)
  const [nome, setNome] = useState('')
  const [diaSemana, setDiaSemana] =
    useState<DiaSemana>('Monday')
  const [salvando, setSalvando] =
    useState(false)

  async function lidarComEnvio(
    evento: FormEvent,
  ) {
    evento.preventDefault()

    if (!nome.trim()) return

    setSalvando(true)

    try {
      await adicionarDiaDeTreino(
        planoTreinoId,
        {
          nome: nome.trim(),
          diaSemana,
        },
      )

      setNome('')
      setMostrar(false)
      onAdicionado()
    } finally {
      setSalvando(false)
    }
  }

  if (!mostrar) {
    return (
      <Button
        variante="secundario"
        onClick={() => setMostrar(true)}
      >
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
          onChange={(e) =>
            setNome(e.target.value)
          }
          placeholder="Peito"
        />

        <label
          className="config-treino__label-select"
          htmlFor="diaSemanaSelect"
        >
          Dia da semana
        </label>

        <select
          id="diaSemanaSelect"
          className="config-treino__select"
          value={diaSemana}
          onChange={(e) =>
            setDiaSemana(
              e.target.value as DiaSemana,
            )
          }
        >
          {DIAS_SEMANA.map((dia) => (
            <option key={dia} value={dia}>
              {LABEL_DIA_SEMANA[dia]}
              {diasJaUsados.includes(dia)
                ? ' (já tem treino)'
                : ''}
            </option>
          ))}
        </select>

        <div className="config-treino__acoes-form">
          <Button
            type="button"
            variante="secundario"
            onClick={() => setMostrar(false)}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={!nome.trim() || salvando}
          >
            {salvando
              ? 'Salvando...'
              : 'Adicionar dia'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

interface ConfiguracaoDescansoProps {
  segundosAtuais: number
  onSalvo: () => void
}

function ConfiguracaoDescanso({
  segundosAtuais,
  onSalvo,
}: ConfiguracaoDescansoProps) {
  const [segundos, setSegundos] = useState(
    String(segundosAtuais),
  )
  const [salvando, setSalvando] =
    useState(false)
  const [salvo, setSalvo] =
    useState(false)

  async function salvar() {
    const valor = Number(segundos)

    if (valor < 5 || valor > 900) {
      return
    }

    setSalvando(true)

    try {
      await atualizarTempoDescanso(valor)

      onSalvo()

      setSalvo(true)

      setTimeout(
        () => setSalvo(false),
        2000,
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Card titulo="Tempo de descanso entre séries">
      <div className="config-treino__descanso">
        <input
          type="number"
          inputMode="numeric"
          min="5"
          max="900"
          value={segundos}
          onChange={(e) =>
            setSegundos(e.target.value)
          }
          className="config-treino__descanso-input"
        />

        <span className="config-treino__descanso-label">
          segundos
        </span>

        <Button
          type="button"
          onClick={salvar}
          disabled={salvando}
        >
          {salvo
            ? '✓ Salvo'
            : salvando
              ? 'Salvando...'
              : 'Salvar'}
        </Button>
      </div>
    </Card>
  )
}