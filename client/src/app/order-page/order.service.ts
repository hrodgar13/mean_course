import {Injectable} from "@angular/core";
import {OrderPosition, Position} from "../shared/interfaces";

@Injectable()
export class OrderService {

  public list: OrderPosition[] = [];
  public price = 0;

  add(position: Position) {
    const orderPosition: OrderPosition = {
      name: position.name,
      cost: position.cost,
      quantity: position.amount || 1,
      _id: position._id
    }

    const candidate = this.list.find(item => item._id === position._id)

    if (candidate) {
      // Change amount
      candidate.quantity += orderPosition.quantity
    } else {
      this.list.push(orderPosition)
    }

    this.computePrice()
  }

  remove(orderPosition: OrderPosition) {
    const idx = this.list.findIndex(p => p._id === orderPosition._id)
    this.list.splice(idx, 1)
    this.computePrice()
  }

  clear() {
    this.list = []
    this.price = 0
  }

  private computePrice() {
    this.price = this.list.reduce((total, item) => {
      return total += item.quantity * item.cost
    }, 0)
  }
}
