import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { IoService } from '../../../services';
import { Subscription, Observable, timer, Subject, merge } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzDropdownMenuComponent, NzContextMenuService, NzTreeComponent, NzModalService } from 'ng-zorro-antd';
import { Folder } from '../../../types/Folder';
import { debounceTime, take } from 'rxjs/operators';
import { TreeTools } from './TreeTools';
import { CustomizeFolderComponent } from '../customize-folder/customize-folder.component';
import { CustomizeNoteComponent } from '../customize-note/customize-note.component';

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
   * Noeuds de l'arbre de navigation lors de sa création
   */
  nodes: NzTreeNodeOptions[] = [];

  /**
   * Noeud actif
   */
  selectedNode: NzTreeNode

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

  /**
   * Emitted when tree has ended to generate
   */
  private treeGeneratedSubject = new Subject<void>();

  subscribtions: Subscription[] = []

  ngOnInit() {
    // Automatically fetch noteList with debounce to prevent generateTree overcalls
    this.subscribtions.push(this._ioS.getListNotes(this._source).subscribe(metas => {
      this._notes = metas
    }))
    this.updateNoteList()
    // Automatically fetch folder list
    this.subscribtions.push(this._ioS.getListFolders(this._source).subscribe(folders => {
      this._folders = folders
    }))
    // Folder and note merge
    this.subscribtions.push(
      merge(this._ioS.getListFolders(this._source), this._ioS.getListNotes(this._source))
        .pipe(debounceTime(20))
        .subscribe(()=> {
          this.generateTree()
        })
    )
    this._ioS.refreshListFolders(this._source)
    // When the tab manager says the user has changed note tab, update the selected one
    this.subscribtions.push(this._tmS._editedNoteUuid.subscribe(uuid => {
      console.debug("selecting " + uuid)
      this.setSelectedNode(uuid)
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
    console.debug("Fin de la génération de l'arbre")
    this.treeGeneratedSubject.next()
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
   * Set a node selected
   * @param data Tree Node event emitter
   */
  selectNode(data: NzFormatEmitEvent): void {
    this.selectedNode = data.node
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

/***************************************************************************************************
 *                                              NOTES                                              *
 ***************************************************************************************************/

  /**
   * Returns the selected folder, undefined otherwise
   */
  getSelectedNote(): NoteMetadata {
    return this._notes.find(n=>n.uuid==this.selectedNode.key)
  }

  /**
   * Calls tabsManagerService to open a note
   * @param uuid Note uuid
   */
  openNote(uuid: string) {
    this._tmS.open(uuid);
  }

  async createNote() {
    // Si le dossier sélectionné est fermé, on l'ouvre
    this.selectedNode.isExpanded = true
    let newNote: NoteMetadata = await this._ioS.createNote(StorageMode.Local)
    console.log("new", newNote);
    // Set note parent folder
    let f = this.getSelectedFolder()
    f.noteUUIDs.push(newNote.uuid)
    this._ioS.updateFolder(StorageMode.Local, f)
    this._ioS.saveListFolders(StorageMode.Local)
    // On attend que la liste des notes soit mise à jour pour
    // sélectionner le nouveau noeud
    this.treeGeneratedSubject.pipe(take(1)).subscribe(() => {
      setImmediate(() => this.setSelectedNode(newNote.uuid))
    })
  }

  removeNote() {
    const note: NoteMetadata = this.getSelectedNote()
    this._modalService.confirm({
      nzTitle: `Êtes-vous sur de vouloir supprimer <b>${note.title}</b> ?`,
      nzContent: '',
      nzOkText: 'Oui',
      nzOkType: 'danger',
      nzOnOk: () => {
        this._ioS.removeNote(StorageMode.Local, note)
      },
      nzCancelText: 'Annuler'
    })
  }


  editNote() {
    let n: NoteMetadata = this.getSelectedNote()
    const modal = this._modalService.create({
      nzTitle: `Modifier <b>${n.title}</b>`,
      nzContent: CustomizeNoteComponent,
      nzComponentParams: {
        inputNote: n
      },
      nzFooter: [
        {
          label: 'Valider',
          onClick: componentInstance => componentInstance.trySubmitForm()
        }
      ]
    })
    modal.afterClose.subscribe( (result: NoteMetadata) => {
      if (result) {
        // Updating folder data
        this._ioS.saveMetadata(StorageMode.Local, result)
      }
    })
  }


/***************************************************************************************************
 *                                         NODE SELECTION                                          *
 ***************************************************************************************************/

  /**
   * Returns the selected folder, undefined otherwise
   */
  getSelectedFolder(): Folder {
    return this._folders.find(f=>f.uuid==this.selectedNode.key)
  }

  /**
   * Sets a node as selected in NzTree
   * @param key node key 
   */
  setSelectedNode(key: string) {
    console.debug('selection du noeud', key)
    this.selectedNode = this.nzTree?.getTreeNodeByKey(key)
  }

    /**
   * Triggered when user left-clicks on a tree node
   * @param data Tree Node event emitter
   */
  activateNode(data: NzFormatEmitEvent): void {
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


/***************************************************************************************************
 *                                       FOLDER MODIFICATION                                       *
 ***************************************************************************************************/

/**
 * Crée un dossier avec pour parent le dossier sélectionné
 * @param atRoot Le dossier crée est il dans un noeud racine
 */
 async newFolder(atRoot: boolean = false) {    
   // Si le dossier sélectionné est fermé, on l'ouvre
   this.selectedNode.isExpanded = true
   let newFolder = this._ioS.createFolder(StorageMode.Local, "Nouveau dossier", atRoot? undefined : this.selectedNode.key)
   // Sauvegarde des changements
   await this._ioS.saveListFolders(StorageMode.Local)
   // On attend que la liste des dossiers soit mise à jour pour
   // sélectionner le nouveau noeud
   this.treeGeneratedSubject.pipe(take(1)).subscribe(()=>{
     setImmediate(()=>this.setSelectedNode(newFolder.uuid))
   })
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
