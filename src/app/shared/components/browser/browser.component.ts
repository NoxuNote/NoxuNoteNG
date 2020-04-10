import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { IoService } from '../../../services';
import { Subscription, Observable, timer } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzDropdownMenuComponent, NzContextMenuService, NzTreeComponent, NzModalService } from 'ng-zorro-antd';
import { Folder } from '../../../types/Folder';
import { ThrowStmt } from '@angular/compiler';
import { debounce } from 'rxjs/operators';
import { TreeTools } from './TreeTools';
import { CustomizeFolderComponent } from '../customize-folder/customize-folder.component';

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

  constructor(private _ioS: IoService, private _tmS: TabsManagerService, private _nzContextMenuService: NzContextMenuService,
    private _modalService: NzModalService) { }

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
    this.subscribtions.push(this._ioS.getListFolders(this._source).pipe(debounce(() => timer(20))).subscribe(folders => {
      console.debug("Dossiers mis à jour dans le browser");
      this._folders = folders
      this.generateTree()
    }))
    this._ioS.refreshListFolders(this._source)
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
    }
    // Création d'un noeud racine
    let localRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Ce PC", "local_root");
    let cloudRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Cloud", "cloud_root");
    // Nettoyer l'arbre
    this.nodes = [localRoot, cloudRoot]
    // Pour chaque élément sans racine
    let folders: Folder[] = [...this._folders] // copie des dossiers
    folders.forEach((f,index)=>{
      console.log('foreach premier', folders.length);
      if (f.parentFolder == undefined) {
        // Création et insertion du noeud
        let noRootNode = TreeTools.createFolderNode(f)
        // Si le noeud était ouvert, on le réouvre
        noRootNode.expanded = openedFoldersId.includes(noRootNode.key);
        localRoot.children.push(noRootNode)
        // Insertion de ses enfants
        // console.log("removed ", folders.splice(index, 1));// element is treated, remove it from list
        TreeTools.insertChildren(noRootNode, f, folders, this._notes, openedFoldersId)
      }
    })
    console.log("dossiers", this._folders);
    
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
    // Si il s'agit d'un dossier, on l'ouvre
    if (data.node.origin.isFolder) {
      this.openFolder(data.node)
    } else {
      // Si il s'agit d'une note ou l'ouvre
      this.openNote(data.node.key)
    }
  }

  /**
   * Set a node selected
   * @param data Tree Node event emitter
   */
  selectNode(data: NzFormatEmitEvent): void {
    console.log("selection de ", data.node)
    this.selectedKey = data.node.key
    console.log(this.nzTree.getSelectedNodeList())
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

  /**
   * Returns the selected folder, undefined otherwise
   */
  getSelectedFolder(): Folder {
    return this._folders.find(f=>f.uuid==this.selectedKey)
  }


/***************************************************************************************************
 *                                       FOLDER MODIFICATION                                       *
 ***************************************************************************************************/

/**
 * Crée un dossier avec pour parent le dossier sélectionné
 * @param atRoot Le dossier crée est il dans un noeud racine
 */
 async newFolder(atRoot: boolean = false) {    
   // Si le dossier sélectionné est fermé, on l'ouvre
   this.nzTree.getSelectedNodeList()[0].isExpanded = true
   let newFolder = this._ioS.createFolder(StorageMode.Local, "Nouveau dossier", atRoot? undefined : this.selectedKey)
   this.selectedKey = newFolder.uuid
   // Sauvegarde des changements
   await this._ioS.saveListFolders(StorageMode.Local)
 }

  /**
   * Supprime le dossier sélectionné
   */
  removeFolder() {
    const f: Folder = this.getSelectedFolder()
    this._modalService.confirm({
      nzTitle: `Êtes-vous sur de vouloir supprimer <b>${f.title}</b> ?`,
      nzContent: 'Tout ce que ce dossier contient sera supprimé de façon permanente.',
      nzOkText: 'Oui',
      nzOkType: 'danger',
      nzOnOk: () => {
        // Removing folder     
        // ATTENTION : On doit passer en paramètre une copie de this._notes et this._folders
        // car durant la suppression récursive, des éléments vont être supprimés de ces arrays
        // et removeFolderRecursive prend en paramètre des tableaux constants.
        this._ioS.removeFolderRecursive(StorageMode.Local, f, [...this._notes], [...this._folders])
        // Saving changes
        this._ioS.saveListFolders(StorageMode.Local)
      },
      nzCancelText: 'Annuler'
    })
  }

  /**
   * Ouvre le menu de modification pour le dossier sélectionné
   */
  editFolder() {
    let f: Folder = this.getSelectedFolder()
    const modal = this._modalService.create({
      nzTitle: `Modifier <b>${f.title}</b>`,
      nzContent: CustomizeFolderComponent,
      nzComponentParams: {
        inputFolder: f
      },
      nzFooter: [
        {
          label: 'Valider',
          onClick: componentInstance => componentInstance.trySubmitForm()
        }
      ]
    })
    modal.afterClose.subscribe( (result: Folder) => {
      if (result) {
        // Updating folder data
        this._ioS.updateFolder(StorageMode.Local, result)
        // Saving changes
        this._ioS.saveListFolders(StorageMode.Local)
      }
    })
  }

}
