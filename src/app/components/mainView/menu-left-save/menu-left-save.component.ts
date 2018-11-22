import { Component, OnInit, Input } from '@angular/core';
import { ViewsManagerService } from '../../../providers/views-manager.service';

@Component({
  selector: 'app-menu-left-save',
  templateUrl: './menu-left-save.component.html',
  styleUrls: ['./menu-left-save.component.scss']
})
export class MenuLeftSaveComponent implements OnInit {

  private _isComponentOpened: boolean;
  private _viewsManagerService: ViewsManagerService;

  constructor(viewsManagerService: ViewsManagerService) {
    this._viewsManagerService = viewsManagerService;
  }

  ngOnInit() {
    this._viewsManagerService.isSaveMenuOpenedObservable.subscribe((v:boolean)=>{
      this._isComponentOpened = v;
    });
  }

  close() {
    this._viewsManagerService.closeSaveMenu();
  }

}
