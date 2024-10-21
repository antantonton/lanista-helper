import { Me } from 'src/app/shared/services/me-api.service'
import { isBuildingUseCall } from './buildings'
import { hideInjection, refreshInjectedHtml, showInjection } from './injection'
import { getMe } from './me'
import { InjectAction } from 'src/app/shared/services/inject.service'

let me: Me | undefined
async function main(): Promise<void> {
  me = await getMe()
  console.log('me: ', me)

  setTimeout(async () => {
    await refreshInjectedHtml(me)
  }, 2000)
}

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
    if (entry.initiatorType === 'xmlhttprequest') {
      console.log(entry.name, entry)
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
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === InjectAction.SHOW) {
    showInjection()
    refreshInjectedHtml(me)
  } else if (message.action === InjectAction.HIDE) {
    hideInjection()
  }
  return true
})

main()

// TODO
// Add listener to setting in extension popup
// Hijack "me" instead of calling again
