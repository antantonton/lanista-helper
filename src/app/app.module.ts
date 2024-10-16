import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ReactiveFormsModule } from '@angular/forms'
import { AppComponent } from './app.component'
import { ChallengeComponent } from './challenge/challenge.component'
import { PercentageLabelPipe } from './shared/pipes/percentage-label.pipe'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { AccordionModule } from 'primeng/accordion'
import { CheckboxModule } from 'primeng/checkbox'
import { InputNumberModule } from 'primeng/inputnumber'
import { ButtonModule } from 'primeng/button'
import { DropdownModule } from 'primeng/dropdown'
import { TitleCasePipe } from '@angular/common'
import { DividerModule } from 'primeng/divider'
import { ProgressSpinnerModule } from 'primeng/progressspinner'

@NgModule({
  declarations: [AppComponent, ChallengeComponent, PercentageLabelPipe],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    // PrimeNG
    AccordionModule,
    CheckboxModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    DividerModule,
    ProgressSpinnerModule,
  ],

  providers: [provideAnimationsAsync(), TitleCasePipe, PercentageLabelPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
