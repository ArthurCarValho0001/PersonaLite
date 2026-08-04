import { Navigate, Route, Routes } from 'react-router-dom'
import { IndicadorSincronizacao } from './components/IndicadorSincronizacao'
import { useUsuario } from './hooks/useUsuario'
import { ConfigurarTreino } from './pages/ConfigurarTreino'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { NovaMedicao } from './pages/NovaMedicao'
import { Registrar } from './pages/Registrar'
import { Treinos } from './pages/Treinos'
import './App.css'

function App() {
  const { usuario, carregando, erro, autenticado, recarregar } = useUsuario()

  if (!autenticado) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Registrar />} />
      </Routes>
    )
  }

  if (carregando) {
    return (
      <div className="app-carregando">
        <p>Carregando...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="app-erro">
        <p>{erro}</p>
        <button type="button" onClick={recarregar}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!usuario) {
    // Token existe mas o usuário não foi encontrado (ex: token de uma conta apagada)
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard usuario={usuario} />} />
        <Route path="/medidas/nova" element={<NovaMedicao />} />
        <Route path="/medidas/:id/editar" element={<NovaMedicao />} />
        <Route path="/treinos" element={<Treinos />} />
        <Route path="/treinos/configurar" element={<ConfigurarTreino />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <IndicadorSincronizacao />
    </>
  )
}

export default App