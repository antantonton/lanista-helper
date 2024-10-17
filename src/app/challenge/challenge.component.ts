import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
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
import { firstValueFrom, Subscription } from 'rxjs'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { PercentageLabelPipe } from '../shared/pipes/percentage-label.pipe'
import { CheckboxModule } from 'primeng/checkbox'
import { InputNumberModule } from 'primeng/inputnumber'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { DividerModule } from 'primeng/divider'
import { ProgressSpinnerModule } from 'primeng/progressspinner'

type ChallengeFormValue = {
  min_level: number | null
  max_level: number | null
  min_start_percentage: number | null
}
type StoredChallengeFormValue = { [id: number]: ChallengeFormValue }

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    DividerModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  providers: [TitleCasePipe, PercentageLabelPipe],
})
export class ChallengeComponent implements OnInit, OnDestroy {
  private readonly _percentageLabelPipe = inject(PercentageLabelPipe)
  private readonly _titleCasePipe = inject(TitleCasePipe)
  private readonly _subscriptions = new Subscription()
  readonly storedChallengeFormValues = this._localStorageService.read<
    StoredChallengeFormValue | undefined
  >(LocalStorageItem.CHALLENGE_FORM_DEFAULTS)
  readonly storedRaceTactics =
    this._localStorageService.read<StoredRaceTactics>(
      LocalStorageItem.RACE_CHALLENGE_DEFAULTS,
    )
  readonly challengeForm = new FormGroup({
    min_level: new FormControl(null),
    max_level: new FormControl(null),
    min_start_percentage: new FormControl(null),
  })
  readonly raceForms = new FormGroup({})
  readonly tactics$ = this._configApiService.getTacticsObservable()
  readonly races$ = this._configApiService.getRacesObservable()
  percentageOptions: { label: string; value: number }[] = []

  me: Me
  tactics: { [id: number]: string } = {}
  tacticOptions: { label: string; value: number }[] = []
  sending = false

  constructor(
    private _configApiService: ConfigApiService,
    private _challengeApiService: ChallengeApiService,
    private _meApiService: MeApiService,
    private _localStorageService: LocalStorageService,
  ) {}

  ngOnInit(): void {
    firstValueFrom(this.tactics$).then((tactics) => {
      // Invert the tactics object so that we may use it to map id to label
      this.tactics = invert(tactics)
      this.tacticOptions = Object.entries(tactics).map(([label, value]) => ({
        label: this._titleCasePipe.transform(label),
        value: value,
      }))
    })

    this._meApiService.getMe().then((me) => {
      // Initialize the general challenge form
      this.me = me
      this.percentageOptions = [...Array(10).keys()]
        .map((v) => {
          const value = (v + 1) / 10
          return {
            label: this._percentageLabelPipe.transform(
              value,
              me?.avatar?.max_hp ?? 0,
            ),
            value: value,
          }
        })
        .reverse()
      this.challengeForm.patchValue({
        min_level:
          this.storedChallengeFormValues?.[this.me.avatar.id]?.min_level ?? 1,
        min_start_percentage:
          this.storedChallengeFormValues?.[this.me.avatar.id]
            ?.min_start_percentage ??
          this.me.avatar.default_autostart_percentage,
        max_level:
          this.storedChallengeFormValues?.[this.me.avatar.id]?.max_level ??
          this.me.avatar.level.level,
      })

      // Get all races, assemble a form for each using the stored race tactics
      firstValueFrom(this.races$).then((races) => {
        for (const race of races) {
          this.raceForms.registerControl(
            race.id.toString(),
            new FormGroup({
              enabled: new FormControl(
                this.storedRaceTactics?.[this.me.avatar.id]?.[race.id]
                  ?.enabled ?? true,
              ),
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
    this._subscriptions.add(
      this.challengeForm.valueChanges.subscribe((value: ChallengeFormValue) => {
        this._localStorageService.write(
          LocalStorageItem.CHALLENGE_FORM_DEFAULTS,
          { ...this.storedChallengeFormValues, [this.me.avatar.id]: value },
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
      [race: string]: {
        battle_tactic: number
        give_up_percentage: number
        enabled: boolean
      }
    } = this.raceForms.value
    for (const race of Object.keys(this.raceForms.value)) {
      if (value[race].enabled) {
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
    }
    this.sending = false
  }
}
