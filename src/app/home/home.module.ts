import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { LeftmenuComponent } from './leftmenu/leftmenu.component';
import { NoteTabsComponent } from './note-tabs/note-tabs.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

@NgModule({
  declarations: [HomeComponent, LeftmenuComponent, NoteTabsComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, NzButtonModule, NzIconModule, NzTabsModule, NzLayoutModule]
})
export class HomeModule {}
