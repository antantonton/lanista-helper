import { Me } from 'src/app/shared/services/me-api.service'
import { getChanceGameHtml } from './chance-game'
import { getBuildingsHtml } from './buildings'

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

    const html = await this._getHtmlToInject(this.me)
    console.log('html: ', html)
    // Check if container exists
    const existingContainer = document.getElementById(this._injectedElementId)
    if (existingContainer) {
      existingContainer.innerHTML = html
    } else {
      const newContainer = document.createElement('div')
      newContainer.id = this._injectedElementId
      newContainer.innerHTML = html
      const noticeElement = await this._getNoticeElement()
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

  private async _getHtmlToInject(me: Me): Promise<string> {
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
    const styles = ['w-full']

    const leftSideHtml = `${await getBuildingsHtml(me)}`
    const middleHtml = `<div class="flex" style="flex: 1 1 auto;"></div>`
    const rightSideHtml = `${getChanceGameHtml(me)}`

    return `<div id="${this._injectedElementId}" class="${classes.join(
      ' ',
    )}" style="${styles.join('; ')}">
    ${leftSideHtml}${middleHtml}${rightSideHtml}
    </div>`
  }
}
