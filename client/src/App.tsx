import { AtualizacaoPwa } from './components/AtualizacaoPwa'
import { Navigate, Route, Routes } from 'react-router-dom'
import { IndicadorSincronizacao } from './components/IndicadorSincronizacao'
import { DadosPrivacidade } from './pages/DadosPrivacidade'
import { EsqueciSenha } from './pages/EsqueciSenha'
import { InformacoesPessoais } from './pages/InformacoesPessoais'
import { Perfil } from './pages/Perfil'
import { useUsuario } from './hooks/useUsuario'
import { ConfigurarTreino } from './pages/ConfigurarTreino'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { NovaMedicao } from './pages/NovaMedicao'
import { Registrar } from './pages/Registrar'
import { Retrospectiva } from './pages/Retrospectiva'
import { Treinos } from './pages/Treinos'
import './App.css'
import { UsuarioProvider } from './components/UsuarioProvider'
import { limparToken } from './api/authToken'
import { AppLayout } from './components/AppLayout'
import { Aprender, ModuloAprender, AvaliacaoAprender, ProgressoAprender } from './pages/Aprender'

function ConteudoApp() {
  const { usuario, carregando, erro, autenticado, recarregar } = useUsuario()

  if (!autenticado) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/" element={<Registrar />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (carregando && !usuario) {
    return (
      <div className="app-carregando">
        <p role="status">Carregando seu usuário...</p>
        <button type="button" onClick={limparToken}>Sair da conta</button>
      </div>
    )
  }

  if (erro && !usuario) {
    return (
      <div className="app-erro">
        <p role="alert">{erro}</p>
        <button type="button" onClick={recarregar}>
          Tentar novamente
        </button>
        <button type="button" onClick={limparToken}>Sair da conta</button>
      </div>
    )
  }

  if (!usuario) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <AppLayout>
      {carregando && <p role="status">Atualizando seu usuário...</p>}
      {erro && (
        <div role="alert">
          <p>{erro}</p>
          <button type="button" onClick={recarregar}>Tentar novamente</button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard usuario={usuario} />} />
        <Route path="/aprender" element={<Aprender />} />
        <Route path="/aprender/progresso" element={<ProgressoAprender />} />
        <Route path="/aprender/:id" element={<ModuloAprender />} />
        <Route path="/aprender/:id/avaliacao" element={<AvaliacaoAprender />} />
        <Route path="/medidas/nova" element={<NovaMedicao />} />
        <Route path="/medidas/:id/editar" element={<NovaMedicao />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/treinos/configurar" element={<ConfigurarTreino />} />
        <Route path="/retrospectiva" element={<Retrospectiva />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/informacoes-pessoais" element={<InformacoesPessoais />} />
        <Route path="/perfil/dados-privacidade" element={<DadosPrivacidade />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <IndicadorSincronizacao />
    </AppLayout>
  )
}

export default function App() {
  return <UsuarioProvider><AtualizacaoPwa /><ConteudoApp /></UsuarioProvider>
}
