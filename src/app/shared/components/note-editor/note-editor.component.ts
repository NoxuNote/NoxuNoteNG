import { Component, OnInit, Input, ViewChild, ViewContainerRef, ElementRef, AfterViewInit } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'; 
import List from '@editorjs/list'; 

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements AfterViewInit {
  @ViewChild('editorJs') el:ElementRef;

  @Input() 
  note: string

  constructor() { }

  ngAfterViewInit() {
    const editor = new EditorJS({
      holder: this.el.nativeElement,
      tools: { 
        header: Header, 
        list: List,
      }, 
      
    });
  }

}
