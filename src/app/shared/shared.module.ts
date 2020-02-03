import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent, PlatformComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { BrowserComponent } from './components/browser/browser.component';

import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    PageNotFoundComponent,
    WebviewDirective,
    PlatformComponent,
    BrowserComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    ButtonModule,
    SidebarModule
  ],
  exports: [
    TranslateModule,
    WebviewDirective,
    FormsModule,
    PlatformComponent,
    BrowserComponent,
    ButtonModule,
    SidebarModule
  ]
})
export class SharedModule {}
