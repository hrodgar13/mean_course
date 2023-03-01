import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Router} from "@angular/router";

@Injectable()
export class TokenInterceptor implements HttpInterceptor{
  constructor(private auth: AuthService, private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.auth.isAuthenticated()) {
      req = req.clone({
        setHeaders: {
          Authorization: this.auth.getToken() || ''
        }
      })
    }
     return next.handle(req).pipe(
       catchError(
         (error: HttpErrorResponse) => this.handleAuthError(error)
       )
     )
  }

  private handleAuthError (err: HttpErrorResponse): Observable<any> {
    if(err.status === 401) {
      this.router.navigate(['/login'],{
        queryParams: {
          sessionExpired: true
        }
      })
    }

    return throwError(err)
  }
}
