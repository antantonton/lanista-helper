import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import {
  ChallengeApiService,
  RaceTactics,
  StoredRaceTactics,
} from '../shared/services/challenge-api.service'
import { ConfigApiService } from '../shared/services/config-api.service'
import { invert } from 'lodash'
import { Me, MeApiService } from '../shared/services/me-api.service'
import {
  LocalStorageItem,
  LocalStorageService,
} from '../shared/services/local-storage.service'
import { Subscription } from 'rxjs'
@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss'],
})
export class ChallengeComponent implements OnInit, OnDestroy {
  private readonly _subscriptions = new Subscription()
  readonly storedRaceTactics =
    this._localStorageService.read<StoredRaceTactics>(
      LocalStorageItem.RACE_CHALLENGE_DEFAULTS,
    )
  readonly challengeForm = new FormGroup({
    min_level: new FormControl(1),
    max_level: new FormControl(null),
    min_start_percentage: new FormControl(null),
  })
  readonly raceForms = new FormGroup({})
  readonly tactics$ = this._configApiService.getTacticsObservable()
  readonly races$ = this._configApiService.getRacesObservable()
  readonly percentageOptions: number[] = [...Array(10).keys()]
    .map((v) => (v + 1) / 10)
    .reverse()

  me: Me | undefined
  tactics: { [id: number]: string } = {}
  sending = false

  constructor(
    private _configApiService: ConfigApiService,
    private _challengeApiService: ChallengeApiService,
    private _meApiService: MeApiService,
    private _localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    this.tactics$.toPromise().then((tactics) => {
      // Invert the tactics object so that we may use it to map id to label
      this.tactics = invert(tactics)
    })

    this._meApiService.getMe().then((me) => {
      // Initialize the general challenge form
      this.me = me
      this.challengeForm.patchValue({
        min_start_percentage: this.me.avatar.default_autostart_percentage,
        max_level: this.me.avatar.level.level,
      })

      // Get all races, assemble a form for each using the stored race tactics
      this.races$.toPromise().then((races) => {
        for (const race of races) {
          this.raceForms.registerControl(
            race.id.toString(),
            new FormGroup({
              battle_tactic: new FormControl(
                this.storedRaceTactics?.[this.me.avatar.id]?.[race.id]
                  ?.battle_tactic ?? this.me.avatar.default_tactic,
              ),
              give_up_percentage: new FormControl(
                this.storedRaceTactics?.[this.me.avatar.id]?.[race.id]
                  ?.give_up_percentage ??
                  this.me.avatar.default_give_up_percentage,
              ),
            }),
          )
        }
      })
    })

    // Subscribe to form changes in order to save to local storage
    this._subscriptions.add(
      this.raceForms.valueChanges.subscribe((value: RaceTactics) => {
        this._localStorageService.write<StoredRaceTactics>(
          LocalStorageItem.RACE_CHALLENGE_DEFAULTS,
          { ...this.storedRaceTactics, [this.me.avatar.id]: value },
        )
      }),
    )
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe()
  }

  /**
   * Returns the form for the given race id
   * @param raceId
   * @returns
   */
  getRaceForm(raceId: number): FormGroup {
    return this.raceForms.get(raceId.toString()) as FormGroup
  }

  /**
   * Callback for the send button
   * Sends challenges according to the current form values
   */
  async sendChallenge(): Promise<void> {
    this.sending = true

    const value: {
      [race: string]: { battle_tactic: number; give_up_percentage: number }
    } = this.raceForms.value
    for (const race of Object.keys(this.raceForms.value)) {
      await this._challengeApiService.sendChallenge({
        battle_tactic: value[race].battle_tactic,
        give_up_percentage: value[race].give_up_percentage,
        min_start_percentage: this.challengeForm.value.min_start_percentage,
        min_level: this.challengeForm.value.min_level,
        max_level: this.challengeForm.value.max_level,
        query: '',
        battle_mode: 0,
        race: parseInt(race),
      })
    }
    this.sending = false
  }
}
