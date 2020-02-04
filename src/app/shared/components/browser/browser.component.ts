import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { IoService } from '../../../services';
import { Subscription } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit, OnDestroy {

  constructor(private _ioS: IoService, private _tmS: TabsManagerService) { }

  // Source is local files by default but can be overriden by
  // Setting (source) as input
   _source: StorageMode = StorageMode.Local
  // Catch source input change
  @Input() set source(s: StorageMode) {
    this._source = s
    this.updateNoteList()
  }

  /**
   * note service update subscription
   */
  private _noteServiceSub: Subscription

  /**
   * Stores displayed notes metadata
   */
   _notes: NoteMetadata[]

  ngOnInit() {
    this._noteServiceSub = this._ioS.getNotes(this._source).subscribe(metas=>this._notes = metas)
    this.updateNoteList()
  }
  ngOnDestroy() {
    this._noteServiceSub.unsubscribe()
  }

  private noteClick(note: NoteMetadata) {
    this._tmS.open(note.uuid)
  }

  /**
   * Calls the IoService to re-fetch notes metadatas from source
   */
  public updateNoteList() {
    this._ioS.updateNotes(this._source)
  }

}
