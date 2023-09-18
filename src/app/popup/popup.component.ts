import { Component, OnInit } from '@angular/core'
import { ROUTES } from '../app-routing.module'

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
})
export class PopupComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  onTestButtonClick(): void {
    chrome.tabs.create({ url: `index.html#${ROUTES.BACKGROUND}` })
  }
}
