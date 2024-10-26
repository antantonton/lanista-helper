import { isBuildingUseCall } from './buildings'
import { hideInjection, refreshInjectedHtml, showInjection } from './injection'
import { getMe } from './me'
import { InjectAction } from 'src/app/shared/services/inject.service'

const mePromise = getMe()

// Listen to network requests
const observer = new PerformanceObserver(async (list) => {
  const me = await mePromise
  for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
    if (entry.initiatorType === 'xmlhttprequest') {
      if (me && isBuildingUseCall(entry.name)) {
        refreshInjectedHtml(me)
      }
    }
  }
})
observer.observe({
  entryTypes: ['resource'],
})

// Listen to messages from pop-up
chrome.runtime.onMessage.addListener(async (message) => {
  const me = await mePromise
  if (message.action === InjectAction.SHOW) {
    showInjection()
    refreshInjectedHtml(me)
  } else if (message.action === InjectAction.HIDE) {
    hideInjection()
  }
  return true
})

// Wait for "me" to be loaded before injecting
mePromise.then(async (me) => {
  await refreshInjectedHtml(me)
})
