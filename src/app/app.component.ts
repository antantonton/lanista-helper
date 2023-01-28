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

  onTestClick = (): void => {
    this.expanded = !this.expanded
    console.log('this.expandedHeight: ', this.expandedHeight)
    let height = this.expanded ? this.expandedHeight : this.normalHeight
    console.log('height: ', height)
    console.log('hej frameId: ', this.iframeId)

    this._scriptService.runFunction(
      (iframeId: string, height: string) => {
        console.log('height: ', height)
        console.log('frameId: ', iframeId)
        const existingElement = document.getElementById(
          iframeId,
        ) as HTMLIFrameElement
        if (existingElement) {
          console.log('existingelement: ', existingElement)

          existingElement.style.height =
            existingElement.contentWindow.document.documentElement
              .scrollHeight + 'px'

          // existingElement.style.height = '256px'
          // existingElement.style.height = h
          // }
        }
      },
      [this.iframeId, '' + height],
    )
  }
}
