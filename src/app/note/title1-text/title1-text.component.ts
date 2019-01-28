import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Text } from '../Text'

@Component({
  selector: 'app-title1-text',
  templateUrl: './title1-text.component.html',
  styleUrls: ['./title1-text.component.scss']
})
export class Title1TextComponent extends Text implements OnInit {

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
