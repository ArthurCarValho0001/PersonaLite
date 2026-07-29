import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { atualizarMedidas, obterMedida, registrarMedidas } from '../api/medidasApi'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FormField } from '../components/FormField'
import './NovaMedicao.css'

const camposTronco = [
  { chave: 'pescoco', label: 'Pescoço' },
  { chave: 'toraxMesoesternal', label: 'Tórax mesoesternal' },
  { chave: 'toraxMamilo', label: 'Tórax mamilo' },
  { chave: 'ultimaCostela', label: 'Última costela' },
  { chave: 'cintura', label: 'Cintura' },
  { chave: 'quadril', label: 'Quadril' },
] as const

const camposMembrosSuperiores = [
  { chave: 'bracoEsquerdo', label: 'Braço esquerdo' },
  { chave: 'bracoDireito', label: 'Braço direito' },
  { chave: 'antebracoEsquerdo', label: 'Antebraço esquerdo' },
  { chave: 'antebracoDireito', label: 'Antebraço direito' },
] as const

const camposMembrosInferiores = [
  { chave: 'pernaEsquerda', label: 'Perna esquerda' },
  { chave: 'pernaDireita', label: 'Perna direita' },
  { chave: 'panturrilhaEsquerda', label: 'Panturrilha esquerda' },
  { chave: 'panturrilhaDireita', label: 'Panturrilha direita' },
] as const

const camposDobras = [
  { chave: 'peitoral', label: 'Peitoral' },
  { chave: 'axilarMedia', label: 'Axilar média' },
  { chave: 'triceps', label: 'Tríceps' },
  { chave: 'subescapular', label: 'Subescapular' },
  { chave: 'abdominal', label: 'Abdominal' },
  { chave: 'suprailiaca', label: 'Suprailíaca' },
  { chave: 'coxaDobra', label: 'Coxa' },
] as const

const camposCircunferencia = [...camposTronco, ...camposMembrosSuperiores, ...camposMembrosInferiores]

type CampoCircunferencia = (typeof camposCircunferencia)[number]['chave']
type CampoDobra = (typeof camposDobras)[number]['chave']
type CamposNumericos = CampoCircunferencia | CampoDobra | 'pesoKg'

type EstadoFormulario = Record<CamposNumericos, string> & { data: string }

const estadoInicial: EstadoFormulario = {
  data: new Date().toISOString().slice(0, 10),
  pesoKg: '',
  pescoco: '',
  toraxMesoesternal: '',
  toraxMamilo: '',
  ultimaCostela: '',
  cintura: '',
  quadril: '',
  bracoEsquerdo: '',
  bracoDireito: '',
  antebracoEsquerdo: '',
  antebracoDireito: '',
  pernaEsquerda: '',
  pernaDireita: '',
  panturrilhaEsquerda: '',
  panturrilhaDireita: '',
  peitoral: '',
  axilarMedia: '',
  triceps: '',
  subescapular: '',
  abdominal: '',
  suprailiaca: '',
  coxaDobra: '',
}

