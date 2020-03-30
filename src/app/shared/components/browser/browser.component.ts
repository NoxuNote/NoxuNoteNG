import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { IoService } from '../../../services';
import { Subscription, Observable, timer } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzDropdownMenuComponent, NzContextMenuService, NzTreeComponent } from 'ng-zorro-antd';
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
  @ViewChild('foldermenu') folderMenu: NzDropdownMenuComponent;
  @ViewChild('notemenu') noteMenu: NzDropdownMenuComponent;
  @ViewChild('rootmenu') rootMenu: NzDropdownMenuComponent;
  @ViewChild('nzTree') nzTree: NzTreeComponent;
  
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
    this.subscribtions.push(this._ioS.getListNotes(this._source).pipe(debounce(() => timer(20))).subscribe(metas => {
      this._notes = metas
      this.generateTree()
    }))
    this.updateNoteList()
    // Automatically fetch folder list
    this.subscribtions.push(this._ioS.getListFolders(this._source).subscribe(folders => {
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
    // Mémoriser quels dossiers étaient ouverts
    let openedFoldersId: string[] = []
    if (this.nzTree) {
      openedFoldersId = this.nzTree.getExpandedNodeList().map(node=>node.key)
      console.debug("Mémorisation des dossiers ouverts : ", openedFoldersId);
    }
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
        // Si le noeud était ouvert, on le réouvre
        noRootNode.expanded = openedFoldersId.includes(noRootNode.key);
        localRoot.children.push(noRootNode)
        // Insertion de ses enfants
        // folders.splice(index, 1) // element is treated, remove it from list
        TreeTools.insertChildren(noRootNode, f, this._folders, this._notes, openedFoldersId)
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
    this._ioS.refreshListNotes(this._source)
  }
  public updateFolderList() {
    this._ioS.refreshListFolders(this._source)
  }

  /**
   * Expand a folder on double click
   */
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
   * Triggered when user left-clicks on a tree node
   * @param data Tree Node event emitter
   */
  activeNode(data: NzFormatEmitEvent): void {
    // Close contextual menu
    this._nzContextMenuService.close()
    // Select element
    this.selectNode(data)
    // Si il s'agit d'une note ou l'ouvre
    if (!data.node.origin.isFolder && !data.node.origin.isRoot) {
      this.openNote(data.node.key)
    }
  }

  /**
   * Set a node selected
   * @param data Tree Node event emitter
   */
  selectNode(data: NzFormatEmitEvent): void {
    this.selectedKey = data.node.key
  }

  /**
   * Calls service to open context menu
   * @param $event click event
   * @param node Clicked tree node
   */
  contextMenu($event: MouseEvent, node: NzTreeNode): void {
    // this._nzContextMenuService.create($event, menu);
    if (node.origin.isFolder) {
      if (node.origin.isRoot) {
        this._nzContextMenuService.create($event, this.rootMenu)
      } else {
        this._nzContextMenuService.create($event, this.folderMenu)
      }
    } else {
      this._nzContextMenuService.create($event, this.noteMenu)
    }
  }

  /**
   * Calls tabsManagerService to open a note
   * @param uuid Note uuid
   */
  openNote(uuid: string) {
    this._tmS.open(uuid);
  }

/***************************************************************************************************
 *                                       CONTEXTUAL MENU                                           *
 ***************************************************************************************************/

  newFolder(atRoot: boolean = false) {
    // Si le dossier sélectionné est fermé, on l'ouvre
    this.nzTree.getSelectedNodeList()[0].setExpanded(true)
    let newFolder = this._ioS.createFolder(StorageMode.Local, "Nouveau dossier", atRoot? undefined : this.selectedKey)
    this.selectedKey = newFolder.uuid
    console.log(newFolder);
  }

  removeFolder() {
    this._ioS.removeFolder(StorageMode.Local, this._folders.find(f=>f.uuid==this.selectedKey))
  }
}
