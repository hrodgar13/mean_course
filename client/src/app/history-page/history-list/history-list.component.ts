import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {Order} from "../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../shared/classes/material.service";

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.scss']
})
export class HistoryListComponent implements OnDestroy, AfterViewInit{
  @ViewChild('modal') modalRef!: ElementRef;

  selectedOrder!: Order
  modal!: MaterialInstance

  @Input() orders: Order[] = []

  computePrice(order: Order): number {
    return order.list.reduce((total, item)=> {
      return total += item.quantity * item.cost
    }, 0)
  }

  selectOrder(order: Order) {
    this.modal = MaterialService.initModal(this.modalRef)
    this.selectedOrder = order
    this.modal.open?.()
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    // this.modal.destroy?.()
  }

  closeModal() {
    this.modal.close?.()
  }
}
