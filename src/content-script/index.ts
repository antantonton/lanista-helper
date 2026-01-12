import { isBuildingUseCall } from './buildings'
import { Injector } from './injector.class'
import { getMe } from './me'
import { InjectAction } from 'src/app/shared/services/inject.service'

enum MessageType {
  FROM_INTERCEPTOR = 'FROM_INTERCEPTOR',
}

type InterceptorMessage = {
  type: MessageType.FROM_INTERCEPTOR
  url: string
  responseText: string
}

const mePromise = getMe()
const injectorPromise = mePromise.then((me) => {
  return new Injector(me)
})

// Listen to network requests
const observer = new PerformanceObserver(async (list) => {
  const injector = await injectorPromise
  for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
    if (entry.initiatorType === 'xmlhttprequest') {
      if (isBuildingUseCall(entry.name)) {
        injector.refreshInjectedHtml()
      }
    }
  }
})
observer.observe({
  entryTypes: ['resource'],
})

// Listen to messages from pop-up
chrome.runtime.onMessage.addListener(async (message) => {
  console.log('message received:', message)
  const injector = await injectorPromise
  if (message.action === InjectAction.SHOW) {
    injector.showInjection()
    injector.refreshInjectedHtml()
  } else if (message.action === InjectAction.HIDE) {
    injector.hideInjection()
  }
  return true
})

window.addEventListener('message', async (event) => {
  if (event?.data?.type === MessageType.FROM_INTERCEPTOR) {
    const message = event.data as InterceptorMessage
    const url = message.url
    const data = JSON.parse(message.responseText)
    console.log(url, data)
  }
})

// Wait for "me" to be loaded before injecting
injectorPromise.then(async (injector) => {
  await injector.refreshInjectedHtml()
})
