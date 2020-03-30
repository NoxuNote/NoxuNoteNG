import { Folder } from "../../../types/Folder"
import { NzTreeNodeOptions } from "ng-zorro-antd"
import { NoteMetadata } from "../../../types/NoteMetadata"

export class TreeTools {

  /** Crée un noeud de dossier vide */
  static createCustomFolder(title: string, key: string): NzTreeNodeOptions {
    return {
      title: title,
      key: key,
      children: [],
      isLeaf: false,
      isFolder: true,
      expanded: true,
      isRoot: true,
      selectable: false
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
      isRoot: false
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
    }
  }

  /**
   * Crée et insère récursivement les folders dans le noeud fourni
   * @param node Noeud d'arbre
   * @param folders Liste des dossiers restants à insérer
   * @param parent Dossier parent (généralement l'appelant)
   */
  static insertChildren = (node: NzTreeNodeOptions, parent: Folder, allFolders: Folder[], allNotes: NoteMetadata[], expandedNodelist: string[]) => {
    // Folder insertion
    let hasChildren = false
    allFolders.forEach((f, index) => {
      if (f.parentFolder != undefined && f.parentFolder == parent.uuid) {
        // Création et insertion du noeud
        let newNode = TreeTools.createFolderNode(f)
        console.log("isEXPANDED ???", node, expandedNodelist.includes(newNode.key))
        newNode.expanded = expandedNodelist.includes(newNode.key)
        node.children.push(newNode)
        // Insertion de ses enfants
        // folders.splice(index, 1) // element is treated, remove it from list
        TreeTools.insertChildren(newNode, f, allFolders, allNotes, expandedNodelist)
        hasChildren = true
      }
    })
    // Notes insertion
    allNotes.forEach(note => {
      if (parent.noteUUIDs.includes(note.uuid)) {
        node.children.push(TreeTools.createNoteNode(note))
        hasChildren = true
      }
    })
  }

}