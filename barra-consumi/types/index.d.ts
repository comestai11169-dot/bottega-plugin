export type Misura = {
  cinqueOre: number | null
  settimana: number | null
  resetCinque: string | null
  resetSettimana: string | null
  contesto: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'barra-consumi': { misura: Misura | null; avvisati: number[] }
  }
}
