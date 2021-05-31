import { Component, OnInit, OnDestroy } from '@angular/core';
import { TabsManagerService } from '../../services/tabsManager/tabs-manager.service';
import { NoteTab } from '../../services/tabsManager/NoteTab';
import { merge, Subscription } from 'rxjs';
import { BrowserService } from '../../services';

@Component({
  selector: 'app-note-tabs',
  templateUrl: './note-tabs.component.html',
  styleUrls: ['./note-tabs.component.scss']
})
export class NoteTabsComponent implements OnInit, OnDestroy {

  // private cd: ChangeDetectorRef
  constructor(private _tmS: TabsManagerService, private _browserService: BrowserService) { }

  tabs: NoteTab[] = []

  selectedIndex = 0;
  /**
   * Stores every subscriptions in this component, these will be unsubscribed on destroy
   */
  private subs: Subscription[] = []

  ngOnInit() {
    this.subs.push(
      this._tmS.openedNotesObservable.subscribe(noteTabs => {
        const ancientTabsCount = this.tabs.length
        this.tabs = noteTabs
        // S'il s'agit d'un nouvel onglet, focus dessus
        if (this.tabs.length > ancientTabsCount) this.selectedIndex = this.tabs.length - 1
      }),
      merge(...[
        this._tmS.alreadyOpenedObservable,
        this._tmS.editedNoteObservable
      ])
      .subscribe(noteTab => {
        this.selectedIndex = this.tabs.findIndex(tab=>tab === noteTab)
      })
    )
    this._tmS.readLocalStorage()
  }
  ngOnDestroy() {
    this.subs.forEach(s=>s.unsubscribe())
  }
  handleClose(tab: NoteTab) {
    this._tmS.close(tab.noteUUID)
    // Call Angular to check for updates in children to avoid ExpressionChangedAfterItHasBeenCheckedError
    // this.cd.detectChanges() 
  }
  tabChange($event) {
    this._tmS.informTabChange(this.tabs[$event.index]?.noteUUID);
  }

  askCreateFolder() {
    this._browserService.askCreateFolder()
  }

  askCreateNote() {
    this._browserService.askCreateNote()
  }

}
