import { Component, OnInit, Input, ViewChild, ViewContainerRef, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
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

  constructor(private rd: Renderer2) { }

  ngAfterViewInit() {
    console.log(this.rd); 
    const editor = new EditorJS({
      /**
       * Id of Element that should contain Editor instance
       */
      holder: this.el.nativeElement,
        /** 
       * Available Tools list. 
       * Pass Tool's class or Settings object for each Tool you want to use 
       */ 
      tools: { 
        header: Header, 
        list: List,
        // image: SimpleImage
      }, 
      
    });
  }

}
