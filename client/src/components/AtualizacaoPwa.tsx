import { useEffect, useState } from 'react'
export function AtualizacaoPwa() {
  const [disponivel, setDisponivel] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let ativo = true
    const verificar = () => navigator.serviceWorker.getRegistration().then(registro => {
      if (ativo) setDisponivel(Boolean(registro?.waiting))
    }).catch(() => {})
    verificar()
    const intervalo = window.setInterval(verificar, 30000)
    return () => { ativo = false; window.clearInterval(intervalo) }
  }, [])
  if (!disponivel) return null
  return <aside role="status">Há uma atualização disponível. Termine e salve suas alterações,
    sincronize as pendências e feche todas as abas do PersonaLite. A atualização será aplicada
    ao abrir novamente. Nenhuma tela será recarregada automaticamente.</aside>
}
