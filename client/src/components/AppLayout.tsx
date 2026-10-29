import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Home, Dumbbell, ChartNoAxesCombined, BookOpen, UserRound, Leaf } from 'lucide-react'
import { useUsuario } from '../hooks/useUsuario'
import './AppLayout.css'
const itens = [ ['/', 'Início', Home], ['/treinos', 'Treinos', Dumbbell], ['/retrospectiva', 'Evolução', ChartNoAxesCombined], ['/aprender', 'Aprender', BookOpen], ['/perfil', 'Perfil', UserRound] ] as const
export function AppLayout({ children }: { children: ReactNode }) {
  const { usuario } = useUsuario()
  return <div className="v2-shell"><a href="#conteudo" className="v2-skip">Pular para o conteúdo</a><aside className="v2-sidebar"><Link to="/" className="v2-brand"><img src="/icon-192.png" alt=""/><span>PersonaLite<small>SEU RITMO. SUA EVOLUÇÃO.</small></span></Link><nav aria-label="Navegação principal">{itens.map(([to,label,Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={21}/><span>{label}</span></NavLink>)}</nav><div className="v2-sidebar-note"><Leaf size={24}/><p>Cuidar de si também<br/>é aprender todos os dias.</p></div><div className="v2-sidebar-user"><span>{usuario?.nome.slice(0,1)}</span><div><strong>{usuario?.nome}</strong><small>Sua jornada, no seu tempo</small></div></div></aside><div className="v2-main"><div className="v2-topbar"><span>Bem-estar em movimento</span><span className="v2-version">PERSONALITE V2 · LOCAL</span></div><main id="conteudo" tabIndex={-1}>{children}</main><footer className="v2-footer">PersonaLite · Movimento, conhecimento e cuidado.</footer></div></div>
}
