import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent, PlatformComponent, BrowserComponent, NoteEditorComponent, MathInputComponent, CustomizeFolderComponent, CustomizeNoteComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/AuthInterceptor';

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
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    /** import ng-zorro-antd root module，you should import NgZorroAntdModule and avoid importing sub modules directly **/
    NzTabsModule,
    NzDropDownModule,
    NzTreeModule,
    NzInputModule,
    NzFormModule,
    NzModalModule,
    NzIconModule
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
    NzTabsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor ,
      multi: true
    }
  ]
})
export class SharedModule {}
