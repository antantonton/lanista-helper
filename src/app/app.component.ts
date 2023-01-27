import { Component } from '@angular/core'
import { TabService } from './shared/services/tab.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private _tabService: TabService) {}

  ngOnInit(): void {
    this._tabService.getLanistaTab().then((lanistaTab) => {
      console.log('lanistaTab: ', lanistaTab)
    })
  }
}
