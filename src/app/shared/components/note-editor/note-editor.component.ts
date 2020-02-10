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
  @ViewChild('editorJs') el: ElementRef;

  @Input()
  note: string

  /**
   * Editor.js instance
   */
  editor: EditorJS

  constructor() { }

  ngAfterViewInit() {
    this.editor = new EditorJS({
      holder: this.el.nativeElement,
      autofocus: true,
      placeholder: "Entrez du texte",
      tools: {
        header: Header,
        list: List,
      },
      /**
      * onReady callback
      */
      onReady: () => {
        console.log('Editor.js is ready to work!')
      },
      onChange: () => {
        console.log('onChange')
      }
    });
  }

  save() {
    this.editor.save().then(outputData => {
      console.log(outputData);
    }).catch(console.error)
  }

}
