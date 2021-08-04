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
            const data = error.error
            let backendMessage = data.error?.message || JSON.stringify(error.error)
            this.messageService.error(
                `${error.message}<br><b>${backendMessage}</b>`, 
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