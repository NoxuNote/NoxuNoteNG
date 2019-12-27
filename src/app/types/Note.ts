import { NoteMetadata } from "./NoteMetadata";

export type Note = {
  /**
   * Raw note content (html)
   */
  content: string,
  /**
   * Note metadata
   */
  meta: NoteMetadata,       
}