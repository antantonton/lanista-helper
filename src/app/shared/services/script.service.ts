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

  async runScript<ArgType extends any[], ReturnType>(
    scriptPath: string,
    args?: ArgType,
  ): Promise<ReturnType> {
    const tab = await this._tabService.getLanistaTab()
    if (!tab) {
      throw new Error('No tab found')
    }

    return new Promise<ReturnType>((resolve) => {
      chrome.scripting.executeScript<ArgType, ReturnType>(
        {
          target: { tabId: tab.id as number },
          files: [scriptPath],
        },
        (response) => {
          resolve(response[0].result as ReturnType)
        },
      )
    })
  }
}
