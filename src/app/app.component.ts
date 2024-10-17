import { Component } from '@angular/core'
import { TabService } from './shared/services/tab.service'
import { LANISTA_BASE_URL } from './shared/constants/lanista.constants'
import { ScriptService } from './shared/services/script.service'
import { MeApiService } from './shared/services/me-api.service'
import { ChallengeComponent } from './challenge/challenge.component'
import { ButtonModule } from 'primeng/button'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [CommonModule, ChallengeComponent, ButtonModule],
})
export class AppComponent {
  lanistaTab: chrome.tabs.Tab | undefined

  constructor(
    private _tabService: TabService,
    private _scriptService: ScriptService,
    private _meApiService: MeApiService,
  ) {}

  ngOnInit(): void {
    this._tabService.getLanistaTab().then(async (lanistaTab) => {
      console.log('lanistaTab: ', lanistaTab)
      this.lanistaTab = lanistaTab

      const me = await this._meApiService.getMe()
      console.log('me: ', me)
      this._scriptService.runFunction(
        function (me) {
          console.log('här')
          const element = document.createElement('div')
          document.body.appendChild(element)
          console.log('element: ', element)
          element.style.position = 'fixed'
          element.style.justifyContent = 'center'
          element.style.alignItems = 'center'
          element.style.display = 'flex'
          element.style.top = '0'
          // element.style.left = '0'
          element.style.right = '0'
          element.style.background = 'rgba(242, 0, 0, 0.5)'
          element.style.zIndex = '9999'
          element.style.height = '150px'
          element.style.width = '150px'
          element.style.pointerEvents = 'none'

          const span = document.createElement('span')
          element.appendChild(span)
          span.innerHTML = `max HP: ${me.avatar.max_hp}`
        },
        [me],
      )
    })
  }

  onOpenClick(): void {
    chrome.tabs.create({ url: LANISTA_BASE_URL })
  }
}
