import { NoteMetadata } from "../../types/NoteMetadata";
import { Observable } from "rxjs";
import { Note } from "../../types/Note";

export interface INoteDriver {

  /**
   * Liste les notes disponibles
   * @description Cette liste nécessite un certain nombre d'opérations pour être obtenue,
   * cette fonction renvoie donc la liste en cache
   * Pour rafraîchir la liste des notes, utiliser refreshListNotes()
   */
  getListNotes(): Observable<NoteMetadata[]>

  /**
   * Rafraîchit la liste des notes en cache
   */
  refreshListNotes()

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
  saveNote(note: Note): Promise<NoteMetadata>

  /**
   * Enregistre une nouvelle note
   * @param note Note à enregistrer
   */
  saveNewNote(content: string, title?: string): Promise<NoteMetadata>

  /**
   * Modifie les métadonnées d'une note
   * @param newMetadata Nouvelles métadonnées
   */
  editMetadata(newMetadata: NoteMetadata): Promise<NoteMetadata>

}