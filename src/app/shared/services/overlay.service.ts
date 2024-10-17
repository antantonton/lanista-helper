import { inject, Injectable } from '@angular/core'
import { TabService } from './tab.service'
import { ScriptService } from './script.service'
import { BuildingApiService, BuildingId } from './building-api.service'

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private readonly _overlayElementId = 'lanista-helper-overlay'
  private readonly _scriptService = inject(ScriptService)
  private readonly _tabService = inject(TabService)
  private readonly _buildingApiService = inject(BuildingApiService)

  constructor() {}

  async openOverlay(): Promise<void> {
    const lanistaTab = await this._tabService.getLanistaTab()
    console.log('lanistaTab: ', lanistaTab)

    const overlayIsOpen = await this._isOverlayOpen()
    console.log('overlayIsOpen: ', overlayIsOpen)
    if (overlayIsOpen) {
      await this._closeOverlay()
    }

    const buildings = await this._buildingApiService.getBuildings()

    const relevantBuildings = buildings.filter((building) =>
      [BuildingId.LIBRARY, BuildingId.TRAINING, BuildingId.HEALING].includes(
        building.id,
      ),
    )

    const buildingHtml = relevantBuildings
      .map((building) => {
        return `<span class="font-serif">${building.name}</span>
        <br>
        <span class="text-sm">${this._formatTimeDifference(
          new Date(building.usage.next_usage),
        )}</span>`
      })
      .join('<br><br>')

    const timerId = await this._scriptService.runFunction(
      function (id: string, content: string): number {
        console.log('här')
        const element = document.createElement('div')
        element.id = id
        document.body.appendChild(element)
        console.log('element: ', element)
        element.style.position = 'fixed'
        element.style.justifyContent = 'end'
        element.style.alignItems = 'start'
        element.style.display = 'flex'
        element.style.top = '0'
        element.style.right = '0'
        element.style.background = 'rgba(0, 0, 0, 0.3)'
        element.style.color = 'white'
        element.style.zIndex = '9999'
        element.style.height = 'auto'
        element.style.width = 'auto'
        element.style.pointerEvents = 'none'
        element.style.padding = '10px'

        const span = document.createElement('span')
        element.appendChild(span)
        span.innerHTML = content
        // span.style.pointerEvents = 'auto'
        span.style.textAlign = 'end'

        // span.classList.add('font-serif')
        // span.classList.add('text-green-600')

        let i = 0
        const timerId = window.setInterval(() => {
          console.log('i: ', i)
          i++
        }, 10000)
        console.log('timerId: ', timerId)
        return timerId
      },
      [this._overlayElementId, buildingHtml],
    )

    await new Promise((resolve) => setTimeout(resolve, 5000))
    if (timerId) {
      await this._stopTimer(timerId)
    }
  }

  private async _stopTimer(timerId: number): Promise<void> {
    await this._scriptService.runFunction(
      function (timerId: number): void {
        clearInterval(timerId)
      },
      [timerId],
    )
  }

  private async _isOverlayOpen(): Promise<boolean> {
    const elementExists = await this._scriptService.runFunction(
      function (id: string) {
        return Boolean(document.getElementById(id))
      },
      [this._overlayElementId],
    )
    return Boolean(elementExists)
  }

  private async _closeOverlay(): Promise<void> {
    await this._scriptService.runFunction(
      function (id: string) {
        const element = document.getElementById(id)
        if (element) {
          element.remove()
        }
      },
      [this._overlayElementId],
    )
  }

  private _formatTimeDifference(date: Date): string {
    const now = new Date().getTime()
    const diffInSeconds = Math.floor((date.getTime() - now) / 1000)
    let result = ''

    if (diffInSeconds > 0) {
      const hours = Math.floor(diffInSeconds / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)

      if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`
      }
      if (minutes > 0) {
        result +=
          (result ? ', ' : '') + `${minutes} minute${minutes > 1 ? 's' : ''}`
      }
      result = `in ${result}`
    } else {
      const absDiffInSeconds = Math.abs(diffInSeconds)
      const hours = Math.floor(absDiffInSeconds / 3600)
      const minutes = Math.floor((absDiffInSeconds % 3600) / 60)

      if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`
      }
      if (minutes > 0) {
        result +=
          (result ? ', ' : '') + `${minutes} minute${minutes > 1 ? 's' : ''}`
      }
      result = `${result} ago`
    }

    return result || 'just now'
  }
}
