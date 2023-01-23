import { Component } from '@angular/core'
import { MeApiService } from './shared/services/me-api.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private _meApiService: MeApiService) {}

  async ngOnInit(): Promise<void> {
    this._meApiService.getMe()
  }
}
