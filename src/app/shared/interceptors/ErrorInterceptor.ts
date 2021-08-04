import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private messageService: NzMessageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const handleError = (error: HttpErrorResponse) => {
            this.messageService.error(
                `<b>Erreur HTTP</b> ${error.status} ${error.statusText}<br>${error.message}`, 
                {
                    nzDuration: 3000,
                    nzPauseOnHover: true,
                }
            )
            return throwError(error);
        }

        return next.handle(request).pipe(catchError(handleError))

    }
}