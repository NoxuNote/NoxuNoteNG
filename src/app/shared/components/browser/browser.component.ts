import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { IoService } from '../../../services';
import { Subscription, Observable, timer } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzDropdownMenuComponent, NzContextMenuService } from 'ng-zorro-antd';
import { Folder } from '../../../types/Folder';
import { ThrowStmt } from '@angular/compiler';
import { debounce } from 'rxjs/operators';
import { TreeTools } from './TreeTools';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent implements OnInit, OnDestroy {
  
  /**
   * Noeuds de l'arbre de navigation
   */
  nodes: NzTreeNodeOptions[] = [];
  /**
   * Noeud actif
   */
  selectedKey: string

  constructor(private _ioS: IoService, private _tmS: TabsManagerService, private _nzContextMenuService: NzContextMenuService) { }

  // Source is local files by default but can be overriden by
  // Setting (source) as input
   _source: StorageMode = StorageMode.Local
  // Catch source input change
  @Input() set source(s: StorageMode) {
    this._source = s
    this.updateNoteList()
  }

  /**
   * Stores fetched notes metadata
   */
  _notes: NoteMetadata[] = []

  /**
   * Stores fetched folders
   */
  _folders: Folder[] = []

  subscribtions: Subscription[] = []

  ngOnInit() {
    // Automatically fetch noteList with debounce to prevent generateTree overcalls
    this.subscribtions.push(this._ioS.getNotes(this._source).pipe(debounce(() => timer(20))).subscribe(metas => {
      this._notes = metas
      this.generateTree()
    }))
    this.updateNoteList()
    // Automatically fetch folder list
    this.subscribtions.push(this._ioS.getFolders(this._source).subscribe(folders => {
      this._folders = folders
      this.generateTree()
    }))
    this.updateFolderList()
    // When the tab manager says the user has changed note tab, update the selected one
    this.subscribtions.push(this._tmS._editedNoteUuid.subscribe(uuid => {
      console.debug("selecting " + uuid)
      this.selectedKey = uuid
    }))
  }

  /**
   * Génère les noeuds d'affichage des dossiers
   * @param folders Liste des dossiers
   */
  private generateTree() {
    // Création d'un noeud racine
    let localRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Ce PC", "local_root");
    let cloudRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Cloud", "cloud_root");
    // Nettoyer l'arbre
    this.nodes = [localRoot, cloudRoot]
    // Pour chaque élément sans racine
    this._folders.forEach((f,index)=>{
      if (f.parentFolder == undefined) {
        // Création et insertion du noeud
        let noRootNode = TreeTools.createFolderNode(f)
        localRoot.children.push(noRootNode)
        // Insertion de ses enfants
        // folders.splice(index, 1) // element is treated, remove it from list
        TreeTools.insertChildren(noRootNode, f, this._folders, this._notes)
      }
    })
    console.debug(this.nodes)
  }
  
  ngOnDestroy() {
    this.subscribtions.forEach(s=>s.unsubscribe())
  }
  
  /**
   * Calls the IoService to re-fetch notes metadatas from source
   */
  public updateNoteList() {
    this._ioS.updateNotes(this._source)
  }
  public updateFolderList() {
    this._ioS.updateFolders(this._source)
  }

  nzEvent(event: NzFormatEmitEvent): void {
    console.log(event);
  }

  openFolder(data: NzTreeNode | Required<NzFormatEmitEvent>): void {
    // do something if u want
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  /**
   * Lors du clic sur un élément
   */
  activeNode(data: NzFormatEmitEvent): void {
    this.selectedKey = data.node.key;
    // Si il s'agit d'une note ou l'ouvre
    if (!data.node.origin.isFolder && !data.node.origin.isRoot) {
      this.openNote(data.node.key)
    }
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this._nzContextMenuService.create($event, menu);
  }

  selectDropdown(): void {
    // do something
  }

  openNote(uuid: string) {
    this._tmS.open(uuid);
  }

}
