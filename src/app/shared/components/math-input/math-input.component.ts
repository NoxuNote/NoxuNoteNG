import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-math-input',
  templateUrl: './math-input.component.html',
  styleUrls: ['./math-input.component.scss']
})
export class MathInputComponent {

  @Input() rawFormulae: string  = "";
  @Output() rawFormulaeChange   = new EventEmitter<string>();

  @Input() notchOnLeft: boolean = false;
  
  @Output() validate    = new EventEmitter<void>();
  @Output() close       = new EventEmitter<void>();

}
