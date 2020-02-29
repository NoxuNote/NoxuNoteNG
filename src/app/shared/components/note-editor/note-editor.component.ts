import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, ComponentFactoryResolver, EventEmitter } from '@angular/core';
import EditorJS from '@editorjs/editorjs';
import List from './customTools/list';
import Paragraph from "./customTools/paragraph";
import Header from './customTools/header';
import { Note } from '../../../types/Note';
import { IoService, StorageMode, MathjaxService } from "../../../services";
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from "rxjs/operators";
import { saveCaretPosition, insertNodeAtCursor, getCaretCoordinates } from "../../../types/staticTools"

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container: ElementRef;
  @ViewChild('editorJs') editorContainer: ElementRef;
  @ViewChild('mathInput') mathInput: ElementRef;

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
   * Currently written raw math formulae
   * (injected as input for math-input component)
   */
  math = {
    rawFormulae: "",
    notchOnLeft: false,
    style: {
      display: 'none',
      top: '0px',
      left: '0px'
    },
    events: {
      validate: () => {
        this.math.style.display = 'none'
        this.typeset()
      },
      close: () => {
        this.math.style.display = 'none'
        this.typeset()
      },
      rawFormulaeChange: ($event) => console.log($event),
      onFormulaClick: (formulae) => this.editFormulae(formulae)
    }
  } 

  /**
   * Stores the current number of blocks
   * Used to determine on a change if a block was added or deleted
   */
  blocksCount: number = 0;

  constructor(private _ioS: IoService, private _mjS: MathjaxService, private resolver: ComponentFactoryResolver) { }

  ngAfterViewInit() {
    this.editor = new EditorJS({
      holder: this.editorContainer.nativeElement,
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
      onChange: async () => {
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


  async insertFormulae() {
    // Create an empty wrapper and edit id
    const wrapper = await this._mjS.generateWrapper("", "")    
    insertNodeAtCursor(wrapper)
    this.editFormulae(wrapper)
  }

  /**
   * Ouvre la popup de modification de la formulae
   * @param wrapper Element englobant la formule brute et la formule CHTML rendue par MathJax
   */
  editFormulae(wrapper: HTMLSpanElement) {   
    const rawFormulaeEl = wrapper.querySelector('.rawFormulae')
    const outputFormulaeEl = wrapper.querySelector('.outputFormulae')
    // Bind the new handler to math-input change
    this.math.events.rawFormulaeChange = ($event) => {
      rawFormulaeEl.innerHTML = $event
      outputFormulaeEl.innerHTML = "" // clean output
      this._mjS.tex2chtml($event).then(chtml => { // generate new CHTML and insert it into outputFormulae
        outputFormulaeEl.appendChild(chtml)
        this._mjS.clearAndUpdate()
      })
    }

    this.math.style.display = "block" // Show the math-input component
    this.math.rawFormulae = rawFormulaeEl.innerHTML // reset raw formulae
    
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
  }

  /**
   * Render maths
   * Typesets ALL BLOCKS : 
   * Transforms every : $ \alpha $ 
   * To <span contenteditable="false" class="formulae">
   *      <span class="rawFormulae">\alpha</span>
   *      <span class="outputFormulae"><mjx-container>...</mjx-container></span>
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
   * @param block An editor.js block
   */
  bindOnFormulaClick(block: HTMLElement) {
    block.querySelectorAll('.formulae').forEach((formulae: HTMLSpanElement) => {
      formulae.onmousedown = () => this.math.events.onFormulaClick(formulae)
    })
  }

}
