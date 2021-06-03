import { Folder } from "../../../types/Folder"
import { NoteMetadata } from "../../../types/NoteMetadata"
import { StorageMode } from "../../../services/io/StorageMode"
import { NzTreeNodeOptions } from "ng-zorro-antd/tree"
import _ from "lodash"

export class TreeTools {

  /** Crée un noeud de dossier vide */
  static createCustomFolder(title: string, key: string, storage: StorageMode): NzTreeNodeOptions {
    return {
      title: title,
      key: key,
      children: [],
      isLeaf: false,
      isFolder: true,
      expanded: true,
      isRoot: true,
      selectable: false,
      storage: storage
    }
  }

  /** Crée un noeud de dossier vide */
  static createFolderNode(f: Folder): NzTreeNodeOptions {
    return {
      title: f.title,
      key: f.uuid,
      children: [],
      isLeaf: false,
      isFolder: true,
      isRoot: false,
      storage: undefined
    }
  }

  /** Crée un noeud de note */
  static createNoteNode(note: NoteMetadata): NzTreeNodeOptions {
    return {
      title: note.title,
      key: note.uuid,
      isLeaf: true,
      isFolder: false,
      isRoot: false,
      storage: undefined
    }
  }

/**
 * Inserts recursively 'childrenFolders' and 'notes' in nzFolder
 * @param nzFolder NzTreeNode where children will be inserted
 * @param storageMode nzFolder's storageMode
 * @param childrenFolders children folder metadatas
 * @param notes nzFolder and children's notes
 * @param expandedNodelist a list of currently expanded noteUUID in tree
 * @param selectedNodeList a list of currently selected node key in tree
 * @param folder nzFolder's metadata, let undefined or null if folder it's an artificially made folder (not a user's folder)
 */
  static insertChildren = (
    nzFolder: NzTreeNodeOptions,
    storageMode: StorageMode,
    childrenFolders: Folder[], 
    notes: NoteMetadata[], 
    expandedNodelist: string[],
    selectedNodeList: string[],
    folder?: Folder,
  ) => {
    // Insert folders that do not have parents and folders that have nzFolder as parent
    let directChildrenFolder = childrenFolders.filter( f => (!f.parentFolder || f.parentFolder == "") || (f.parentFolder && f.parentFolder == folder?.uuid))
    directChildrenFolder.forEach( f => {
      // Création et insertion du noeud
      let newNode = TreeTools.createFolderNode(f)
      newNode.storage = storageMode
      newNode.expanded = expandedNodelist.includes(newNode.key)
      newNode.selected = selectedNodeList.includes(newNode.key)
      nzFolder.children.push(newNode)
      // Insertion de ses enfants
      TreeTools.insertChildren(newNode, storageMode, _.difference(childrenFolders, directChildrenFolder), notes, expandedNodelist, selectedNodeList, f)
    })
    // Notes insertion
    notes
    .filter( n => folder?.noteUUIDs.includes(n.uuid) )
    .forEach( note => {
      let noteNode = TreeTools.createNoteNode(note)
      noteNode.selected = selectedNodeList.includes(note.uuid)
      nzFolder.children.push(noteNode) 
    })
  }

  static forEachNode(tree: NzTreeNodeOptions[], f: (n: NzTreeNodeOptions) => void) {
    if (!tree) return
    tree.forEach(node => {
      f(node)
      this.forEachNode(node.children, f)
    }) 
  }

}