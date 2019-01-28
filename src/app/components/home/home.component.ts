import { Component, OnInit } from '@angular/core';
import { NoteEditorComponent } from '../note-editor/note-editor.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  onglet1: NoteEditorComponent;

  constructor() { }

  ngOnInit() {
  }

}
