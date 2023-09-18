import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BackgroundComponent } from './background/background.component'
import { ChallengeComponent } from './challenge/challenge.component'
import { PopupComponent } from './popup/popup.component'

export const ROUTES = {
  POPUP: '',
  BACKGROUND: 'background',
}

const routes: Routes = [
  { path: ROUTES.POPUP, component: PopupComponent },
  { path: ROUTES.BACKGROUND, component: BackgroundComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
