import { BuildingCooldowns } from './building-cooldowns.class'
import { isBuildingUseCall } from './buildings'
import { hideInjection, refreshInjectedHtml, showInjection } from './injection'
import { getMe } from './me'
import { InjectAction } from 'src/app/shared/services/inject.service'

const mePromise = getMe()
const buildingCooldownsPromise = mePromise.then(
  (me) => new BuildingCooldowns(me),
)

// Listen to network requests
const observer = new PerformanceObserver(async (list) => {
  // const me = await mePromise
  const buildingCooldowns = await buildingCooldownsPromise
  for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
    if (entry.initiatorType === 'xmlhttprequest') {
      if (buildingCooldowns && isBuildingUseCall(entry.name)) {
        refreshInjectedHtml(buildingCooldowns)
      }
    }
  }
})
observer.observe({
  entryTypes: ['resource'],
})

// Listen to messages from pop-up
chrome.runtime.onMessage.addListener(async (message) => {
  // const me = await mePromise
  const buildingCooldowns = await buildingCooldownsPromise
  if (message.action === InjectAction.SHOW) {
    showInjection()
    refreshInjectedHtml(buildingCooldowns)
  } else if (message.action === InjectAction.HIDE) {
    hideInjection()
  }
  return true
})

// Wait for "me" to be loaded before injecting
// mePromise.then(async (me) => {
//   await refreshInjectedHtml(me)
// })
buildingCooldownsPromise.then(async (buildingCooldowns) => {
  refreshInjectedHtml(buildingCooldowns)
})

// Refresh timers every 2 seconds
setInterval(async () => {
  const buildingCooldowns = await buildingCooldownsPromise
  refreshInjectedHtml(buildingCooldowns)
}, 1000)
