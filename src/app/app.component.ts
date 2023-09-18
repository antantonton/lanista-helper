import { Component } from '@angular/core'
import { TabService } from './shared/services/tab.service'
import { ScriptService } from './shared/services/script.service'
import { LANISTA_BASE_URL } from './shared/constants/lanista.constants'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly iframeId = 'lanista-helper'
  readonly normalHeight: '64px'
  readonly expandedHeight: '256px'

  expanded = false

  lanistaTab: chrome.tabs.Tab | undefined

  iframe: HTMLIFrameElement | undefined

  constructor(
    private _tabService: TabService,
    private _scriptService: ScriptService,
  ) {}

  ngOnInit(): void {
    this._tabService.getLanistaTab().then((lanistaTab) => {
      console.log('lanistaTab: ', lanistaTab)
      this.lanistaTab = lanistaTab
    })
  }

  onOpenClick(): void {
    chrome.tabs.create({ url: LANISTA_BASE_URL })
  }

  async onExpandClick(): Promise<void> {
    await this._scriptService.runFunction(
      (iframeId: string) => {
        console.log('frameId: ', iframeId)
        const existingElement = document.getElementById(
          iframeId,
        ) as HTMLIFrameElement
        if (existingElement) {
          console.log('existingelement: ', existingElement)
          existingElement.style.height = '100%'
          existingElement.style.width = '100%'
        }
      },
      [this.iframeId],
    )
    this.expanded = true
  }

  async onBackgroundClick(): Promise<void> {
    if (this.expanded) {
      await this._scriptService.runFunction(
        (iframeId: string) => {
          console.log('frameId: ', iframeId)
          const existingElement = document.getElementById(
            iframeId,
          ) as HTMLIFrameElement
          if (existingElement) {
            console.log('existingelement: ', existingElement)
            existingElement.style.height = '64px'
            existingElement.style.width = '64px'
          }
        },
        [this.iframeId],
      )
      this.expanded = false
    }
  }
}
