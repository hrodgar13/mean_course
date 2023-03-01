import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {takeUntil} from "rxjs";
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {Chart, ChartConfiguration, registerables} from 'chart.js'
Chart.register(...registerables)
import {AnalyticsPage} from "../shared/interfaces";

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss']
})
export class AnalyticsPageComponent extends DestroySubscription implements AfterViewInit{
  @ViewChild('stonks') stonksRef!: ElementRef
  @ViewChild('order') orderRef!: ElementRef

  average!: number
  pending = true

  constructor(private service: AnalyticsService) {
    super()
  }

  ngAfterViewInit(): void {
    const stonkConfig: any = {
      label: 'Stonks',
      color: 'rgb(255, 99, 132)',
    }

    const orderConfig: any = {
      label: 'ORders',
      color: 'rgb(54, 162, 235)',
    }

    this.service.getAnalytics().pipe(takeUntil(this.destroyStream$)).subscribe((data: AnalyticsPage) => {
      this.average = data.average

      stonkConfig.labels = data.chart.map(item => item.label);
      stonkConfig.data = data.chart.map(item => item.stonk);

      orderConfig.labels = data.chart.map(item => item.label);
      orderConfig.data = data.chart.map(item => item.order);

      // ***** Stonks *****

      // stonkConfig.labels.push('08.05.2018')
      // stonkConfig.labels.push('09.05.2018')
      // stonkConfig.data.push(1500)
      // stonkConfig.data.push(1200)

      // ***** /Stonks *****

      // ***** Order *****

      // orderConfig.labels.push('08.05.2018')
      // orderConfig.labels.push('09.05.2018')
      // orderConfig.data.push(1)
      // orderConfig.data.push(3)


      // ***** /Order *****

      const stonkContext = this.stonksRef.nativeElement.getContext('2d')
      const orderContext = this.orderRef.nativeElement.getContext('2d')

      stonkContext.canvas.height = '300px'
      orderContext.canvas.height = '300px'

      new Chart(stonkContext, createChartConfig(stonkConfig))

      new Chart(orderContext, createChartConfig(orderConfig))

      this.pending = false
    })
  }

}

function createChartConfig({labels, data, label, color} : {labels: any, data: any, label: any, color: any}): ChartConfiguration {
    return {
      type: 'line',
      options: {
        responsive: true,
      },
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            fill: false
          }
        ]
      }
    }
}
