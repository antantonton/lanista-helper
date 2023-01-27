import { Injectable } from '@angular/core'
import { LANISTA_BASE_URL } from '../constants/lanista.constants'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor() {}

  async getCurrentTab(): Promise<chrome.tabs.Tab> {
    const queryOptions = { active: true, currentWindow: true }
    const [tab] = await chrome.tabs.query(queryOptions)
    return tab
  }

  async getLanistaTab(): Promise<chrome.tabs.Tab | undefined> {
    const queryOptions: chrome.tabs.QueryInfo = { url: LANISTA_BASE_URL + '/*' }
    const tabs = await chrome.tabs.query(queryOptions)
    return tabs?.[0]
  }
}
