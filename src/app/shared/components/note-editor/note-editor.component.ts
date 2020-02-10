import { Component, OnInit, Input, ViewChild, ViewContainerRef, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { Note } from '../../../types/Note';
import { IoService } from "../../../services/io/io.service";
import { StorageMode } from '../../../services/io/StorageMode';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements AfterViewInit {
  @ViewChild('editorJs') el: ElementRef;

  /**
   * Input note
   */
  @Input()
  note: Note

  /**
   * Emits false when the content is different from saved
   */
  @Output()
  saved: EventEmitter<boolean> = new EventEmitter()

  /**
   * Editor.js instance
   */
  editor: EditorJS

  constructor(private _ioS: IoService) { }

  ngAfterViewInit() {
    this.saved.emit(true)
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
        this.saved.emit(false)
      }
    });
  }

  save() {
    this.editor.save().then(outputData => {
      this._ioS.saveNote(StorageMode.Local, {meta: this.note.meta, content: outputData} as Note).then(()=>{
        this.saved.emit(true)
      })
    }).catch(console.error)
  }

}
