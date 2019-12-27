import { Injectable } from '@angular/core';
import { DiskOperations } from './localDrivers/DiskOperations';

@Injectable({
  providedIn: 'root'
})
export class IoService {

  constructor() { }

  listFiles(): String[] {
    return DiskOperations.listFiles();
  }

}
