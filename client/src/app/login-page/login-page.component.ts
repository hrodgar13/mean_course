import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validator, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {takeUntil} from "rxjs";
import {DestroySubscription} from "../shared/helpers/destroy-subscription";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent extends DestroySubscription implements OnInit{
  form!: FormGroup;

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
    super()
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    })

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        MaterialService.toast('Now you may log in system with your data')
        // Now you may log in system with your data
      } else if(params['accessDenied']) {
        // Auth firstly
        MaterialService.toast('Auth firstly')
      } else if(params['sessionExpired']) {
        // Auth firstly
        MaterialService.toast('Session Expired, please Log in again')
      }
    })
  }


  onSubmit() {
    this.form.disable()

     this.auth.login(this.form.value).pipe(takeUntil(this.destroyStream$)).subscribe(
      () => {
        this.router.navigate(['/overview'])
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }
}
