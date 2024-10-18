import { LANISTA_BASE_URL } from './app/shared/constants/lanista.constants'
import { Building } from './app/shared/services/building-api.service'

// console.log('hello from background 0')
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.webNavigation.onCompleted.addListener(
//     () => {
//       console.log('hello from background 1')
//       chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
//         console.log('hello from background')
//         if (id) {
//           chrome.pageAction.show(id)
//         }
//       })
//     },
//     { url: [{ urlMatches: 'google.com' }] },
//   )
// })

// async function _getLanistaTabs(): Promise<chrome.tabs.Tab[]> {
//   const queryOptions: chrome.tabs.QueryInfo = { url: LANISTA_BASE_URL + '/*' }
//   const tabs = await chrome.tabs.query(queryOptions)
//   return tabs
// }

// async function main(): Promise<void> {
//   console.log('hello from background 0')

//   const lanistaTabs = await _getLanistaTabs()
//   console.log('lanistaTabs: ', lanistaTabs)
// }

// chrome.alarms.create('tick', {
//   periodInMinutes: 1,
// })

// // To ensure a non-persistent script wakes up, call this code at its start synchronously
// chrome.alarms.onAlarm.addListener(function (alarm) {
//   if (alarm.name === 'tick') {
//     console.log('hello from alarm')
//   }
// })

// chrome.tabs.onActivated.addListener((activeInfo) => {
//   chrome.tabs.query(
//     { active: true, lastFocusedWindow: true, currentWindow: true },
//     function (tabs) {
//       var url = tabs[0].url
//       console.log('tab: ', url)
//     },
//   )
// })

function _getToken(): string {
  const parseCookie = (str: string) =>
    str
      .split(';')
      .map((v) => v.split('='))
      .reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        return acc
      }, {})
  const cookie = parseCookie(document.cookie)
  const token = cookie['XSRF-TOKEN']
  return token
}

async function _getBuildings(): Promise<Building[]> {
  const token = _getToken()
  console.log('token: ', token)
  const buildings = await fetch('https://beta.lanista.se/api/city/buildings', {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-xsrf-token': token,
    },
    method: 'GET',
  }).then((response) => response.json())
  return buildings
}

async function main(): Promise<void> {
  console.log('hello from content script')

  setTimeout(async () => {
    const buildings = await _getBuildings()
    console.log('buildings: ', buildings)
  }, 1000)
}
main()
