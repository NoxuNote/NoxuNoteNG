import { Component, OnInit, EventEmitter} from '@angular/core';
import { ViewsManagerService } from '../../../providers/views-manager.service';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss']
})
export class HeaderBarComponent implements OnInit {

  private _viewsManagerService: ViewsManagerService; 

  constructor(viewsManagerService: ViewsManagerService) { 
    this._viewsManagerService = viewsManagerService;
  }
  
  ngOnInit() {
  }
  
  boutonMenuGaucheOuvrir() {
    this._viewsManagerService.toggleSaveMenu();
  }

}
