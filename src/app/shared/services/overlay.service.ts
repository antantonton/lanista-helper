import { inject, Injectable } from '@angular/core'
import { TabService } from './tab.service'
import { ScriptService } from './script.service'
import {
  Building,
  BuildingApiService,
  BuildingId,
} from './building-api.service'
import { isAfter, format, differenceInDays } from 'date-fns'

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private readonly _overlayElementId = 'lanista-helper'
  private readonly _scriptService = inject(ScriptService)
  private readonly _tabService = inject(TabService)
  private readonly _buildingApiService = inject(BuildingApiService)

  constructor() {}

  async openOverlay(): Promise<void> {
    const lanistaTab = await this._tabService.getLanistaTab()
    console.log('lanistaTab: ', lanistaTab)

    if (await this._isInjected()) {
      await this._removeInjection()
    }

    const htmlToInject = await this._gethtmlToInject()

    const timerId = await this._scriptService.runFunction(
      function (id: string, htmlToInject: string): number {
        const element = document.createElement('div')
        element.id = id
        element.innerHTML = htmlToInject

        const noticeElement = document.getElementsByClassName(
          'notice',
        )?.[0] as HTMLElement
        console.log('noticeElement: ', noticeElement)

        if (noticeElement) {
          // Get notice element background color
          const noticeElementBackground =
            window.getComputedStyle(noticeElement).background
          element.style.background = noticeElementBackground

          // Insert after notice element
          noticeElement.parentElement.parentElement.insertBefore(
            element,
            noticeElement.parentElement.nextSibling,
          )
        }

        let i = 0
        const timerId = window.setInterval(() => {
          console.log('i: ', i)
          i++
        }, 60000)
        console.log('timerId: ', timerId)
        return timerId
      },
      [this._overlayElementId, htmlToInject],
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

  private async _isInjected(): Promise<boolean> {
    const elementExists = await this._scriptService.runFunction(
      function (id: string) {
        return Boolean(document.getElementById(id))
      },
      [this._overlayElementId],
    )
    return Boolean(elementExists)
  }

  private async _removeInjection(): Promise<void> {
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

  private async _gethtmlToInject(): Promise<string> {
    const classes =
      'flex flex-row gap-4 notice md:mt-2 md:mb-2 p-2 md:pb-2 pb-1 w-full md:border border-b border-t border-black md:border-gray-600 md:rounded shadow-xl fixed z-10 md:relative left-0 top-0'
    return `<div id="${
      this._overlayElementId
    }" class="${classes}">${await this._getBuildingsHtml()}</div>`
  }

  private async _getBuildingsHtml(): Promise<string> {
    const buildings = await this._buildingApiService.getBuildings()
    console.log('buildings: ', buildings)
    const relevantBuildings = buildings.filter((building) =>
      [BuildingId.LIBRARY, BuildingId.TRAINING, BuildingId.HEALING].includes(
        building.id,
      ),
    )
    return relevantBuildings
      .map((building) => this._getBuildingHtml(building))
      .join('\n')
  }

  private _getBuildingHtml(building: Building): string {
    const rows: string[] = [
      `<p class="text-sm capitalize font-semibold">${building.name}:</p>`,
      `<p class="text-sm mr-4">${this._getTimeLabel(building)}</p>`,
    ]
    return `<div class="flex flex-row gap-2">${rows.join('\n')}</div>`
  }

  private _getTimeLabel(building: Building): string {
    const date = building.usage?.next_usage
      ? new Date(building.usage.next_usage)
      : null
    const now = new Date()
    if (!date) {
      return 'Redo'
    } else if (!isAfter(date, now)) {
      return 'Redo'
    } else if (differenceInDays(date, now) > 0) {
      return format(date, 'EEE HH:mm')
    } else {
      return format(date, 'HH:mm')
    }
  }
}
