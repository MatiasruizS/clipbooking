import { cacheLife, cacheTag } from 'next/cache'
import type { Barbero, Servicio } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

export async function getServicios(): Promise<Servicio[]> {
  'use cache'
  cacheLife('days')
  cacheTag('servicios')

  try {
    const res = await fetch(`${BASE}/public/servicios`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getBarberos(): Promise<Barbero[]> {
  'use cache'
  cacheLife('days')
  cacheTag('barberos')

  try {
    const res = await fetch(`${BASE}/public/barberos`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
