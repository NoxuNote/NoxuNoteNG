import { Folder } from "../../types/Folder";
import { Observable } from "rxjs";

export interface IFolderDriver {

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

}