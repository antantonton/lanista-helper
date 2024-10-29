import { addMinutes, isBefore } from 'date-fns'
import { Me } from 'src/app/shared/services/me-api.service'
import { getNextUsageHtml, getNextUsageLabel } from './helpers'
import { getToken } from './lanista'
import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'
import { last } from 'lodash'

type HistoryItem = {
  id: number
  type: HistoryItemType
  created_at: string
}

enum HistoryItemType {
  RANKED = 13,
}

export async function getRankedHtml(me: Me): Promise<string | null> {
  if (me.avatar.current_level < 15) {
    return null
  }
  const lastRankedGameWithinLimit = await lookForRankedGame(
    me,
    addMinutes(new Date(), -30),
  )

  const nextUsage = lastRankedGameWithinLimit
    ? addMinutes(new Date(lastRankedGameWithinLimit.created_at), 30)
    : undefined
  return getNextUsageHtml('Rankat', getNextUsageLabel(nextUsage?.toISOString()))
}

async function lookForRankedGame(
  me: Me,
  maxAge: Date,
  page = 1,
): Promise<HistoryItem | null> {
  // Get history items
  const historyItems = await _getHistory(me, page)
  if (!historyItems.length) {
    return null
  }

  // If there is a ranked game in the history, return it
  const rankedGame = historyItems.find(
    (item) => item.type === HistoryItemType.RANKED,
  )
  if (rankedGame) {
    return rankedGame
  }

  // If there is no ranked game but the last history item is older than maxAge, return null
  const lastItemOlderThanMaxAge =
    last(historyItems) &&
    isBefore(new Date(last(historyItems).created_at), maxAge)
  if (lastItemOlderThanMaxAge) {
    return null
  }

  // If there is no ranked game and the last history item is not older than maxAge, keep looking
  return lookForRankedGame(me, maxAge, page + 1)
}

async function _getHistory(me: Me, page: number): Promise<HistoryItem[]> {
  const token = getToken()
  const response = await fetch(
    `${LANISTA_BASE_URL}/api/avatars/${me.avatar.id}/battles?page=${page}`,
    {
      headers: {
        'x-xsrf-token': token,
      },
      method: 'GET',
    },
  ).then((response) => response.json())
  return response.data
}
