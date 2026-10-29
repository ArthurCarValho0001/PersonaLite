import { useState } from 'react'
import { criarTrimestre } from '../api/trimestreApi'
import { Link } from 'react-router-dom'
import { AlertaReavaliacao } from '../components/AlertaReavaliacao'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { GraficoEvolucao } from '../components/GraficoEvolucao'
import { ProgressoCard } from '../components/ProgressoCard'
import { SugestaoTrocaBanner } from '../components/SugestaoTrocaBanner'
import { useEvolucao } from '../hooks/useEvolucao'
import { useResumoProgresso } from '../hooks/useResumoProgresso'
import { useSugestaoTroca } from '../hooks/useSugestaoTroca'
import { useTrimestre } from '../hooks/useTrimestre'
import type { UsuarioDto } from '../types'
import './Dashboard.css'

interface DashboardProps {
  usuario: UsuarioDto
}

export function Dashboard({ usuario }: DashboardProps) {
  const { evolucao, carregando, erro } = useEvolucao()
  const ultimoRegistro = evolucao.at(-1)

  const [iniciando, setIniciando] = useState(false)
  const [erroCiclo, setErroCiclo] = useState('')
  const { trimestre, carregando: carregandoCiclo, recarregar: recarregarTrimestre } = useTrimestre()
  const { resumo } = useResumoProgresso()
  const sugestao = useSugestaoTroca()

  function lidarComNovoTrimestre() {
    recarregarTrimestre()
  }

  return (
    <div className="dashboard">
      <header className="dashboard__cabecalho">
        <Link to="/perfil" className="dashboard__usuario-link">
          <Avatar nome={usuario.nome} avatarUrl={usuario.avatarUrl} />
          <div>
            <h1 className="dashboard__titulo">Olá, {usuario.nome}</h1>
            {trimestre && <span className="dashboard__trimestre-badge">Trimestre {trimestre.numero}</span>}
          </div>
        </Link>
        <div className="dashboard__acoes">
          <Link to="/treinos">
            <Button variante="secundario">Treinos</Button>
          </Link>
          <Link to="/medidas/nova">
            <Button>Nova medição</Button>
          </Link>
        </div>
      </header>

      {!carregandoCiclo && !trimestre && <section className="v2-panel"><h2>Organize seu acompanhamento</h2><p>Você pode iniciar um ciclo trimestral quando desejar. Seus treinos e medidas continuam disponíveis.</p><button disabled={iniciando} onClick={async () => {
        if (!confirm('Iniciar seu primeiro ciclo de acompanhamento hoje?')) return
        setIniciando(true); setErroCiclo('')
        try { await criarTrimestre(); await recarregarTrimestre() } catch { setErroCiclo('Não foi possível iniciar o ciclo. Tente novamente.') } finally { setIniciando(false) }
      }}>{iniciando ? 'Iniciando...' : 'Iniciar ciclo de acompanhamento'}</button>{erroCiclo && <p role="alert">{erroCiclo}</p>}</section>}
      <AlertaReavaliacao />
      <section className="v2-dashboard-welcome"><div><h2>Seu cuidado vai além do treino.</h2><p>Conheça a área Aprender: aulas curtas, novas perspectivas e um espaço para acompanhar seu aprendizado.</p></div><Link className="v2-link-button" to="/aprender">Explorar Aprender →</Link></section>

      {sugestao && <SugestaoTrocaBanner sugestao={sugestao} onNovoTrimestreIniciado={lidarComNovoTrimestre} />}

      {resumo && <ProgressoCard resumo={resumo} />}

      {carregando && <p className="dashboard__mensagem">Carregando...</p>}
      {erro && <p className="dashboard__mensagem dashboard__mensagem--erro">{erro}</p>}

      {!carregando && !erro && evolucao.length === 0 && (
        <Card>
          <p>
            Você ainda não tem nenhuma medição registrada. Clique em <strong>Nova medição</strong>{' '}
            para começar seu histórico.
          </p>
        </Card>
      )}

      {ultimoRegistro && (
        <div className="dashboard__resumo">
          <Card titulo="Peso atual">
            <p className="dashboard__valor">{ultimoRegistro.pesoKg} kg</p>
          </Card>
          <Card titulo="% Gordura (JP7)">
            <p className="dashboard__valor">{ultimoRegistro.percentualGorduraJP7}%</p>
          </Card>
          <Card titulo="IMC">
            <p className="dashboard__valor">{ultimoRegistro.imc}</p>
          </Card>
        </div>
      )}

      {evolucao.length > 1 && (
        <Card titulo="Evolução">
          <GraficoEvolucao dados={evolucao} />
        </Card>
      )}

      {evolucao.length > 0 && (
        <Card titulo="Histórico">
          <ul className="dashboard__historico">
            {[...evolucao].reverse().map((registro) => (
              <li key={registro.id} className="dashboard__historico-item">
                <span>{new Date(registro.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span>{registro.pesoKg} kg</span>
                <Link to={`/medidas/${registro.id}/editar`}>Editar</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
