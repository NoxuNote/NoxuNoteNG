import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd';
import { NoteMetadata } from '../../../types/NoteMetadata';

@Component({
  selector: 'app-customize-note',
  templateUrl: './customize-note.component.html',
  styleUrls: ['./customize-note.component.css']
})
export class CustomizeNoteComponent implements OnInit, AfterViewInit {

  @Input() inputNote: NoteMetadata;

  @ViewChild('title') titleInput: ElementRef;

  validateForm: FormGroup;

  constructor(private modal: NzModalRef, private fb: FormBuilder) {
    this.validateForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.maxLength(30),
        Validators.minLength(1),
      ]],
      description: ['', []]
    })
  }

  ngOnInit() {
    // Update form values after component is initialized
    this.validateForm.reset(this.inputNote)
  }

  ngAfterViewInit() {setImmediate(()=>this.titleInput.nativeElement.focus())}

  /**
   * Destroys the modal
   * @param validateChanges saving changes ?
   */
  destroyModal(validateChanges: boolean = false): void {
    if (validateChanges && this.validateForm.valid) {
      // Affectation des nouvelles valeurs
      Object.assign(this.inputNote, this.validateForm.getRawValue())
    }
    this.modal.destroy(this.inputNote);
  }

  /**
   * Calls destroyModal if the form is valid
   */
  trySubmitForm(): void {
    if (this.validateForm.valid) this.destroyModal(true)
  }

}
