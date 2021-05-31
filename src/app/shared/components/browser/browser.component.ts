import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { BrowserService, AuthService } from '../../../services';
import { Subscription, Observable, Subject, of, combineLatest } from 'rxjs';
import { StorageMode } from '../../../services/io/StorageMode';
import { NoteMetadata } from '../../../types/NoteMetadata';
import { TabsManagerService } from '../../../services/tabsManager/tabs-manager.service';
import { Folder } from '../../../types/Folder';
import { debounceTime, take } from 'rxjs/operators';
import { TreeTools } from './TreeTools';
import { CustomizeFolderComponent } from '../customize-folder/customize-folder.component';
import { CustomizeNoteComponent } from '../customize-note/customize-note.component';
import { NzDropdownMenuComponent, NzContextMenuService } from 'ng-zorro-antd/dropdown';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTreeComponent, NzTreeNodeOptions, NzTreeNode, NzFormatEmitEvent, NzFormatBeforeDropEvent } from 'ng-zorro-antd/tree';
import { ElectronService } from '../../../core/services';
import { CachedCloudNoteAPIService } from '../../../services/io/cloud/cached-cloud-note-api.service';
import { CachedLocalNoteAPIService } from '../../../services/io/local/cached-local-note-api.service';
import { CloudFolderAPIService } from '../../../services/io/cloud/cloud-folder-api.service';
import { LocalFolderAPIService } from '../../../services/io/local/local-folder-api.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss'],
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

  hasSessionCookie: boolean = false;


  constructor(
    private _cloudAPIService: CachedCloudNoteAPIService,
    private _cloudFolderAPIService: CloudFolderAPIService,
    private _localAPIService: CachedLocalNoteAPIService,
    private _localFolderAPIService: LocalFolderAPIService,
    private _tmS: TabsManagerService, 
    private _nzContextMenuService: NzContextMenuService,
    private _modalService: NzModalService, 
    private _browserService: BrowserService, 
    private _authService: AuthService,
    public _electronService: ElectronService) { }


  /**
   * Stores fetched notes metadata
   */
  _notes: NoteMetadata[] = []
  _cloudNotes: NoteMetadata[] = [];

  /**
   * Stores fetched folders
   */
  _localFolders: Folder[] = []
  _cloudFolders: Folder[] = []

  searchValue: string

  /**
   * Emitted when tree has ended to generate
   */
  private treeGeneratedSubject = new Subject<void>();

  subscribtions: Subscription[] = []

  ngOnInit() {
    // Automatically fetch noteList with debounce to prevent generateTree overcalls
    this.subscribtions.push(this._localAPIService.getListNotes().subscribe( metas => this._notes = metas ))
    this.subscribtions.push(this._cloudAPIService.getListNotes().subscribe( metas => this._cloudNotes = metas ))
    this.updateNoteList()
    // Automatically fetch folder list
    this.subscribtions.push(this._localFolderAPIService.getListFolders().subscribe( folders => this._localFolders = folders ))
    this.subscribtions.push(this._cloudFolderAPIService.getListFolders().subscribe( folders => this._cloudFolders = folders ))
    // Folder and note merge
    this.subscribtions.push(
      combineLatest([this._localFolderAPIService.getListFolders(), this._localAPIService.getListNotes(),
                     this._cloudFolderAPIService.getListFolders(), this._cloudAPIService.getListNotes()])
        .pipe(debounceTime(100))
        .subscribe(() => {
          console.debug("aaaaaaaaaaaaa")
          this.generateTree()
        })
    )
    this._localFolderAPIService.refreshListFolders()
    this._cloudFolderAPIService.refreshListFolders()

    // When the tab manager says the user has changed note tab, update the selected one
    this.subscribtions.push(this._tmS._editedNote.subscribe( note => this.setSelectedNode(note.noteUUID)) )
    // Handle browser service/api requests
    this.subscribtions.push(this._browserService.askCreateFolderObservable.subscribe( () => this.newFolder(true) ))
    this.subscribtions.push(this._browserService.askCreateNoteObservable.subscribe( () => this.createNote() ))
    // Update auth state automatically
    this._authService.hasSessionCookieObservable.subscribe( cookie => this.hasSessionCookie = cookie )
  }

  private placeInTree(folders: Folder[], root: NzTreeNodeOptions, openedFoldersId: string[], notes: NoteMetadata[]) {
    folders.forEach((f, index) => {
      if (!f.parentFolder || f.parentFolder == "") {
        // Création et insertion du noeud
        let noRootNode = TreeTools.createFolderNode(f)
        // Si le noeud était ouvert, on le réouvre
        noRootNode.expanded = openedFoldersId.includes(noRootNode.key);
        noRootNode.storage = root.storage
        root.children.push(noRootNode)
        // Insertion de ses enfants
        // console.log("removed ", folders.splice(index, 1));// element is treated, remove it from list
        TreeTools.insertChildren(noRootNode, f, folders, notes, openedFoldersId)
      }
    })
  }

  /**
   * Génère les noeuds d'affichage des dossiers
   * @param folders Liste des dossiers
   */
  private generateTree() {
    // Mémoriser quels dossiers étaient ouverts
    let openedFoldersId: string[] = []
    if (this.nzTree) {
      openedFoldersId = this.nzTree.getExpandedNodeList().map(node => node.key)
    }
    // Création d'un noeud racine
    let cloudRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Cloud", "cloud_root", StorageMode.Cloud);

    // Nettoyer l'arbre
    if (this._electronService.isElectron) {
      // En mode electron, on ajoute un 2e noeud racine pour les notes locales
      let localRoot: NzTreeNodeOptions = TreeTools.createCustomFolder("Ce PC", "local_root", StorageMode.Local);
      this.nodes = [localRoot, cloudRoot]
      let localFolders: Folder[] = [...this._localFolders] // copie des dossiers
      this.placeInTree(localFolders, localRoot, openedFoldersId, this._notes)
    }
    else {
      // Mode navigateur
      this.nodes = [cloudRoot]
    }
    // Pour chaque élément sans racine
    let cloudFolders: Folder[] = [{
      uuid: "cloud",
      title: "Mes Documents Cloud",
      color: "#FFFFFF",
      description: "",
      noteUUIDs: this._cloudNotes.map(note => note.uuid),
      parentFolder: null,
      data: {}
    }]
    this.placeInTree(cloudFolders, cloudRoot, openedFoldersId, this._cloudNotes)
    console.debug("Fin de la génération de l'arbre")
    this.treeGeneratedSubject.next()
  }

  ngOnDestroy() {
    this.subscribtions.forEach(s => s.unsubscribe())
  }

  /**
   * Asks the cache to re-fetch notes metadatas from source
   */
  public updateNoteList() {
    // this._ioS.refreshListNotes(StorageMode.Local)
    // this._ioS.refreshListNotes(StorageMode.Cloud)
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
   * Returns the selected note, undefined otherwise
   */
  getSelectedNote(): NoteMetadata {
    return this._notes.find(n => n.uuid == this.selectedNode.key) || this._cloudNotes.find(n => n.uuid == this.selectedNode.key)
  }

  async createNote() {
    var f = this.getSelectedFolder()
    switch (this.selectedNode.origin.storage) {
      case StorageMode.Local:
        if (!f) {
          // Si pas de dossier sélectionné, on en crée un
          f = await this.newFolder(true)
        } else {
          // Si le dossier sélectionné est fermé, on l'ouvre
          this.selectedNode.isExpanded = true
        }
        let newNote: NoteMetadata = await this._localAPIService.createNote().toPromise()
        f.noteUUIDs.push(newNote.uuid)
        this._localFolderAPIService.updateFolder(f)
        this._localFolderAPIService.saveListFolders()
        // On attend que la liste des notes soit mise à jour pour
        // sélectionner le nouveau noeud
        this.treeGeneratedSubject.pipe(take(1)).subscribe(() => {
          setImmediate(() => {
            this.setSelectedNode(newNote.uuid)
            this._tmS.open({title: newNote.title, noteUUID: newNote.uuid, storageMode: StorageMode.Local})
          })
        })
      case StorageMode.Cloud:
        let newNoteCloud: NoteMetadata = await this._cloudAPIService.createNote().toPromise()
        this.treeGeneratedSubject.pipe(take(1)).subscribe(() => {
          setImmediate(() => {
            this.setSelectedNode(newNoteCloud.uuid)
            this._tmS.open({title: newNote.title, noteUUID: newNote.uuid, storageMode: StorageMode.Cloud})
          })
        })
    }

  }

  removeNote() {
    const note: NoteMetadata = this.getSelectedNote()

    this._modalService.confirm({
      nzTitle: `Êtes-vous sur de vouloir supprimer <b>${note.title}</b> ?`,
      nzContent: '',
      nzOkText: 'Oui',
      nzOkType: 'danger',
      nzOnOk: () => {
        switch (this.selectedNode.parentNode.origin.storage) {
          case StorageMode.Cloud:
            this._cloudAPIService.removeNote(note)
            break;
          case StorageMode.Local:
            this._localAPIService.removeNote(note)
            break;
        }
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
    modal.afterClose.subscribe((result: NoteMetadata) => {
      //console.log(this.selectedNode.origin.storage)
      if (result) {
        // Updating folder data
        switch (this.selectedNode.parentNode.origin.storage) {
          case StorageMode.Cloud:
            this._cloudAPIService.saveMetadata(result).subscribe( () => { 
              // TODO : refresh note list in cache
            })
            break;
          case StorageMode.Local:
            this._localAPIService.saveMetadata(result).subscribe( () => { 
              // TODO : refresh note list in cache
            })
            break;
        }
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
    return this.selectedNode && this._localFolders.find(f => f.uuid == this.selectedNode.key)
  }

  /**
   * Sets a node as selected in NzTree
   * @param key node key 
   */
  setSelectedNode(key: string) {
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
      this._tmS.open({
        title: data.node.parentNode.origin.title, 
        noteUUID: data.node.key, 
        storageMode: data.node.parentNode.origin.storage
      })
    }
  }


  /***************************************************************************************************
   *                                       FOLDER MODIFICATION                                       *
   ***************************************************************************************************/

  /**
   * Crée un dossier avec pour parent le dossier sélectionné
   * @param atRoot Le dossier crée est il dans un noeud racine
   */
  async newFolder(atRoot: boolean = false): Promise<Folder> {
    // Si le dossier sélectionné est fermé, on l'ouvre
    if (this.selectedNode) this.selectedNode.isExpanded = true
    let newFolder = await this._localFolderAPIService.createFolder("Nouveau dossier", atRoot ? undefined : this.selectedNode.key)
    // Sauvegarde des changements
    this._localFolderAPIService.saveListFolders()
    // On attend que la liste des dossiers soit mise à jour pour
    // sélectionner le nouveau noeud
    this.treeGeneratedSubject.pipe(take(1)).subscribe(() => {
      setImmediate(() => {
        this.setSelectedNode(newFolder.uuid)
        this.selectedNode.isExpanded = true
      })
    })
    return newFolder
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
        this._localFolderAPIService.removeFolderRecursive(f, [...this._notes], [...this._localFolders])
        // Saving changes
        this._localFolderAPIService.saveListFolders()
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
    modal.afterClose.subscribe((result: Folder) => {
      if (result) {
        // Updating folder data
        this._localFolderAPIService.updateFolder(result)
        this._localFolderAPIService.saveListFolders()
      }
    })
  }


  /***************************************************************************************************
   *                                           DRAG N DROP                                           *
   ***************************************************************************************************/

  nzEvent(event: NzFormatEmitEvent): void {
    if (event.eventName == "drop") {
      console.debug(event)
      if (event.dragNode.origin.isFolder) {

        let f: Folder = this._localFolders.find(f => f.uuid == event.dragNode.key)
        let newParent: Folder = this._localFolders.find(f => f.uuid == event.node.key)
        // Set new parent if it exists, else set parent to root
        f.parentFolder = newParent ? newParent.uuid : ''
        // Save changes
        this._localFolderAPIService.updateFolder(f)
        this._localFolderAPIService.saveListFolders()

      } else {
        console.debug(event.dragNode.parentNode)
        // Remove note from parentFolder
        let parentFolderSource: Folder = this._localFolders.find(f => f.noteUUIDs.includes(event.dragNode.key))
        let destinationFolder: Folder = this._localFolders.find(f => f.uuid == event.dragNode.parentNode.key)
        console.debug(parentFolderSource, destinationFolder)
        if (destinationFolder) {
          // Remove note UUID from original parent
          console.debug("original parent", parentFolderSource)
          parentFolderSource.noteUUIDs = parentFolderSource.noteUUIDs.filter(uuid => uuid != event.dragNode.key)
          // Add note UUID to new parent
          destinationFolder.noteUUIDs.push(event.dragNode.key)
          console.debug("new original parent", parentFolderSource)
          // Save changes
          this._localFolderAPIService.updateFolder(parentFolderSource)
          this._localFolderAPIService.updateFolder(destinationFolder)
          this._localFolderAPIService.saveListFolders()
        }

      }
      // DragnDrop is bugged in NzTree when inserting between two notes, need to refresh
      this._localFolderAPIService.refreshListFolders()
    }
  }

  /**
   * Fonction passée en paramètre du NzTree qui permet de définit si un drag n drop est autorisé
   * ou non
   */
  beforeDrop(event: NzFormatBeforeDropEvent): Observable<boolean> {
    return of(true)
  }

  triggerLogin() {
    this._authService.openModal()
  }

}
