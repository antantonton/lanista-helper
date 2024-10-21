import { Me } from 'src/app/shared/services/me-api.service'
import { isBuildingUseCall } from './buildings'
import { hideInjection, refreshInjectedHtml, showInjection } from './injection'
import { getMe } from './me'
import { InjectAction } from 'src/app/shared/services/inject.service'

let me: Me | undefined
async function main(): Promise<void> {
  console.log('hello from content script')

  me = await getMe()
  console.log('me: ', me)

  setTimeout(async () => {
    await refreshInjectedHtml(me)
  }, 2000)
}

const observer = new PerformanceObserver((list) => {
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
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === InjectAction.SHOW) {
    console.log('showing injection')
    showInjection()
    refreshInjectedHtml(me)
  } else if (message.action === InjectAction.HIDE) {
    console.log('hiding injection')
    hideInjection()
  }
  return true
})

main()

// TODO
// Add listener to setting in extension popup
// Hijack "me" instead of calling again
