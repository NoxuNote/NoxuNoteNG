import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, NgZone, ɵConsole } from '@angular/core';

@Component({
  selector: 'app-math-input',
  templateUrl: './math-input.component.html',
  styleUrls: ['./math-input.component.scss']
})
export class MathInputComponent {
  @ViewChild('rawInput') rawInput: ElementRef;

  @Input() rawFormula: string  = "";
  @Output() rawFormulaChange   = new EventEmitter<string>();

  @Input() notchOnLeft: boolean = false;
  
  @Output() validate    = new EventEmitter<void>();
  @Output() close       = new EventEmitter<void>();

  constructor(private _ngZone: NgZone) {}

  focus() {
    // can't focus() an element that is still hidden
    // See https://stackoverflow.com/questions/35752237/angular-2-focus-doesnt-work-if-i-dont-use-timeout
    this._ngZone.runOutsideAngular(() => { 
      setTimeout(() => (<HTMLInputElement> this.rawInput.nativeElement).focus());
    });
  }

}
