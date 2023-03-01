import {Component, OnInit} from '@angular/core';
import {CategoriesService} from "../shared/services/categories.service";
import {Observable} from "rxjs";
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {Category} from "../shared/interfaces";

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss']
})
export class CategoriesPageComponent extends DestroySubscription implements OnInit{

  categories$!: Observable<Category[]>

  constructor(private categoriesService: CategoriesService) {
    super()
  }

  ngOnInit(): void {
    this.categories$ = this.categoriesService.fetch()
  }
}