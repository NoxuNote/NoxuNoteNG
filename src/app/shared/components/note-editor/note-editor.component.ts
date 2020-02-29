import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import List from './customTools/list';
import Paragraph from "./customTools/paragraph";
import Header from './customTools/header';
import { Note } from '../../../types/Note';
import { IoService, StorageMode, MathjaxService } from "../../../services";
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from "rxjs/operators";

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorJs') el: ElementRef;

  /**
   * Input note
   */
  @Input()
  note: Note

  /**
   * Editor.js instance
   */
  editor: EditorJS

  /**
   * Emits a new null value when the user changes the note content,
   * Use with a debounceTime() pipe to avoid API overcalls
   */
  onChangeSubject: Subject<void> = new Subject<void>();

  /**
   * Component subject subscriptions
   */
  subscriptions: Subscription[] = []

  /**
   * Turns to false when the editor is not in sync with data saved
   */
  changesAreSaved: boolean = true

  constructor(private _ioS: IoService, private _mjS: MathjaxService) { }

  ngAfterViewInit() {
    this.editor = new EditorJS({
      holder: this.el.nativeElement,
      autofocus: true,
      data: this.note.content as any,
      placeholder: "Entrez du texte",
      tools: {
        paragraph: Paragraph,
        header: Header,
        list: List,
      },
      /**
      * onReady callback
      */
      onReady: () => {
        console.log('Editor.js is ready to work!')
        this.typeset()
        console.log(Paragraph)
      },
      onChange: () => {
        this.onChangeSubject.next()
        this.changesAreSaved = false
      }
    });
    // Once user hasn't changed the note for 3 seconds, save 
    this.subscriptions.push(
      this.onChangeSubject.pipe(debounceTime(3000)).subscribe(() => this.save())
    )
  }

  ngOnDestroy() {
    this.subscriptions.map(s => s.unsubscribe())
    if (!this.changesAreSaved) this.save().then(() => this.editor.destroy())
    else this.editor.destroy()
  }

  /**
   * Asks asynchronously EditorJS to generate a JSON representation of the note
   * Asks asynchronously the IOService to save this representation
   */
  async save() {
    console.debug(`[AUTOMATIC SAVE] Automatic note saving ... (${this.note.meta.title})`);
    let outputData = await this.editor.save()
    await this._ioS.saveNote(StorageMode.Local, { meta: this.note.meta, content: outputData } as Note)
    console.debug(`[AUTOMATIC SAVE] done. (${this.note.meta.title})`)
    this.changesAreSaved = true
  }

  insertFormulae() {
    const selection = this.saveSelection()
    this.insertNodeAtCursor(document.createTextNode('coucou'))
    this.restoreSelection(selection)
  }

  saveSelection() {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    }
    return null;
  }

  restoreSelection(range) {
    if (range) {
      if (window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  /**
   * UNUSED
   */
  async popupMath() {
    const selection = this.saveSelection()
    // const node = await this._mjS.tex2chtml('\\sqrt{x^2+1}', this.testEl.nativeElement)
    // setTimeout(() => {
    //   console.log(node);
    //   // (<Element> this.testEl.nativeElement).appendChild(node)
    //   this.insertNodeAtCursor(node)
    //   this._mjS.clearAndUpdate()
    // }, 1000);
  }

  /**
   * Render maths
   * Transforms every : $ \alpha $ 
   * To <span contenteditable="false">
   *      <span class="hidden">|RAW| \alpha |/RAW|</span>
   *      <span class="hidden">|OUTPUT|</span><mjx-container>...</mjx-container><span class="hidden">|/OUTPUT|</span>
   *    </span>
   */
  typeset() {
    const count = this.editor.blocks.getBlocksCount()
    // Wrap every $ \alpha $ into a span containing raw "|RAW| \alpha |/RAW|" and "|OUTPUT|$ \alpha $|/OUTPUT|" <- this one will be transformed 
    for (let i = 0; i < count; i++) {
      const block = this.editor.blocks.getBlockByIndex(i)
      let editableElement = block.querySelector('[contenteditable="true"]')
      editableElement = this._mjS.wrapBeforeTypeset(editableElement)
    }
    // Ask Mathjax to transform $ \alpha $ to CHTML
    this._mjS.typeset()
  }

  /**
   * UNUSED
   * @param node 
   */
  insertNodeAtCursor(node: Node) {
    // const block = this.editor.blocks.getBlockByIndex(this.editor.blocks.getCurrentBlockIndex())
    // const editableElement = block.querySelector('[contenteditable="true"]')
    let sel: Selection, range: Range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(node);
      }
    }
  }

}
