import { Component, OnInit } from '@angular/core';
import { Text } from '../Text'

@Component({
  selector: 'app-title1-text',
  templateUrl: './title1-text.component.html',
  styleUrls: ['./title1-text.component.scss']
})
export class Title1TextComponent extends Text implements OnInit {

  constructor() { 
    super()
  }

  rawContent(): string {
    return this.content + '\n';
  }

  ngOnInit() {
  }


}
