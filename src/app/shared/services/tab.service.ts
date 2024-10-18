import { Injectable } from '@angular/core'
import { LANISTA_BASE_URL } from '../constants/lanista.constants'

@Injectable({
  providedIn: 'root',
})
export class TabService {
  constructor() {}

  async getLanistaTab(): Promise<chrome.tabs.Tab | undefined> {
    const queryOptions: chrome.tabs.QueryInfo = { url: LANISTA_BASE_URL + '/*' }
    const tabs = await chrome.tabs.query(queryOptions)
    return tabs?.[0]
  }
}
