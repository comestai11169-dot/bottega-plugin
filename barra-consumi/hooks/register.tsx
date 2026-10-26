import { atom, read, update } from 'claude-code'
import type { Register, SessionRateLimit, SessionContextUsage } from 'claude-code'

import type { Misura } from '../types'

const misura = atom({ plugin: 'barra-consumi', key: 'misura' } as const, null)
const avvisati = atom({ plugin: 'barra-consumi', key: 'avvisati' } as const, [])

const ora = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('it-IT', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit' })
}

const leggi = (rate: readonly SessionRateLimit[], context: SessionContextUsage): Misura => {
  const cinque = rate.find(r => r.kind === 'five_hour')
  const sett = rate.find(r => r.kind === 'seven_day')
  return {
    cinqueOre: cinque ? cinque.percentUsed : null,
    settimana: sett ? sett.percentUsed : null,
    resetCinque: cinque?.resetsAt ?? null,
    resetSettimana: sett?.resetsAt ?? null,
    contesto: context.percent ?? null,
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    const m = leggi(u.rateLimits, u.context)
    await update($, misura, () => m)
    return r
  })

  on('session.measure', async ($, e, next) => {
    const m = leggi(e.rateLimits, e.context)
    await update($, misura, () => m)
    const gia = await read($, avvisati)
    for (const soglia of [80, 95]) {
      if (m.cinqueOre !== null && m.cinqueOre >= soglia && !gia.includes(soglia)) {
        $.ui.toast(`Limite di 5 ore al ${m.cinqueOre}%: si libera ${ora(m.resetCinque)}`)
        await update($, avvisati, a => [...a, soglia])
      }
    }
    if (m.cinqueOre !== null && m.cinqueOre < 50 && gia.length > 0) {
      await update($, avvisati, () => [])
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const m = await read($, misura)
    if (e.props.hasSurvey) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    if (m === null) return (<Box><Text dimColor>barra consumi: in attesa della prima misura</Text></Box>)
    const pezzi: string[] = []
    if (m.cinqueOre !== null) pezzi.push(`5 ore ${m.cinqueOre}%${m.resetCinque ? ` (torna ${ora(m.resetCinque)})` : ''}`)
    if (m.settimana !== null) pezzi.push(`settimana ${m.settimana}%`)
    if (m.contesto !== null) pezzi.push(`chat ${m.contesto}%`)
    if (pezzi.length === 0) return (<Box><Text dimColor>barra consumi: in attesa della prima misura</Text></Box>)
    const pesante = (m.contesto ?? 0) >= 60
    return (
      <Box>
        <Text dimColor={!pesante} color={pesante ? 'yellow' : undefined}>
          {pezzi.join(' · ')}
          {pesante ? ' · chat lunga: aprine una nuova' : ''}
        </Text>
      </Box>
    )
  })
}
