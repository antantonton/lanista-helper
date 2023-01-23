import { Injectable } from '@angular/core'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { mapKeys } from 'lodash'

export type Config = {
  fighting_tactics: Tactics
  races: Race[]
}

export type Tactics = {
  [label: string]: number
}

export type Race = {
  name: string
  id: number
}

@Injectable({
  providedIn: 'root',
})
export class ConfigApiService {
  private readonly _configUrl = 'https://beta.lanista.se/api/config'
  private readonly _config$: Observable<Config> = from(
    fetch(this._configUrl).then((response) => response.json()),
  )

  constructor() {}

  getTacticsObservable(): Observable<Tactics> {
    return this._config$.pipe(
      map((config) =>
        mapKeys(config.fighting_tactics, (value, key) =>
          key.replaceAll('_', ' '),
        ),
      ),
    )
  }

  getRacesObservable(): Observable<Race[]> {
    return this._config$.pipe(map((config) => config.races))
  }
}
