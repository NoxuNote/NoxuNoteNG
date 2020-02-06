import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements OnInit {

  @Input() 
  note: string

  constructor() { }

  ngOnInit() {
  }

}
