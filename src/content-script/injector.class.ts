import { Me } from 'src/app/shared/services/me-api.service'
import { getChanceGameHtml } from './chance-game'
import { getBuildingsHtml } from './buildings'
import { getRankedHtml } from './ranked'
import { openOverlay } from './overlay'

export const INJECTION_VISIBILITY_KEY = 'lanista-injection-visibility'
export enum InjectionVisibility {
  HIDDEN = 'HIDDEN',
  VISIBLE = 'VISIBLE',
}

export class Injector {
  private readonly _injectedElementId = 'lanista-helper'
  readonly me: Me
  constructor(me: Me) {
    this.me = me
  }

  hideInjection(): void {
    localStorage.setItem(INJECTION_VISIBILITY_KEY, InjectionVisibility.HIDDEN)
    document.getElementById(this._injectedElementId)?.remove()
  }

  showInjection(): void {
    localStorage.setItem(INJECTION_VISIBILITY_KEY, InjectionVisibility.VISIBLE)
  }

  private _isVisible(): boolean {
    const visibility = localStorage.getItem(INJECTION_VISIBILITY_KEY)
    return visibility !== InjectionVisibility.HIDDEN
  }

  async refreshInjectedHtml(): Promise<void> {
    if (!this._isVisible()) {
      return
    }

    const elementToInject = await this._getHtmlToInject(this.me)
    // Check if container exists
    const existingElement = document.getElementById(this._injectedElementId)
    if (existingElement) {
      existingElement.replaceWith(elementToInject)
    } else {
      const noticeElement = await this._getNoticeElement()
      if (noticeElement) {
        // Get notice element background color
        const noticeElementBackground =
          window.getComputedStyle(noticeElement).background
        elementToInject.style.background = noticeElementBackground

        // Insert after notice element
        noticeElement.parentElement.parentElement.insertBefore(
          elementToInject,
          noticeElement.parentElement.nextSibling,
        )
      } else {
        console.error('Notice element not found, doing nothing')
      }
    }
  }

  private _getNoticeElement(): Promise<HTMLElement> {
    return new Promise((resolve) => {
      if (document.getElementsByClassName('notice')?.[0]) {
        return resolve(
          document.getElementsByClassName('notice')?.[0] as HTMLElement,
        )
      }

      const observer = new MutationObserver(() => {
        if (document.getElementsByClassName('notice')?.[0]) {
          observer.disconnect()
          resolve(document.getElementsByClassName('notice')?.[0] as HTMLElement)
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })
  }

  private async _getHtmlToInject(me: Me): Promise<HTMLDivElement> {
    const [buildingHtml, rankedHtml, chanceGameHtml] = await Promise.all([
      getBuildingsHtml(me),
      getRankedHtml(me),
      getChanceGameHtml(me),
    ])

    const injectionContainer = document.createElement('div')
    injectionContainer.id = this._injectedElementId
    injectionContainer.className = [
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
    ].join(' ')

    // Add left side
    const leftSide = document.createElement('div')
    leftSide.className = 'flex flex-row gap-4 items-center'
    leftSide.innerHTML = buildingHtml
    injectionContainer.appendChild(leftSide)

    // Add middle
    const middle = document.createElement('div')
    middle.className = 'flex'
    middle.style.flex = '1 1 auto'
    injectionContainer.appendChild(middle)

    // Add right side
    const rightSide = document.createElement('div')
    rightSide.className = 'flex flex-row gap-4 items-center'
    rightSide.innerHTML = `${rankedHtml ?? ''}${chanceGameHtml}`
    injectionContainer.appendChild(rightSide)

    // Overlay button (only if pip is available)
    if (document.pictureInPictureEnabled) {
      const overlayButton = document.createElement('button')
      overlayButton.textContent = '⇲'
      overlayButton.className = 'btn-action pt-0 pb-0'
      overlayButton.addEventListener('click', () => {
        openOverlay(me)
      })
      injectionContainer.appendChild(overlayButton)
    }

    return injectionContainer
  }
}
