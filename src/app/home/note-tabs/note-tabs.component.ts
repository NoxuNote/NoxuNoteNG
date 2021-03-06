import { Component, OnInit, OnDestroy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { TabsManagerService } from '../../services/tabsManager/tabs-manager.service';
import { NoteTab } from '../../services/tabsManager/NoteTab';
import { Subscription } from 'rxjs';
import { NzTabComponent } from 'ng-zorro-antd/tabs/public-api';
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
      this._tmS.alreadyOpenedObservable.subscribe(noteTab => {
        // L'utilisateur à probablement demandé au service d'ouvrir une note déjà ouverte
        // Alors on switch vers cet onglet
        this.selectedIndex = this.tabs.findIndex(tab=>tab === noteTab)
      })
    )
  }
  ngOnDestroy() {
    this.subs.forEach(s=>s.unsubscribe())
  }
  handleClose(tab: NoteTab) {
    this._tmS.close(tab.savedNote.meta.uuid)
    // Call Angular to check for updates in children to avoid ExpressionChangedAfterItHasBeenCheckedError
    // this.cd.detectChanges() 
  }
  tabChange($event) {
    this._tmS.informTabChange(this.tabs[$event.index]?.savedNote.meta.uuid);
  }

  askCreateFolder() {
    this._browserService.askCreateFolder()
  }

  askCreateNote() {
    this._browserService.askCreateNote()
  }

}
