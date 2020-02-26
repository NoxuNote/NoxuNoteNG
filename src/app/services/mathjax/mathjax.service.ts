import { Injectable } from '@angular/core';
import { Observer, ReplaySubject, Observable } from 'rxjs';
import { MathContent } from '../../types/MathContent';

declare global {
  interface Window {
    hubReady: Observer<boolean>;
  }
}

/**
 * https://stackoverflow.com/questions/55125544/mathjax-in-angular-6
 */
@Injectable({
  providedIn: 'root'
})
export class MathjaxService {

  private readonly notifier: ReplaySubject<boolean>;

  constructor() {
    this.notifier = new ReplaySubject<boolean>();
    window.hubReady = this.notifier; // as said, bind to window object
  }

  ready(): Observable<boolean> {
    return this.notifier;
  }

  render(element: HTMLElement, math?: MathContent): void {
    if (math) {
      if (math.latex) {
        element.innerText = math.latex;
      } else {
        element.innerHTML = math.mathml;
      }
    }
    console.log("rendering", MathJax);
    
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
    MathJax
  }
}
