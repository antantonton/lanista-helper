import { differenceInDays, format, isAfter, isSameDay } from 'date-fns'
import { getToken } from './lanista'
import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'

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

export async function getBuildings(): Promise<Building[]> {
  const token = getToken()
  const buildings = await fetch(`${LANISTA_BASE_URL}/api/city/buildings`, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-xsrf-token': token,
    },
    method: 'GET',
  }).then((response) => response.json())
  return buildings
}

export async function getBuildingsHtml(): Promise<string> {
  const buildings = await getBuildings()
  console.log('buildings: ', buildings)
  const relevantBuildings = buildings.filter((building) =>
    [BuildingId.LIBRARY, BuildingId.TRAINING, BuildingId.HEALING].includes(
      building.id,
    ),
  )
  return relevantBuildings
    .map((building) => _getBuildingHtml(building))
    .join('\n')
}

function _getBuildingHtml(building: Building): string {
  const rows: string[] = [
    `<p class="text-sm capitalize font-semibold">${building.name}:</p>`,
    `<p class="text-sm mr-4">${_getTimeLabel(building)}</p>`,
  ]
  return `<div class="flex flex-row gap-2">${rows.join('\n')}</div>`
}

function _getTimeLabel(building: Building): string {
  const date = building.usage?.next_usage
    ? new Date(building.usage.next_usage)
    : null
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
