import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent, PlatformComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { BrowserComponent } from './components/browser/browser.component';

import { NgZorroAntdModule } from "ng-zorro-antd";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NoteEditorComponent } from './components/note-editor/note-editor.component';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    PlatformComponent,
    BrowserComponent,
    NoteEditorComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    /** import ng-zorro-antd root module，you should import NgZorroAntdModule and avoid importing sub modules directly **/
    NgZorroAntdModule,
    NzTabsModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    PlatformComponent,
    BrowserComponent,
    NoteEditorComponent,
    /** import ng-zorro-antd root module，you should import NgZorroAntdModule and avoid importing sub modules directly **/
    NgZorroAntdModule,
    NzTabsModule
  ]
})
export class SharedModule {}
