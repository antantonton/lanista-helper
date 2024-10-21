import { Me } from 'src/app/shared/services/me-api.service'
import { getBuildingsHtml } from './buildings'

const _injectedElementId = 'lanista-helper'

export async function refreshInjectedHtml(me: Me): Promise<void> {
  const html = await _getHtmlToInject(me)

  // Check if container exists
  const existingContainer = document.getElementById(_injectedElementId)
  if (existingContainer) {
    existingContainer.innerHTML = html
  } else {
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

async function _getHtmlToInject(me: Me): Promise<string> {
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
  )}" style="${styles.join('; ')}">${await getBuildingsHtml(me)}</div>`
}
