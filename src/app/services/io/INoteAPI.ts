import { NoteMetadata } from "../../types/NoteMetadata";
import { Observable } from "rxjs";
import { Note } from "../../types/Note";

export interface INoteAPI {

  /**
   * Liste les notes disponibles
   * @description Cette liste nécessite un certain nombre d'opérations pour être obtenue,
   * cette fonction renvoie donc la liste en cache
   * Pour rafraîchir la liste des notes, utiliser refreshListNotes()
   */
  getListNotes(): Observable<NoteMetadata[]>

  /**
   * Récupère une note
   * @param uuid note dont on veut récupérer les informations
   * @description Choix d'un observable car on peut annuler la souscription 
   */
  getNote(uuid: string): Observable<Note>

  /**
   * Enregistre une note
   * @param note Note à enregistrer
   */
  saveNote(note: Note): Observable<NoteMetadata>

  /**
   * Enregistre une nouvelle note
   * @param note Note à enregistrer
   */
  createNote(title?: string): Observable<NoteMetadata>

  /**
   * Modifie les métadonnées d'une note
   * @param newMetadata Nouvelles métadonnées
   */
  saveMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata>

  /**
   * Crée/ajoute les métadonnées de note fournies en paramètre dans le moyen de stockage
   * @param newMetadata Nouvelles métadonnées
   */
  importMetadata(newMetadata: NoteMetadata): Observable<NoteMetadata>

  /**
   * Crée/ajoute une note dans le moyen de stockage
   * @param newMetadata Nouvelles métadonnées
   */
  importNote(newNote: Note): Observable<NoteMetadata>

  /**
   * Supprime définitivement unenote
   * @param n Note à supprimer
   */
  removeNote(n: NoteMetadata): Observable<void>

}