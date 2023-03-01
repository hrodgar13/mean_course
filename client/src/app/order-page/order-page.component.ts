import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {takeUntil} from "rxjs";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrderService} from "./order.service";
import {Order, OrderPosition} from "../shared/interfaces";
import {OrdersService} from "../shared/services/orders.service";

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  providers: [OrderService]
})
export class OrderPageComponent extends DestroySubscription implements OnInit, OnDestroy, AfterViewInit{
  @ViewChild('modal') modalRef!: ElementRef
  modal!: MaterialInstance;
  isRoot: boolean = true;
  pending = false

  constructor(public orderService: OrderService, private router: Router, private orders: OrdersService) {
    super();
  }

  ngOnInit(): void {
    this.isRoot = this.router.url === '/order'
    this.router.events.pipe(takeUntil(this.destroyStream$)).subscribe(event => {
      if(event instanceof NavigationEnd) {
        this.isRoot = this.router.url === '/order'
      }
    })
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  open() {
    this.modal?.open?.()
  }

  cancel() {
    this.modal.close?.()
  }

  submit() {
    this.pending = true;
    const order: Order = {
      list: this.orderService.list.map(item => {
        delete item._id
        return item
      })
    }

    this.orders.create(order).pipe(takeUntil(this.destroyStream$)).subscribe(
      newOrder => {
        MaterialService.toast(`Order ${newOrder.order} created`)
        this.orderService.clear()
      }, error => {
        MaterialService.toast(error.error.message)
      },
      () => {
        this.modal.close?.()
        this.pending = false
      }
    )
  }

  removePosition(position: OrderPosition) {
    this.orderService.remove(position)
  }
}
