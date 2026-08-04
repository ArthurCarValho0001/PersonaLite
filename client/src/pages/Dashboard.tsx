import { Link } from 'react-router-dom'
import { AlertaReavaliacao } from '../components/AlertaReavaliacao'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { GraficoEvolucao } from '../components/GraficoEvolucao'
import { useEvolucao } from '../hooks/useEvolucao'
import type { UsuarioDto } from '../types'
import './Dashboard.css'
import { limparToken } from '../api/authToken'

interface DashboardProps {
  usuario: UsuarioDto
}

export function Dashboard({ usuario }: DashboardProps) {
  const { evolucao, carregando, erro } = useEvolucao()
  const ultimoRegistro = evolucao.at(-1)

  return (
    <div className="dashboard">
      <header className="dashboard__cabecalho">
        <div>
          <h1 className="dashboard__titulo">Olá, {usuario.nome}</h1>
          <p className="dashboard__subtitulo">Seu histórico de evolução física</p>
        </div>
        <div className="dashboard__acoes">
          <Link to="/treinos">
            <Button variante="secundario">Treinos</Button>
          </Link>
          <Link to="/medidas/nova">
            <Button>Nova medição</Button>
          </Link>
          <button
            type="button"
            className="dashboard__sair"
            onClick={() => {
              limparToken()
              window.location.reload()
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <AlertaReavaliacao />

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
