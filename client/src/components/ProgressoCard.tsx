import { Link } from 'react-router-dom'
import type { ResumoProgressoDto } from '../types'
import './ProgressoCard.css'

interface ProgressoCardProps {
  resumo: ResumoProgressoDto
}

export function ProgressoCard({ resumo }: ProgressoCardProps) {
  return (
    <Link to="/retrospectiva" className="progresso-card">
      <div className="progresso-card__cabecalho">
        <span className="progresso-card__titulo">Seu progresso</span>
        <span className="progresso-card__ver-tudo">Ver detalhes</span>
      </div>

      <div className="progresso-card__indicadores">
        <div>
          <span className="progresso-card__valor">{resumo.treinos}</span>
          <span className="progresso-card__label">dias de treino com sessão concluída</span>
        </div>
        <div>
          <span className="progresso-card__valor">{resumo.volumeTotal.toLocaleString('pt-BR')} kg</span>
          <span className="progresso-card__label">volume</span>
        </div>
      </div>

      <small>A contagem não exige concluir todos os exercícios do dia.</small>
      {resumo.destaque && (
        <div className="progresso-card__destaque">
          <span className="progresso-card__destaque-titulo">{resumo.destaque.titulo}</span>
          {resumo.destaque.descricao && (
            <span className="progresso-card__destaque-desc">{resumo.destaque.descricao}</span>
          )}
        </div>
      )}
    </Link>
  )
}
