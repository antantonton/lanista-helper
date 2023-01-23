import { Injectable } from '@angular/core'
import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'
import { CookieService } from 'src/app/shared/services/cookie.service'
import { ScriptService } from 'src/app/shared/services/script.service'

export type Me = {
  avatar: Avatar
}

export type Avatar = {
  id: number
  available_time: number
  remaining_to_full_hp: number
  max_hp: number
  default_autostart_percentage: number
  default_give_up_percentage: number
  default_tactic: number
  level: {
    level: number
  }
}

@Injectable({
  providedIn: 'root',
})
export class MeApiService {
  private readonly _meUrl = `${LANISTA_BASE_URL}/api/users/me`

  constructor(
    private _cookieService: CookieService,
    private _scriptService: ScriptService,
  ) {}

  async getMe(): Promise<Me> {
    const token = await this._cookieService.getAuthToken()
    console.log('token: ', token)
    console.log('this._meUrl: ', this._meUrl)
    console.log('this._getMeParameters(token): ', this._getMeParameters(token))
    const me = await this._scriptService.runFunction<Promise<Me>>(
      (url: string, parameters: any) => {
        return fetch(url, parameters).then((response) => response.json())
      },
      [this._meUrl, this._getMeParameters(token)],
    )

    console.log('me: ', me)
    return me
  }

  private _getMeParameters(token: string): any {
    return {
      headers: {
        // accept: 'application/json',
        // 'accept-language':
        //   'sv,en-US;q=0.9,en;q=0.8,sv-SE;q=0.7,nb;q=0.6,da;q=0.5,de;q=0.4',
        // 'sec-ch-ua':
        //   '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
        // 'sec-ch-ua-mobile': '?0',
        // 'sec-ch-ua-platform': '"Windows"',
        // 'sec-fetch-dest': 'empty',
        // 'sec-fetch-mode': 'cors',
        // 'sec-fetch-site': 'same-origin',
        // 'x-requested-with': 'XMLHttpRequest',
        'x-xsrf-token': token,
      },
      //   referrerPolicy: 'strict-origin-when-cross-origin',
      //   body: null,
      method: 'GET',
      //   mode: 'cors',
      //   credentials: 'include',
    }
  }
}
