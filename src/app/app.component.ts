import { Component } from '@angular/core'
import { TabService } from './shared/services/tab.service'
import { LANISTA_BASE_URL } from './shared/constants/lanista.constants'
import { ROUTES } from './app-routing.module'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  lanistaTab: chrome.tabs.Tab | undefined

  constructor(private _tabService: TabService) {}

  ngOnInit(): void {
    this._tabService.getLanistaTab().then((lanistaTab) => {
      console.log('lanistaTab: ', lanistaTab)
      this.lanistaTab = lanistaTab
    })
  }

  onOpenClick(): void {
    chrome.tabs.create({ url: LANISTA_BASE_URL })
  }
}
