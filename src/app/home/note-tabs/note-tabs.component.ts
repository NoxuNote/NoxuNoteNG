import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabsManagerService } from '../../services/tabsManager/tabs-manager.service';
import { NoteTab } from '../../services/tabsManager/NoteTab';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-note-tabs',
  templateUrl: './note-tabs.component.html',
  styleUrls: ['./note-tabs.component.scss']
})
export class NoteTabsComponent implements OnInit, OnDestroy {

  constructor(private _tmS: TabsManagerService) { }

  tabs$: Observable<NoteTab[]>

  private subs: Subscription[] = []

  ngOnInit() {
    this.tabs$ = this._tmS.openedNotesObservable
  }
  ngOnDestroy() {
    this.subs.forEach(s=>s.unsubscribe())
  }

}
