import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {takeUntil} from "rxjs";
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent extends DestroySubscription implements OnInit{
  form!: FormGroup

  constructor(private auth: AuthService, private router: Router) {
    super()
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    })
  }

  onSubmit() {
    this.form.disable()
    this.auth.register(this.form.value).pipe(takeUntil(this.destroyStream$)).subscribe(() => {
      this.router.navigate(['/login'], {
        queryParams: {
          registered: true
        }
      })
    }, error => {
      MaterialService.toast(error.error.message)
      this.form.enable()
    })
  }
}
