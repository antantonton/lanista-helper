import { inject, Injectable } from '@angular/core'
import { TabService } from './tab.service'
import { ScriptService } from './script.service'
import {
  INJECTION_VISIBILITY_KEY,
  InjectionVisibility,
} from 'src/content-script/injector.class'

export enum InjectAction {
  SHOW = 'show_injection',
  HIDE = 'hide_injection',
}

@Injectable({
  providedIn: 'root',
})
export class InjectService {
  private readonly _scriptService = inject(ScriptService)
  private readonly _tabService = inject(TabService)
  constructor() {}

  async isVisible(): Promise<boolean> {
    const isVisible = await this._scriptService.runFunction<boolean>(
      (key: string, neq: any) => {
        return localStorage.getItem(key) !== neq
      },
      [INJECTION_VISIBILITY_KEY, InjectionVisibility.HIDDEN],
    )
    console.log('isVisible: ', isVisible)
    return Boolean(isVisible)
  }

  async enableInject(): Promise<void> {
    const lanistaTab = await this._tabService.getLanistaTab()
    if (!lanistaTab) {
      return
    }
    chrome.tabs.sendMessage(
      lanistaTab.id,
      { action: InjectAction.SHOW },
      function (response) {},
    )
  }

  async disableInject(): Promise<void> {
    const lanistaTab = await this._tabService.getLanistaTab()
    if (!lanistaTab) {
      return
    }
    chrome.tabs.sendMessage(
      lanistaTab.id,
      { action: InjectAction.HIDE },
      function (response) {},
    )
  }
}
