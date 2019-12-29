import { NoteMetadata } from "../../types/NoteMetadata";
import { Observable } from "rxjs";
import { Note } from "../../types/Note";

export interface INoteDriver {

  /**
   * Liste les notes disponibles
   */
  listNotes(): Observable<NoteMetadata[]>

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
   * Enregistre une nouvelle note
   * @param note Note à enregistrer
   */
  saveNewNote(content: string, title?: string): Observable<boolean>

  /**
   * Modifie les métadonnées d'une note
   * @param newMetadata Nouvelles métadonnées
   */
  editMetadata(newMetadata: NoteMetadata): Observable<boolean>


}