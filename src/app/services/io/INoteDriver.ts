import { NoteMetadata } from "../../types/NoteMetadata";
import { Observable } from "rxjs";
import { Note } from "../../types/Note";

export interface INoteDriver {

  /**
   * Récupère les métadonnées d'une note données
   * @param uuid note dont on veut récupérer les informations
   */
  getNoteMetadata(uuid: string): Observable<NoteMetadata>

  /**
   * Récupère une note
   * @param uuid note dont on veut récupérer les informations
   */
  getNote(uuid: string): Observable<Note>

  /**
   * Enregistre une note
   * @param note Note à enregistrer
   */
  saveNote(note: Note): Observable<boolean>

  /**
   * Modifie les métadonnées d'une note
   * @param uuid uuid de la note à modifier
   * @param newMetadata Nouvelles métadonnées
   */
  editMetadata(newMetadata: NoteMetadata): Observable<boolean>

}