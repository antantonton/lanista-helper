import { refreshInjectedHtml } from './injection'
import { getMe } from './me'

async function main(): Promise<void> {
  console.log('hello from content script')

  const me = await getMe()
  console.log('me: ', me)

  setTimeout(async () => {
    await refreshInjectedHtml()
  }, 2000)

  // setInterval(async () => {
  // await refreshInjectedHtml()
  // }, 10000)
}

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
    if (entry.initiatorType === 'xmlhttprequest') {
      console.log('entry: ', entry)
      console.log('http call to: ', entry.name)
    }
  }
})

observer.observe({
  entryTypes: ['resource'],
})

main()
