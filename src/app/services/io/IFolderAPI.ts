import { Folder } from "../../types/Folder";
import { Observable } from "rxjs";

export interface IFolderAPI {

  /**
   * Liste les dossiers disponibles
   * @description Cette liste nécessite un certain nombre d'opérations pour être obtenue,
   * cette fonction renvoie donc la liste en cache
   * Pour rafraîchir la liste des dossiers, utiliser refreshListFolders()
   */
  getListFolders(): Observable<Folder[]>

  /**
   * Rafraîchit la liste des dossiers en cache
   */
  refreshListFolders()

  /**
   * Sauvegarde la liste des dossiers en cache dans le stockage
   */
  saveListFolders(): Promise<void>

  /**
   * Crée un dossier dans le cache
   * @param name Nom du dossier
   * @param parentId ID du parent
   */
  createFolder(name: string, parentId?: string): Promise<Folder>

  /**
   * Met à jour les données d'un dossier en cache
   */
  updateFolder(f: Folder)

  /**
   * Supprime récursivement un dossier en cache mais pas les notes qu'il contient
   */
  removeFolder(f: Folder) 

}