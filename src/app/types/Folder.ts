import { NoteMetadata } from "./NoteMetadata";

export type Folder = {
  /**
   * Unique identifier of the folder (UUID)
   */
  uuid: string,
  /**
   * Title of the folder
   */
  title: string,
  /**
   * Color of the folder
   */
  color: string,
  /**
   * Folder description, wrote by the user
   */
  description: string
  /**
   * Notes referenced in this folder
   * in storage, this data is stored as uuid of the note
   */
  notes: NoteMetadata[]
  /**
   * UUID of parent folder
   * /!\ MAY BE UNDEFINED
   */
  parentFolder?: string,
}