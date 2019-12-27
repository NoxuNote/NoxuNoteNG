import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'app-platform',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {

  constructor(public es: ElectronService) { }

  ngOnInit() {
  }

}
