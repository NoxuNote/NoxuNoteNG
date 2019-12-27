import { Component, OnInit } from '@angular/core';
import { IoService } from '../../../services';
import { Observable } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

  constructor(private _ioService: IoService) { }

  private _files: Observable<string[]>;

  ngOnInit() {
    this.refreshFiles()
  }

  switchToLocal() {
    this._ioService.setMode(StorageMode.Local)
    this.refreshFiles()

  }
  switchToCloud() {
    this._ioService.setMode(StorageMode.Cloud)
    this.refreshFiles()
  }
  refreshFiles() {
    this._files = this._ioService.listFiles()
  }

}
