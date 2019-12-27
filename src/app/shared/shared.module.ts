import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent, PlatformComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { BrowserComponent } from './components/browser/browser.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, PlatformComponent, BrowserComponent],
  imports: [CommonModule, TranslateModule, FormsModule],
  exports: [TranslateModule, WebviewDirective, FormsModule, PlatformComponent, BrowserComponent]
})
export class SharedModule {}
