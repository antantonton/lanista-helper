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
  clan: {
    id: number
    name: string
  }
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
    const token = (await this._cookieService.getAuthToken()) as string
    const me: Me = (await this._scriptService.runFunction<Promise<Me>>(
      (url: string, parameters: any) => {
        return fetch(url, parameters).then((response) => response.json())
      },
      [this._meUrl, this._getMeParameters(token)],
    )) as Me
    return me
  }

  private _getMeParameters(token: string): any {
    return {
      headers: {
        'x-xsrf-token': token,
      },
      method: 'GET',
    }
  }
}
