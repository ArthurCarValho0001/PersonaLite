import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { CardExercicio } from '../components/CardExercicio'
import { usePlanoAtual } from '../hooks/usePlanoAtual'
import { useTreinoSelecionavel } from '../hooks/useTreinoSelecionavel'
import { DIAS_SEMANA, LABEL_DIA_SEMANA } from '../types'
import './Treinos.css'

const hojeIso = new Date().toISOString().slice(0, 10)

export function Treinos() {
  const { treino, carregando, erro, diaSelecionadoId, selecionarDia, recarregar } = useTreinoSelecionavel()
  const { plano } = usePlanoAtual()

  return (
    <div className="treinos">
      <header className="treinos__cabecalho">
        <div>
          <h1 className="treinos__titulo">Treino</h1>
          {treino && <p className="treinos__subtitulo">{LABEL_DIA_SEMANA[treino.diaSemana]}</p>}
        </div>
        <Link to="/">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      {plano && plano.dias.length > 0 && (
        <div className="treinos__seletor">
          <label htmlFor="seletorDia" className="treinos__seletor-label">
            Fazer o treino de:
          </label>
          <select
            id="seletorDia"
            className="treinos__seletor-select"
            value={diaSelecionadoId ?? ''}
            onChange={(e) => selecionarDia(e.target.value || null)}
          >
            <option value="">Hoje ({LABEL_DIA_SEMANA[DIAS_SEMANA[new Date().getDay()]]})</option>
            {plano.dias.map((dia) => (
              <option key={dia.id} value={dia.id}>
                {dia.nome} — {LABEL_DIA_SEMANA[dia.diaSemana]}
              </option>
            ))}
          </select>
        </div>
      )}

      {carregando && <p className="treinos__mensagem">Carregando...</p>}
      {erro && <p className="treinos__mensagem treinos__mensagem--erro">{erro}</p>}

      {!carregando && !erro && treino && !treino.temTreinoHoje && (
        <Card>
          <p className="treinos__descanso">
            🛌 Sem treino programado para {LABEL_DIA_SEMANA[treino.diaSemana]}.
          </p>
          <p className="treinos__descanso-sub">Configure um treino pra esse dia, ou escolha outro dia acima.</p>
        </Card>
      )}

      {!carregando && !erro && treino && treino.temTreinoHoje && (
        <>
          <div className="treinos__dia-badge">
            <span className="treinos__dia-badge-texto">{treino.nomeDia}</span>
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