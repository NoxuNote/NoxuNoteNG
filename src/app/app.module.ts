import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderBarComponent } from './components/mainView/header-bar/header-bar.component';
import { MenuLeftSaveComponent } from './components/mainView/menu-left-save/menu-left-save.component';
import { LineReturnComponent } from './note/line-return/line-return.component';
import { CorpsTextComponent } from './note/corps-text/corps-text.component';
import { Title1TextComponent } from './note/title1-text/title1-text.component';
import { NoteEditorComponent } from './components/note-editor/note-editor.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    HeaderBarComponent,
    MenuLeftSaveComponent,
    LineReturnComponent,
    CorpsTextComponent,
    Title1TextComponent,
    NoteEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent],
  entryComponents: [
    LineReturnComponent,
    CorpsTextComponent,
    Title1TextComponent,]
})
export class AppModule { }
