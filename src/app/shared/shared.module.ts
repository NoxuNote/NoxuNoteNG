import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent, PlatformComponent, BrowserComponent, NoteEditorComponent, MathInputComponent, CustomizeFolderComponent, CustomizeNoteComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgZorroAntdModule } from "ng-zorro-antd";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { LoginButtonsComponent } from './components/login-buttons/login-buttons.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    PlatformComponent,
    BrowserComponent,
    NoteEditorComponent,
    MathInputComponent,
    CustomizeFolderComponent,
    CustomizeNoteComponent,
    LoginButtonsComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    /** import ng-zorro-antd root module，you should import NgZorroAntdModule and avoid importing sub modules directly **/
    NgZorroAntdModule,
    NzTabsModule,
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    ReactiveFormsModule,
    PlatformComponent,
    BrowserComponent,
    NoteEditorComponent,
    /** import ng-zorro-antd root module，you should import NgZorroAntdModule and avoid importing sub modules directly **/
    NgZorroAntdModule,
    NzTabsModule,
  ]
})
export class SharedModule {}
