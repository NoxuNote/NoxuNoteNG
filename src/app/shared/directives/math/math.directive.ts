import { Directive, OnInit, OnChanges, OnDestroy, Input, ElementRef, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { MathContent } from '../../../types/MathContent';
import { take, takeUntil } from 'rxjs/operators';
import { MathjaxService } from '../../../services';

/**
 * https://stackoverflow.com/questions/55125544/mathjax-in-angular-6
 */
@Directive({
  selector: '[appMath]'
})
export class MathDirective implements OnInit, OnChanges, OnDestroy {
  private alive$ = new Subject<boolean>();

  @Input()
  private appMath: MathContent;
  private readonly _el: HTMLElement;

  constructor(private service: MathjaxService,
              private el: ElementRef) {
    this._el = el.nativeElement as HTMLElement;
  }

  ngOnInit(): void {
    this.service
      .ready()
      .pipe(
        take(1),
        takeUntil(this.alive$)
      ).subscribe(res => {
        this.service.render(this._el, this.appMath);
      });
    }
    
    ngOnChanges(changes: SimpleChanges): void {
      console.log(changes);
      this.service.render(this._el, this.appMath);
      
  }

  ngOnDestroy(): void {
    this.alive$.next(false);
  }
}