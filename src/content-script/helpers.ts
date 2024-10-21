import { format, isAfter, isSameDay } from 'date-fns'

export function getNextUsageLabel(nextUsage: string | undefined): string {
  const date = nextUsage ? new Date(nextUsage) : null
  const now = new Date()
  if (!date) {
    return 'Redo'
  } else if (!isAfter(date, now)) {
    return 'Redo'
  } else if (!isSameDay(date, now)) {
    return format(date, 'EEE HH:mm')
  } else {
    return format(date, 'HH:mm')
  }
}

export function getNextUsageHtml(
  label: string,
  nextUsageLabel: string,
): string {
  const rows: string[] = [
    `<p class="text-sm capitalize font-semibold">${label}:</p>`,
    `<p class="text-sm mr-4">${nextUsageLabel}</p>`,
  ]
  return `<div class="flex flex-row gap-2">${rows.join('\n')}</div>`
}
