import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrdersService} from "../shared/services/orders.service";
import {takeUntil} from "rxjs";
import {Filter, Order} from "../shared/interfaces";

const STEP = 2

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss']
})
export class HistoryPageComponent extends DestroySubscription implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('tooltip') tooltipRef!: ElementRef;
  tooltip?: MaterialInstance;
  isFilterVisible: boolean = false;
  orders: Order[] = []
  filter: Filter = {}

  loading = false;
  reloading = false;
  noMoreOrders = false

  offset: number = 0;
  limit: number = STEP;

  constructor(private ordersService: OrdersService) {
    super();
  }

  private fetch() {
    this.loading = true

    const params = Object.assign({}, this.filter, {
      offset: this.offset,
      limit: this.limit
    })

    this.ordersService.fetch(params).pipe(takeUntil(this.destroyStream$)).subscribe(orders => {
      this.orders = this.orders.concat(orders);
    }, error => {
      MaterialService.toast(error.error.message)
    }, () => {
      this.noMoreOrders = this.orders.length < STEP
      this.loading = false
      this.reloading = false
    })
  }

  ngAfterViewInit(): void {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef)
  }

  ngOnInit(): void {
    this.reloading = true
    this.fetch()
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.tooltip?.destroy?.()
  }

  loadMore() {
    this.offset += STEP;
    this.fetch()
  }

  applyFilters(filter: Filter) {
    this.orders = [];
    this.offset = 0;
    this.filter = filter;
    this.reloading = true;
    this.fetch()
  }


  isFiltered():boolean {
    return Object.keys(this.filter).length !== 0
  }
}
