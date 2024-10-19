import { getBuildingsHtml } from './buildings'
import { getMe } from './me'

const _injectedElementId = 'lanista-helper'

async function main(): Promise<void> {
  console.log('hello from content script')

  const me = await getMe()
  console.log('me: ', me)

  setTimeout(async () => {
    const htmlToInject = await _gethtmlToInject()
    _refreshInjectedHtml(htmlToInject)
  }, 1000)

  setTimeout(async () => {
    const htmlToInject = await _gethtmlToInject()
    _refreshInjectedHtml(htmlToInject)
  }, 5000)
}

async function _gethtmlToInject(): Promise<string> {
  const classes = [
    'flex',
    'flex-row',
    'gap-4',
    'notice',
    'md:mt-2',
    'md:mb-2',
    'p-2',
    'md:pb-2',
    'pb-1',
    'w-full',
    'md:border',
    'border-b',
    'border-t',
    'border-black',
    'md:border-gray-600',
    'md:rounded',
    'shadow-xl',
    'fixed',
    'z-10',
    'md:relative',
    'left-0',
    'top-0',
  ]
  const styles = []

  return `<div id="${_injectedElementId}" class="${classes.join(
    ' ',
  )}" style="${styles.join('; ')}">${await getBuildingsHtml()}</div>`
}

function _refreshInjectedHtml(html: string): void {
  // Check if container exists
  const existingContainer = document.getElementById(_injectedElementId)
  console.log('existingContainer: ', existingContainer)
  if (existingContainer) {
    console.log('container already exists, injecting html', html)
    existingContainer.innerHTML = html
  } else {
    console.log(
      'container does not exist, creating new container with html',
      html,
    )
    const newContainer = document.createElement('div')
    newContainer.id = _injectedElementId
    newContainer.innerHTML = html
    const noticeElement = document.getElementsByClassName(
      'notice',
    )?.[0] as HTMLElement
    if (noticeElement) {
      // Get notice element background color
      const noticeElementBackground =
        window.getComputedStyle(noticeElement).background
      newContainer.style.background = noticeElementBackground

      // Insert after notice element
      noticeElement.parentElement.parentElement.insertBefore(
        newContainer,
        noticeElement.parentElement.nextSibling,
      )
    } else {
      console.error('Notice element not found, doing nothing')
    }
  }
}

main()
