import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CategoriesService} from "../../shared/services/categories.service";
import {switchMap} from "rxjs/operators";
import {of, takeUntil} from "rxjs";
import {MaterialService} from "../../shared/classes/material.service";
import {Category} from "../../shared/interfaces";
import {DestroySubscription} from "../../shared/helpers/destroy-subscription";
import {response} from "express";


@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.scss']
})
export class CategoriesFormComponent extends DestroySubscription implements OnInit{
  constructor(private route: ActivatedRoute, private router: Router, private categoriesService: CategoriesService) {
    super()
  }

  @ViewChild('input') inputRef!: ElementRef
  isNew = true
  image!: File;
  imagePreview: any
  form!: FormGroup;
  category: Category = {
    _id: '',
    imageSrc: '',
    user: '',
    name: ''
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    // this.form.disable()

    this.route.params
      .pipe(
        switchMap(
          (params: Params)=> {
            if(params['id']) {
              this.isNew = false
              return this.categoriesService.getById(params['id'])
            }
            return  of(null)
          }
        )
      ).subscribe(
        category => {
          if(category) {
            this.category = category
            this.form.patchValue({
              name: category.name
            })
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs()
          }

          this.form.enable()
        },
        error => MaterialService.toast(error.error.message)
      )
  }

  triggerClick() {
    this.inputRef.nativeElement.click()
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]
    this.image = file

    let reader = new FileReader()

    reader.onload = () => {
      this.imagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$
    this.form.disable()


    if(this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.image)
    } else {
      obs$ = this.categoriesService.update(this.category._id ? this.category._id : '',this.form.value.name, this.image)
    }

    obs$.pipe(takeUntil(this.destroyStream$)).subscribe(
      category => {
        this.category = category;
        MaterialService.toast('Changes Saved')
        this.form.enable()
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

  deleteCategory() {
    const decision = window.confirm(`You really wanna delete category: ${this.category.name}`)
    if (decision && this.category._id) {
      this.categoriesService.delete(this.category._id).pipe(takeUntil(this.destroyStream$)).subscribe(
        response => {
          MaterialService.toast(response.message)
        }, err => {
          MaterialService.toast(err.error.message)
        }, () => {
          this.router.navigate(['/categories'])
        }
      )
    }
  }
}
