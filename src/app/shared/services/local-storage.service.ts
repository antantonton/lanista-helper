import { Injectable } from '@angular/core'

export enum LocalStorageItem {
  RACE_CHALLENGE_DEFAULTS = 'RACE_CHALLENGE_DEFAULTS',
  CHALLENGE_FORM_DEFAULTS = 'CHALLENGE_FORM_DEFAULTS',
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  read<T>(item: LocalStorageItem): T {
    return JSON.parse(localStorage.getItem(item))
  }

  write<T>(item: LocalStorageItem, data: T): void {
    localStorage.setItem(item, JSON.stringify(data))
  }
}
