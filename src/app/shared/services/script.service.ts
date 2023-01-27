import { Injectable } from '@angular/core'
import { TabService } from './tab.service'

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  constructor(private _tabService: TabService) {}

  async runFunction<T>(
    functionToRun: (...args: any) => T,
    args?: any,
  ): Promise<T | void> {
    const tab = await this._tabService.getLanistaTab()
    if (!tab) {
      return
    }

    return new Promise<T>((resolve) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id as number },
          func: functionToRun,
          args: args,
        },
        (response: chrome.scripting.InjectionResult<any>[]) => {
          resolve(response[0].result)
        },
      )
    })
  }
}
