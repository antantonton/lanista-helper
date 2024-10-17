import { Component, inject } from '@angular/core'
import { TabService } from './shared/services/tab.service'
import { LANISTA_BASE_URL } from './shared/constants/lanista.constants'
import { ChallengeComponent } from './challenge/challenge.component'
import { ButtonModule } from 'primeng/button'
import { CommonModule } from '@angular/common'
import { OverlayService } from './shared/services/overlay.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [CommonModule, ChallengeComponent, ButtonModule],
})
export class AppComponent {
  private readonly _overlayService = inject(OverlayService)
  lanistaTab: chrome.tabs.Tab | undefined

  constructor(private _tabService: TabService) {}

  ngOnInit(): void {
    this._tabService.getLanistaTab().then(async (lanistaTab) => {
      this.lanistaTab = lanistaTab
    })
    this._overlayService.openOverlay()
  }

  onOpenClick(): void {
    chrome.tabs.create({ url: LANISTA_BASE_URL })
  }
}
