import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, ComponentFactoryResolver, EventEmitter } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import Paragraph from "./customTools/paragraph";
import Header from './customTools/header';
import { Note } from '../../../types/Note';
import { IoService, StorageMode, MathjaxService } from "../../../services";
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import { saveCaretPosition, insertNodeAtCursor, getCaretCoordinates } from "../../../types/staticTools"
import { MathInputComponent } from '../math-input/math-input.component';
import { timingSafeEqual } from 'crypto';
import { NzContextMenuService } from 'ng-zorro-antd';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container: ElementRef;
  @ViewChild('editorJs') editorContainer: ElementRef;
  @ViewChild('mathInput') mathInput: MathInputComponent;

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

  /**
   * Currently written raw math formula
   * (injected as input for math-input component)
   */
  math = {
    rawFormula: "",
    notchOnLeft: false,
    shown: false,
    style: {
      top: '0px',
      left: '0px'
    },
    events: {
      validate: () => {
        this.math.shown = false
        this.typeset()
      },
      close: () => {
        this.math.shown = false
        this.typeset()
      },
      rawFormulaChange: ($event) => console.log($event),
      onFormulaClick: (formula) => this.editFormula(formula)
    }
  } 

  /**
   * Stores the current number of blocks
   * Used to determine on a change if a block was added or deleted
   */
  blocksCount: number = 0;

  /**
   * Set to true when the editor will be destroyed
   */
  willClose: boolean = false

  constructor(private _ioS: IoService, private _mjS: MathjaxService, private _nzContextMenuService: NzContextMenuService) { }

  ngAfterViewInit() {
    this.editor = new EditorJS({
      holder: this.editorContainer.nativeElement,
      autofocus: false,
      data: this.note.content as any,
      placeholder: "Cliquez ici et commencer à vous exprimer !",
      tools: {
        paragraph: Paragraph,
        header: Header
      },
      /**
      * onReady callback
      */
      onReady: () => {
        this.typeset()
        this.blocksCount = this.editor.blocks.getBlocksCount()
        this.editor.on('click', (data)=>console.log(data))
        // Hide the math input when the editor is clicked
        this.editor.listeners.on(this.editorContainer.nativeElement, 'mousedown', ($event: MouseEvent) => {
          // If the target is not a mathjax element and math is shown
          if (!(<Element> $event.target).tagName.includes('MJX') && this.math.shown) {
            this.math.shown = false
          }
          // If a contextual menu is open, close it
          this._nzContextMenuService.close()
        })
      },
      onChange: () => this.onChange()
    });
    // Once user hasn't changed the note for 3 seconds, save 
    this.subscriptions.push(
      this.onChangeSubject.pipe(debounceTime(3000)).subscribe(() => this.save())
    )
  }

  ngOnDestroy() {
    // // Wait for changes treatment/save before closing editor
    // this.onChange().then(()=> {
      
    // })
    this.willClose = true
    this.subscriptions.map(s => s.unsubscribe())
    if (!this.changesAreSaved) this.save().then(() => this.editor.destroy())
    else this.editor.destroy()
  }


  /**
   * Triggered when editor notices changes
   */
  async onChange() {
    if (!this.willClose) {
      this.onChangeSubject.next()
      this.changesAreSaved = false
      const newBlockCount = this.editor.blocks.getBlocksCount()
      /**
       * When a block is added or merged with the block above
       * the typeset disappears, so we need to check the current edited block every time.
       */
      if (newBlockCount != this.blocksCount) {
        const currentBlock = this.editor.blocks.getBlockByIndex(this.editor.blocks.getCurrentBlockIndex())
        if (this._mjS.testUnwrappedFormula(currentBlock.innerHTML)) {
          const restore = saveCaretPosition(currentBlock)
          await this.typesetBlock(currentBlock)
          restore()
        }
        this.bindOnFormulaClick(currentBlock)
        this.blocksCount = newBlockCount
      }
    }
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


  async insertFormula() {
    // Create an empty wrapper and edit id
    const wrapper = await this._mjS.generateWrapper("", "")    
    insertNodeAtCursor(wrapper)
    this.editFormula(wrapper)
    this.bindOnFormulaClick(wrapper.parentElement)
  }

  /**
   * Ouvre la popup de modification de la formula
   * @param wrapper Element englobant la formule brute et la formule CHTML rendue par MathJax
   */
  editFormula(wrapper: HTMLSpanElement) {   
    const rawFormulaEl = wrapper.querySelector('.rawFormula')
    const outputFormulaEl = wrapper.querySelector('.outputFormula')
    // Bind the new handler to math-input change
    this.math.events.rawFormulaChange = ($event) => {
      rawFormulaEl.innerHTML = $event
      outputFormulaEl.innerHTML = "" // clean output
      this._mjS.tex2chtml($event).then(chtml => { // generate new CHTML and insert it into outputFormula
        outputFormulaEl.appendChild(chtml)
        this._mjS.clearAndUpdate()
      })
    }

    this.math.shown = true
    this.math.rawFormula = rawFormulaEl.innerHTML // reset raw formula
    
    // Get wrapper coordinates and component offset coordinates
    const rect = wrapper.getBoundingClientRect()
    const [x, y] = [rect.left+rect.width/2, wrapper.getBoundingClientRect().top]
    const [xComponentOffset, xComponentSize] = [this.container.nativeElement.getBoundingClientRect().left, this.container.nativeElement.clientWidth]
    // If the screen is too tigh and carret is close to left
    if (xComponentSize < 930 && (x-xComponentOffset) < 150) {
      this.math.notchOnLeft = true
      this.math.style.left = `${Math.round(x) - xComponentOffset - 15}px`
    } else {
      this.math.notchOnLeft = false
      this.math.style.left = `${Math.round(x) - xComponentOffset - 150}px`
    }
    this.math.style.top = `${Math.round(y) - 45}px`
    this.mathInput.focus()
  }

  /**
   * Render maths
   * Typesets ALL BLOCKS : 
   * Transforms every : $ \alpha $ 
   * To <span contenteditable="false" class="formula">
   *      <span class="rawFormula">\alpha</span>
   *      <span class="outputFormula"><mjx-container>...</mjx-container></span>
   *    </span> &nbsp;
   */
  async typeset() {
    const count = this.editor.blocks.getBlocksCount()
    for (let i = 0; i < count; i++) {
      const block = this.editor.blocks.getBlockByIndex(i)
      if (this._mjS.testUnwrappedFormula(block.innerHTML)) this.typesetBlock(block)
    }
    this._mjS.clearAndUpdate()
  }  

  /**
   * Typesets a specific editorjs block
   * @param block An editor.js block
   */
  async typesetBlock(block: HTMLElement) {
    let editableElement = block.querySelector('[contenteditable="true"]')
    editableElement.replaceWith(await this._mjS.wrap(editableElement, true))
    this.bindOnFormulaClick(block)
  }

  /**
   * Re-binds the onClick formula handler on a block
   * @param block Any HTMLElement containing a wrapper
   */
  bindOnFormulaClick(block: HTMLElement) {
    block.querySelectorAll('.formula').forEach((formula: HTMLSpanElement) => {
      formula.onmousedown = () => this.math.events.onFormulaClick(formula)
    })
  }

}
