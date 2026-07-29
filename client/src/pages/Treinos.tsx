import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CardExercicio } from '../components/CardExercicio'
import { LABEL_DIA_SEMANA } from '../types'
import { useTreinoDoDia } from '../hooks/useTreinoDoDia'
import './Treinos.css'

const hojeIso = new Date().toISOString().slice(0, 10)

export function Treinos() {
  const { treino, carregando, erro, recarregar } = useTreinoDoDia()

  return (
    <div className="treinos">
      <header className="treinos__cabecalho">
        <div>
          <h1 className="treinos__titulo">Treino de hoje</h1>
          {treino && <p className="treinos__subtitulo">{LABEL_DIA_SEMANA[treino.diaSemana]}</p>}
        </div>
        <Link to="/">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      {carregando && <p className="treinos__mensagem">Carregando...</p>}
      {erro && <p className="treinos__mensagem treinos__mensagem--erro">{erro}</p>}

      {!carregando && !erro && treino && !treino.temTreinoHoje && (
        <Card>
          <p className="treinos__descanso">
            🛌 Sem treino programado para hoje ({LABEL_DIA_SEMANA[treino.diaSemana]}).
          </p>
          <p className="treinos__descanso-sub">Aproveite pra descansar, ou configure um treino pra esse dia.</p>
        </Card>
      )}

      {!carregando && !erro && treino && treino.temTreinoHoje && (
        <>
          <div className="treinos__dia-badge">
            <span className="treinos__dia-badge-texto">Hoje: {treino.nomeDia}</span>
          </div>

          {treino.exercicios.length === 0 && (
            <Card>
              <p>Esse dia ainda não tem exercícios cadastrados.</p>
            </Card>
          )}

          <div className="treinos__lista">
            {treino.exercicios.map((exercicio) => (
              <CardExercicio
                key={exercicio.exercicioPlanejadoId}
                exercicio={exercicio}
                data={hojeIso}
                onAtualizar={recarregar}
              />
            ))}
          </div>
        </>
      )}

      <Link to="/treinos/configurar" className="treinos__link-config">
        Configurar treinos da semana
      </Link>
    </div>
  )
}
