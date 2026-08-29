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

  const { trimestre, recarregar: recarregarTrimestre } = useTrimestre()
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

      <AlertaReavaliacao />

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