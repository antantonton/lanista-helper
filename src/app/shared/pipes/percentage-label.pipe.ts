import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'percentageLabel',
  standalone: true,
})
export class PercentageLabelPipe implements PipeTransform {
  transform(percentage: number, maxHp: number): string {
    return `${percentage * 100}% (~${(maxHp * percentage).toFixed(0)} KP)`
  }
}
