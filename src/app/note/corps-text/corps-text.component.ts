import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Text } from '../Text'

@Component({
  selector: 'app-corps-text',
  templateUrl: './corps-text.component.html',
  styleUrls: ['./corps-text.component.scss']
})
export class CorpsTextComponent extends Text implements OnInit {

  @ViewChild('domContent') domContent: ElementRef;

  constructor() { 
    super()
  }

  rawContent(): string {
    return '\n' + this.domContent.nativeElement.innerText;
  }

  ngOnInit() {
  }

}
