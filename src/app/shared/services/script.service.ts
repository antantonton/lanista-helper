import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ScriptService {
  async runFunction<T>(
    functionToRun: (...args: any) => T,
    args?: any,
  ): Promise<T> {
    const tab = await this._getCurrentTab()

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

  private async _getCurrentTab(): Promise<chrome.tabs.Tab> {
    let queryOptions = { active: true, currentWindow: true }
    let [tab] = await chrome.tabs.query(queryOptions)
    return tab
  }
}
