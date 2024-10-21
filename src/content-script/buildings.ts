import { format, isAfter, isSameDay } from 'date-fns'
import { getToken } from './lanista'
import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'
import { Me } from 'src/app/shared/services/me-api.service'

export type Building = {
  id: BuildingId
  name: string
  usage: {
    last_usage: string
    next_usage: string
  } | null
}

export enum BuildingId {
  LIBRARY = 1,
  TRAINING = 2,
  HEALING = 3,
}

export type ClanBuilding = {
  id: ClanBuildingId
  clan_building_usage?: {
    last_usage: string
    next_usage: string
  } | null
}

export enum ClanBuildingId {
  LIBRARY = 13,
  TRAINING = 12,
  MINE = 14,
}

const cityBuildingsEndpoint = `${LANISTA_BASE_URL}/api/city/buildings`
const getClanBuildingsEndpoint = (clanId: number) =>
  `${LANISTA_BASE_URL}/api/clans/${clanId}/buildings`

export async function getCityBuildings(): Promise<Building[]> {
  const token = getToken()
  const buildings = await fetch(cityBuildingsEndpoint, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-xsrf-token': token,
    },
    method: 'GET',
  }).then((response) => response.json())
  return buildings
}

export async function getClanBuildings(
  clanId: number,
): Promise<ClanBuilding[]> {
  const token = getToken()
  const buildings = await fetch(getClanBuildingsEndpoint(clanId), {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-xsrf-token': token,
    },
    method: 'GET',
  }).then((response) => response.json())
  return buildings
}

export async function getBuildingsHtml(me: Me): Promise<string> {
  const hasClan = Boolean(me?.avatar?.clan?.id)
  const [buildings, clanBuildings] = await Promise.all([
    getCityBuildings(),
    hasClan
      ? getClanBuildings(me.avatar.clan.id)
      : Promise.resolve([] as ClanBuilding[]),
  ])

  // Add clan buildings
  const buildingData: { name: string; nextUsageLabel: string }[] = []
  if (hasClan) {
    const library = clanBuildings.find(
      (building) => building.id === ClanBuildingId.LIBRARY,
    )
    if (library) {
      buildingData.push({
        name: _getNameForClanBuilding(library, buildings),
        nextUsageLabel: _getTimeLabel(library?.clan_building_usage?.next_usage),
      })
    }
    const training = clanBuildings.find(
      (building) => building.id === ClanBuildingId.TRAINING,
    )
    if (training) {
      buildingData.push({
        name: _getNameForClanBuilding(training, buildings),
        nextUsageLabel: _getTimeLabel(
          training?.clan_building_usage?.next_usage,
        ),
      })
    }
    const mine = clanBuildings.find(
      (building) => building.id === ClanBuildingId.MINE,
    )
    if (mine) {
      buildingData.push({
        name: _getNameForClanBuilding(mine, buildings),
        nextUsageLabel: _getTimeLabel(mine?.clan_building_usage?.next_usage),
      })
    }
  }

  // Add city buildings
  const library = buildings.find(
    (building) => building.id === BuildingId.LIBRARY,
  )
  if (library && !hasClan) {
    buildingData.push({
      name: library.name,
      nextUsageLabel: _getTimeLabel(library?.usage?.next_usage),
    })
  }
  const training = buildings.find(
    (building) => building.id === BuildingId.TRAINING,
  )
  if (training && !hasClan) {
    buildingData.push({
      name: training.name,
      nextUsageLabel: _getTimeLabel(training?.usage?.next_usage),
    })
  }
  const healing = buildings.find(
    (building) => building.id === BuildingId.HEALING,
  )
  if (healing) {
    buildingData.push({
      name: healing.name,
      nextUsageLabel: _getTimeLabel(healing?.usage?.next_usage),
    })
  }

  // Generate and return html
  const html = buildingData.map(({ name, nextUsageLabel }) =>
    _getBuildingHtml(name, nextUsageLabel),
  )
  return html.join('\n')
}

export function isBuildingUseCall(url: string): boolean {
  const urlSegments = url.split('/')
  return (
    urlSegments.at(-3).includes('buildings') &&
    urlSegments.at(-1).includes('use')
  )
}

function _getBuildingHtml(name: string, nextUsageLabel: string): string {
  const rows: string[] = [
    `<p class="text-sm capitalize font-semibold">${name}:</p>`,
    `<p class="text-sm mr-4">${nextUsageLabel}</p>`,
  ]
  return `<div class="flex flex-row gap-2">${rows.join('\n')}</div>`
}

function _getTimeLabel(nextUsage: string | undefined): string {
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

function _getNameForClanBuilding(
  clanBuilding: ClanBuilding,
  buildings: Building[],
): string {
  if (clanBuilding.id === ClanBuildingId.LIBRARY) {
    return (
      buildings.find((building) => building.id === BuildingId.LIBRARY)?.name ||
      ''
    )
  } else if (clanBuilding.id === ClanBuildingId.TRAINING) {
    return (
      buildings.find((building) => building.id === BuildingId.TRAINING)?.name ||
      ''
    )
  } else if (clanBuilding.id === ClanBuildingId.MINE) {
    return 'Gruva'
  } else {
    return ''
  }
}

// Use building
// fetch("https://beta.lanista.se/api/city/buildings/3/use", {
//   "headers": {
//     "accept": "application/json",
//     "accept-language": "sv,en-US;q=0.9,en;q=0.8,sv-SE;q=0.7,nb;q=0.6,da;q=0.5,de;q=0.4",
//     "priority": "u=1, i",
//     "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "x-requested-with": "XMLHttpRequest",
//     "x-socket-id": "740025573.312839512",
//     "x-xsrf-token": "eyJpdiI6IjZ2VGZKQnJDZEYrNHd5aitwQkh1S0E9PSIsInZhbHVlIjoieFV6cmc3cE9qV2xPNmdrY2ZtNG9Dbm0vTUVTQ3FVSUl1eU9XNWRDM1lSSlg1cVJIQjR0SStvaHF1WnJORm11ODd4RWFtcDZ0cFd4TFlPcEpFMFZscTNISmFsTkhHZG40ZWowWUpjQTFPT2NIcmc2MFNjbUxBSGdNVFdBUzE4QVYiLCJtYWMiOiI5M2MxOTZkYzAxNzQxOGFhMGQxZjFlZTczNzJhOTU4YzgzN2FkZjljNzFmMGFjMTllMzgwNmQwMmViZjhjMTdkIiwidGFnIjoiIn0="
//   },
//   "referrer": "https://beta.lanista.se/game/city/buildings/3/info",
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "POST",
//   "mode": "cors",
//   "credentials": "include"
// });
