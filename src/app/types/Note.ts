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
}