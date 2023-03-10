import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {MaterialService} from "../../classes/material.service";

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
  styleUrls: ['./site-layout.component.scss']
})
export class SiteLayoutComponent implements AfterViewInit{

  @ViewChild('floating') floatingRef!: ElementRef

  constructor(private auth: AuthService, private router: Router) {
  }

  links = [
    {
      url: '/overview',
      name: 'Обзор'
    },
    {
      url: '/analytics',
      name: 'Аналитика'
    },
    {
      url: '/history',
      name: 'История'
    },
    {
      url: '/order',
      name: 'Добавить заказ'
    },
    {
      url: '/categories',
      name: 'Ассортимент'
    }
  ]

  ngAfterViewInit() {
    if(this.floatingRef) {
      MaterialService.initializeFloatingButton(this.floatingRef)
    }
  }

  logout(event: Event) {
    event.preventDefault()
    this.auth.logout()
    this.router.navigate(['/login'])
  }
}
