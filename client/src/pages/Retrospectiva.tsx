import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { TreinoRetrospectiva } from '../components/TreinoRetrospectiva'
import { useRetrospectiva } from '../hooks/useRetrospectiva'
import './Retrospectiva.css'

function formatarMes(data: string): string {
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function Retrospectiva() {
  const { retrospectiva, carregando } = useRetrospectiva()

  return (
    <div className="retrospectiva-pagina">
      <header className="retrospectiva-pagina__cabecalho">
        <div>
          <h1 className="retrospectiva-pagina__titulo">Evolução</h1>
          {retrospectiva && (
            <p className="retrospectiva-pagina__subtitulo">{formatarMes(retrospectiva.mesReferencia)}</p>
          )}
        </div>
        <Link to="/">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      {carregando && <p className="retrospectiva-pagina__mensagem">Carregando...</p>}

      {!carregando && (!retrospectiva || retrospectiva.treinos.length === 0) && (
        <Card>
          <p>
            Ainda não há treinos concluídos esse mês. Conclua um exercício (ou o treino inteiro) na
            tela de Treinos pra começar a ver sua evolução aqui.
          </p>
        </Card>
      )}

      {!carregando && retrospectiva && retrospectiva.treinos.length > 0 && (
        <div className="retrospectiva-pagina__lista">
          {retrospectiva.treinos.map((treino, indice) => (
            <TreinoRetrospectiva key={treino.nomeDia} treino={treino} abertoPorPadrao={indice === 0} />
          ))}
        </div>
      )}
    </div>
  )
}