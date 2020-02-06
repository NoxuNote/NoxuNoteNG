import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TabsManagerService } from '../../services/tabsManager/tabs-manager.service';
import { NoteTab } from '../../services/tabsManager/NoteTab';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-note-tabs',
  templateUrl: './note-tabs.component.html',
  styleUrls: ['./note-tabs.component.scss']
})
export class NoteTabsComponent implements OnInit, OnDestroy {

  constructor(private _tmS: TabsManagerService, private cd: ChangeDetectorRef) { }

  tabs: NoteTab[]

  /**
   * Stores every subscriptions in this component, these will be unsubscribed on destroy
   */
  private subs: Subscription[] = []

  ngOnInit() {
    this.subs.push(this._tmS.openedNotesObservable.subscribe(noteTabs => {
      this.tabs = noteTabs
    }))
  }
  ngOnDestroy() {
    this.subs.forEach(s=>s.unsubscribe())
  }
  handleClose(tab: any) {
    this._tmS.close(this.tabs[tab.index].savedNote.meta.uuid)
    // Call Angular to check for updates in children to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges() 
  }

}
