import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Folder } from '../../../types/Folder';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customize-folder',
  templateUrl: './customize-folder.component.html',
  styleUrls: ['./customize-folder.component.css']
})
export class CustomizeFolderComponent implements OnInit, AfterViewInit {
  @Input() inputFolder: Folder;

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
    this.validateForm.reset(this.inputFolder)
  }

  ngAfterViewInit() {setImmediate(()=>this.titleInput.nativeElement.focus())}

  /**
   * Destroys the modal
   * @param validateChanges saving changes ?
   */
  destroyModal(validateChanges: boolean = false): void {
    if (validateChanges && this.validateForm.valid) {
      // On renvoie un nouveau dossier avec les donénes modifiées
      let newFolder = Object.assign(new Folder(), this.inputFolder)
      newFolder = Object.assign(newFolder, this.validateForm.getRawValue())
      this.modal.destroy(newFolder);
    } else this.modal.destroy(this.inputFolder);
  }

  /**
   * Calls destroyModal if the form is valid
   */
  trySubmitForm(): void {
    if (this.validateForm.valid) this.destroyModal(true)
  }

}
