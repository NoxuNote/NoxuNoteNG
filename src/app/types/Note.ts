import { NoteMetadata } from "./NoteMetadata";

export type Note = {
  /**
   * Raw note content
   */
  content: any,
  /**
   * Note metadata
   */
  meta: NoteMetadata,       
}