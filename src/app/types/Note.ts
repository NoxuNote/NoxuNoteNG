import { StorageMode } from "../services";
import { NoteMetadata } from "./NoteMetadata";

export type Note = {
  /**
   * Raw note content
   */
  content: Object,
  /**
   * Note metadata
   */
  meta: NoteMetadata,    
  /**
   * Where is the note stored
   */
  storageMode: StorageMode   
}