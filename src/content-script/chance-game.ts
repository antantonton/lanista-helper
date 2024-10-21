import { addHours } from 'date-fns'
import { Me } from 'src/app/shared/services/me-api.service'
import { getNextUsageHtml, getNextUsageLabel } from './helpers'

export function getChanceGameHtml(me: Me): string {
  const previousUsage = me.avatar.last_chance_full_hp + 'Z'
  console.log('previousUsage: ', previousUsage)
  const nextUsage = previousUsage ? addHours(new Date(previousUsage), 1) : null
  console.log('nextUsage: ', nextUsage.toISOString())
  return getNextUsageHtml(
    'Slumpduell',
    getNextUsageLabel(nextUsage.toISOString()),
  )
}
