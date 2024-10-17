import { inject, Injectable } from '@angular/core'
import { ScriptService } from './script.service'
import { CookieService } from './cookie.service'

export type Building = {
  id: BuildingId
  name: string
  usage: {
    last_usage: string
    next_usage: string
  }
}

export enum BuildingId {
  LIBRARY = 1,
  TRAINING = 2,
  HEALING = 3,
}

@Injectable({
  providedIn: 'root',
})
export class BuildingApiService {
  private readonly _scriptService = inject(ScriptService)
  private readonly _cookieService = inject(CookieService)

  private readonly _buildingsUrl = 'https://beta.lanista.se/api/city/buildings'
  constructor() {}

  async getBuildings(): Promise<Building[]> {
    const token = await this._cookieService.getAuthToken()
    console.log('token: ', token)
    if (!token) {
      throw new Error('No token found')
    }

    const buildings: Building[] = await this._scriptService.runFunction(
      (url: string, parameters: any) => {
        return fetch(url, parameters)
          .then((response) => response.json())
          .catch((error) => {
            console.error('error: ', error)
          })
      },
      [this._buildingsUrl, this._getBuildingsParameters(token)],
    )
    return buildings
  }

  private _getBuildingsParameters(token: string): any {
    return {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-xsrf-token': token,
      },
      method: 'GET',
    }
  }
}
