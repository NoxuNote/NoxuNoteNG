import { Component, OnInit } from '@angular/core';
import { Text } from '../Text'

@Component({
  selector: 'app-corps-text',
  templateUrl: './corps-text.component.html',
  styleUrls: ['./corps-text.component.scss']
})
export class CorpsTextComponent extends Text implements OnInit {

  constructor() { 
    super()
  }

  ngOnInit() {
  }

}
