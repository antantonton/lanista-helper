import { Me } from 'src/app/shared/services/me-api.service'
import { isBuildingUseCall } from './buildings'
import { refreshInjectedHtml } from './injection'
import { getMe } from './me'

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

main()
