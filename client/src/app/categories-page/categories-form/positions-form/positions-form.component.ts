import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionsService} from "../../../shared/services/postions.service";
import {takeUntil} from "rxjs";
import {DestroySubscription} from "../../../shared/helpers/destroy-subscription";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {response} from "express";

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss']
})
export class PositionsFormComponent extends DestroySubscription implements OnInit, AfterViewInit, OnDestroy{
  @ViewChild('modal') modalRef!: ElementRef;
  @Input('categoryId') categoryId?: string
  positions: Position[] = [];
  loading = false
  positionId: string | null = null;
  modal?: MaterialInstance;
  form: FormGroup = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    cost: new FormControl(null, [Validators.required, Validators.min(1)])
  });

  constructor(private positionsService: PositionsService) {
    super()
  }

  ngOnInit(): void {
    this.loading = true
    this.positionsService.fetch(this.categoryId).pipe(takeUntil(this.destroyStream$)).subscribe(positions => {
      this.positions = positions
      this.loading = false
    })
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if(this.modal !== undefined) {
      this.modal.destroy?.()
    }
  }


  onSelectPosition(position: Position) {
    this.positionId = position._id ? position._id : null
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })

    this.modal?.open?.()
    MaterialService.updateTextInputs();
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation()
    const decision = window.confirm(`Delete position ${position.name}?`)

    if (decision) {
      this.positionsService.delete(position).pipe(takeUntil(this.destroyStream$)).subscribe(
        response => {
          const idx = this.positions.findIndex( p => p._id === position._id)
          this.positions.splice(idx, 1)
          MaterialService.toast(response.message)
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }

  onAddPosition() {
    this.positionId = null
    this.form.reset({
      name: null,
      cost: 1
    })
    this.modal?.open?.()
  }

  onCancel() {
    this.modal?.close?.()
  }

  onSubmit() {
    const position: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId || ''
    }

    if(this.positionId) {
      console.log('me')
      position._id = this.positionId
      this.positionsService.update(position).pipe(takeUntil(this.destroyStream$)).subscribe(
        position => {
          MaterialService.toast('Position Updated')
        },
        error => {
          this.form.enable()
          MaterialService.toast(error.error.message)
        },
        this.completed
      )
    } else {
      this.positionsService.create(position).pipe(takeUntil(this.destroyStream$)).subscribe(
        position => {
          MaterialService.toast('Position Created')
          this.positions.push(position)
        },
        error => {
          this.form.enable()
          MaterialService.toast(error.error.message)
        },
        this.completed
      )
    }
  }
  private completed() {
    this.modal?.close?.()
    this.form.reset({name: '', cost: 1})
  }
}
