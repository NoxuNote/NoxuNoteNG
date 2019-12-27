import { Component, OnInit } from '@angular/core';
import { IoService } from '../../../services';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit {

  constructor(private _ioService: IoService) { }

  ngOnInit() {
  }

}
