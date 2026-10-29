import { dataLocal } from '../api/calendario'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { atualizarInformacoesPessoais } from '../api/perfilApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import { SeletorSexo } from '../components/SeletorSexo'
import { useUsuario } from '../hooks/useUsuario'
import type { Sexo } from '../types'
import './InformacoesPessoais.css'

export function InformacoesPessoais() {
  const { usuario, recarregar } = useUsuario()

  if (!usuario) return null

  return (
    <div className="info-pessoais">
      <header className="info-pessoais__cabecalho">
        <h1 className="info-pessoais__titulo">Informações pessoais</h1>
        <Link to="/perfil">
          <Button variante="secundario">Voltar</Button>
        </Link>
      </header>

      <Formulario
        alturaAtual={usuario.alturaCm}
        nomeAtual={usuario.nome}
        dataNascimentoAtual={usuario.dataNascimento}
        sexoAtual={usuario.sexo}
        metasAtuais={usuario.metas}
        onSalvo={recarregar}
      />
    </div>
  )
}

interface FormularioProps {
  alturaAtual: number
  nomeAtual: string
  dataNascimentoAtual: string
  sexoAtual: Sexo
  metasAtuais: string | null
  onSalvo: () => void
}

function Formulario({ alturaAtual, nomeAtual, dataNascimentoAtual, sexoAtual, metasAtuais, onSalvo }: FormularioProps) {
  const [altura, setAltura] = useState(String(alturaAtual))
  const [erro, setErro] = useState('')
  const [nome, setNome] = useState(nomeAtual)
  const [dataNascimento, setDataNascimento] = useState(dataNascimentoAtual)
  const [sexo, setSexo] = useState<Sexo | null>(sexoAtual)
  const [metas, setMetas] = useState(metasAtuais ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  async function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!sexo || !nome.trim() || !dataNascimento) return

    setErro('')
    setSalvando(true)
    try {
      await atualizarInformacoesPessoais({
        alturaCm: Number(altura),
        nome: nome.trim(),
        dataNascimento,
        sexo,
        metas: metas.trim() || null,
      })
      onSalvo()
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } catch { setErro('Não foi possível salvar. Confira os dados e tente novamente.') } finally {
      setSalvando(false)
    }
  }

  return (
    <Card>
      <form onSubmit={salvar}>
        <FormField id="nome" label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />

        <FormField
          id="dataNascimento"
          label="Data de nascimento"
          type="date" max={dataLocal()}
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
        />

        <FormField id="altura" label="Altura (cm)" type="number" min="1" step="0.1" required value={altura} onChange={e => setAltura(e.target.value)} />
        <p>Alterar nascimento, sexo ou altura recalcula os indicadores das medições anteriores.</p>
        {erro && <p role="alert">{erro}</p>}
        <SeletorSexo valor={sexo} onChange={setSexo} />

        <label className="info-pessoais__label" htmlFor="metas">
          Metas (opcional)
        </label>
        <textarea
          id="metas"
          className="info-pessoais__textarea"
          value={metas}
          onChange={(e) => setMetas(e.target.value)}
          placeholder="Ex: ganhar 5kg de massa magra até dezembro"
          rows={3}
        />

        <Button type="submit" disabled={salvando}>
          {salvo ? '✓ Salvo' : salvando ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
    </Card>
  )
}
