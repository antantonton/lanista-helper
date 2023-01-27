import { Injectable } from '@angular/core'
import { ScriptService } from './script.service'

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  constructor(private _scriptService: ScriptService) {}

  /**
   * Returns the current auth token from cookies
   * @returns
   */
  async getAuthToken(): Promise<string | void> {
    const token = await this._scriptService.runFunction<string>(() => {
      const parseCookie = (str: string) =>
        str
          .split(';')
          .map((v) => v.split('='))
          .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(
              v[1].trim(),
            )
            return acc
          }, {})
      const cookie = parseCookie(document.cookie)
      const token = cookie['XSRF-TOKEN']
      return token
    })
    return token
  }
}
