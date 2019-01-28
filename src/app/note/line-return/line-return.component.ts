import { Component, OnInit } from '@angular/core';
import { INoteStructureElement } from '../INoteStructureElement';

@Component({
  selector: 'app-line-return',
  templateUrl: './line-return.component.html',
  styleUrls: ['./line-return.component.scss']
})
export class LineReturnComponent implements OnInit, INoteStructureElement {
  rawContent(): string {
    return "\n"
  }

  isEditable: boolean;
  onClick() {
    throw new Error("Method not implemented.");
  }

  constructor() { }

  ngOnInit() {
  }

}
