import { Injectable } from '@angular/core'
import { LANISTA_BASE_URL } from '../constants/lanista.constants'
import { CookieService } from './cookie.service'
import { ScriptService } from './script.service'

export type Challenge = {
  battle_tactic: number
  give_up_percentage: number
  min_start_percentage: number
  min_level: number
  max_level: number
  battle_mode: 0
  query: ''
  race: number
}

export type RaceTactic = {
  battle_tactic: number
  give_up_percentage: number
}

export type RaceTactics = { [race: string]: RaceTactic }

export type StoredRaceTactics = { [id: number]: RaceTactics }

@Injectable({
  providedIn: 'root',
})
export class ChallengeApiService {
  private readonly _challengeApiUrl = `${LANISTA_BASE_URL}/api/challenges/masscreate`

  constructor(
    private _cookieService: CookieService,
    private _scriptService: ScriptService,
  ) {}

  async sendChallenge(challenge: Challenge): Promise<void> {
    const token = await this._cookieService.getAuthToken()
    if (!token) {
      return
    }

    const response: any[] = (
      await this._scriptService.runFunction(
        (url: string, parameters: any) => {
          return fetch(url, parameters).then((response) => response.json())
        },
        [this._challengeApiUrl, this._getChallengeParameters(token, challenge)],
      )
    ).data

    console.log('challenge response: ', response)
  }

  private _getChallengeParameters(token: string, challenge: Challenge): any {
    return {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-xsrf-token': token,
      },
      method: 'POST',
      body: JSON.stringify(challenge),
    }
  }
}
