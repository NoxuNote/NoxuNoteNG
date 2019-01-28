import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentRef,
  ComponentFactory,
  ElementRef,
  OnInit
} from '@angular/core';
import { Note } from '../../note/Note'
import { INoteStructureElement } from '../../note/INoteStructureElement'

import { CorpsTextComponent } from '../../note/corps-text/corps-text.component'
import { Title1TextComponent } from '../../note/title1-text/title1-text.component'
import { Type } from '@angular/compiler/src/output/output_ast';
import { EventEmitter } from 'events';


@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements OnInit {

  // Point d'injection des composants de la note
  @ViewChild('notecontainer', { read: ViewContainerRef }) entry: ViewContainerRef

  // Contenu de la note
  public note: Note;

  private _noteComponentsReferences: Array<ComponentRef<INoteStructureElement>> = new Array();

  constructor(private resolver: ComponentFactoryResolver) { }

  ngOnInit() {
    // Instanciation d'une note contenant un texte simple
    this.note = new Note()
    this.renderNote()
  }

  renderNote() {
    this.entry.clear()
    this._noteComponentsReferences = new Array()
    this.note.rawNote.split("\n").forEach((rawLine)=>{
      if (rawLine.substr(0, 1) == '#') {
        const factory = this.resolver.resolveComponentFactory(Title1TextComponent)
        const componentRef = this.entry.createComponent(factory)
        componentRef.instance.setContent(rawLine)
        this._noteComponentsReferences.push(componentRef);
      } else {
        const factory = this.resolver.resolveComponentFactory(CorpsTextComponent)
        const componentRef = this.entry.createComponent(factory)
        componentRef.instance.setContent(rawLine)
        this._noteComponentsReferences.push(componentRef)
      }
    })
  }

  rawNote(): string {
    let rawNote: string = ""
    this._noteComponentsReferences.forEach((component)=> {
      rawNote += component.instance.rawContent()
    })
    return rawNote;
  }

  triggerEdit(event: EventEmitter) {
    console.log(this.rawNote());
    this.note.rawNote = this.rawNote()
    this.renderNote()
  }

}