export function NovaMedicao() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const modoEdicao = Boolean(id)

  const [form, setForm] = useState<EstadoFormulario>(estadoInicial)
  const [carregandoRegistro, setCarregandoRegistro] = useState(modoEdicao)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    obterMedida(id)
      .then((r) => {
        setForm({
          data: r.data,
          pesoKg: String(r.pesoKg),
          pescoco: String(r.pescoco),
          toraxMesoesternal: String(r.toraxMesoesternal),
          toraxMamilo: String(r.toraxMamilo),
          ultimaCostela: String(r.ultimaCostela),
          cintura: String(r.cintura),
          quadril: String(r.quadril),
          bracoEsquerdo: String(r.bracoEsquerdo),
          bracoDireito: String(r.bracoDireito),
          antebracoEsquerdo: String(r.antebracoEsquerdo),
          antebracoDireito: String(r.antebracoDireito),
          pernaEsquerda: String(r.pernaEsquerda),
          pernaDireita: String(r.pernaDireita),
          panturrilhaEsquerda: String(r.panturrilhaEsquerda),
          panturrilhaDireita: String(r.panturrilhaDireita),
          peitoral: String(r.peitoral),
          axilarMedia: String(r.axilarMedia),
          triceps: String(r.triceps),
          subescapular: String(r.subescapular),
          abdominal: String(r.abdominal),
          suprailiaca: String(r.suprailiaca),
          coxaDobra: String(r.coxaDobra),
        })
      })
      .catch(() => setErro('Não foi possível carregar essa medição.'))
      .finally(() => setCarregandoRegistro(false))
  }, [id])

  function atualizarCampo(campo: keyof EstadoFormulario, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  const camposObrigatoriosPreenchidos = Object.entries(form).every(([chave, valor]) =>
    chave === 'data' ? valor !== '' : Number(valor) > 0
  )

  async function lidarComEnvio(evento: FormEvent) {
    evento.preventDefault()
    if (!camposObrigatoriosPreenchidos) return

    setEnviando(true)
    setErro(null)
    try {
      const dto = {
        data: form.data,
        pesoKg: Number(form.pesoKg),
        pescoco: Number(form.pescoco),
        toraxMesoesternal: Number(form.toraxMesoesternal),
        toraxMamilo: Number(form.toraxMamilo),
        ultimaCostela: Number(form.ultimaCostela),
        cintura: Number(form.cintura),
        quadril: Number(form.quadril),
        bracoEsquerdo: Number(form.bracoEsquerdo),
        bracoDireito: Number(form.bracoDireito),
        antebracoEsquerdo: Number(form.antebracoEsquerdo),
        antebracoDireito: Number(form.antebracoDireito),
        pernaEsquerda: Number(form.pernaEsquerda),
        pernaDireita: Number(form.pernaDireita),
        panturrilhaEsquerda: Number(form.panturrilhaEsquerda),
        panturrilhaDireita: Number(form.panturrilhaDireita),
        peitoral: Number(form.peitoral),
        axilarMedia: Number(form.axilarMedia),
        triceps: Number(form.triceps),
        subescapular: Number(form.subescapular),
        abdominal: Number(form.abdominal),
        suprailiaca: Number(form.suprailiaca),
        coxaDobra: Number(form.coxaDobra),
      }

      if (modoEdicao && id) {
        await atualizarMedidas(id, dto)
      } else {
        const resultado = await registrarMedidas(dto)
        if (!resultado.sincronizado) {
          alert('Sem conexão com a API — a medição foi salva localmente e será enviada assim que possível.')
        }
      }
      navigate('/')
    } catch {
      setErro('Não foi possível salvar a medição. Confira se os dados estão corretos.')
    } finally {
      setEnviando(false)
    }
  }

  if (carregandoRegistro) {
    return <p className="nova-medicao__carregando">Carregando...</p>
  }

  return (
    <div className="nova-medicao">
      <h1 className="nova-medicao__titulo">{modoEdicao ? 'Editar medição' : 'Nova medição'}</h1>
      <p className="nova-medicao__subtitulo">
        Duas etapas: circunferências com fita métrica e dobras cutâneas com adipômetro. O
        percentual de gordura (Jackson &amp; Pollock 7 dobras) e o IMC são calculados
        automaticamente.
      </p>

      <form onSubmit={lidarComEnvio}>
        <Card titulo="Geral">
          <div className="nova-medicao__grade">
            <FormField
              id="data"
              label="Data"
              type="date"
              value={form.data}
              onChange={(e) => atualizarCampo('data', e.target.value)}
            />
            <FormField
              id="pesoKg"
              label="Peso"
              unidade="kg"
              type="number"
              step="0.1"
              min="0"
              value={form.pesoKg}
              onChange={(e) => atualizarCampo('pesoKg', e.target.value)}
            />
          </div>
        </Card>

        <section className="nova-medicao__secao">
          <h2 className="nova-medicao__secao-titulo">1. Circunferências (fita métrica)</h2>

          <Card titulo="Tronco">
            <div className="nova-medicao__grade">
              {camposTronco.map(({ chave, label }) => (
                <FormField
                  key={chave}
                  id={chave}
                  label={label}
                  unidade="cm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form[chave]}
                  onChange={(e) => atualizarCampo(chave, e.target.value)}
                />
              ))}
            </div>
          </Card>

          <Card titulo="Membros superiores">
            <div className="nova-medicao__grade">
              {camposMembrosSuperiores.map(({ chave, label }) => (
                <FormField
                  key={chave}
                  id={chave}
                  label={label}
                  unidade="cm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form[chave]}
                  onChange={(e) => atualizarCampo(chave, e.target.value)}
                />
              ))}
            </div>
          </Card>

          <Card titulo="Membros inferiores">
            <div className="nova-medicao__grade">
              {camposMembrosInferiores.map(({ chave, label }) => (
                <FormField
                  key={chave}
                  id={chave}
                  label={label}
                  unidade="cm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form[chave]}
                  onChange={(e) => atualizarCampo(chave, e.target.value)}
                />
              ))}
            </div>
          </Card>
        </section>

        <section className="nova-medicao__secao">
          <h2 className="nova-medicao__secao-titulo">2. Dobras cutâneas (adipômetro) — protocolo 7 dobras</h2>
          <Card>
            <div className="nova-medicao__grade">
              {camposDobras.map(({ chave, label }) => (
                <FormField
                  key={chave}
                  id={chave}
                  label={label}
                  unidade="mm"
                  type="number"
                  step="0.1"
                  min="0"
                  value={form[chave]}
                  onChange={(e) => atualizarCampo(chave, e.target.value)}
                />
              ))}
            </div>
          </Card>
        </section>

        {erro && <p className="nova-medicao__erro">{erro}</p>}

        <div className="nova-medicao__acoes">
          <Button type="button" variante="secundario" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!camposObrigatoriosPreenchidos || enviando}>
            {enviando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Salvar medição'}
          </Button>
        </div>
      </form>
    </div>
  )
}
