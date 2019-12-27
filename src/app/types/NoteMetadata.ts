export type NoteMetadata = {
  /**
   * Unique identifier of the note (UUID)
   */
  uuid: string
  /**
   * Title of the note, given by the user 
   */
  title: string,
  /**
   * Description of the note, given by the user 
   */
  description: string,
  /**
   * Original author of the note, wrote by NoxuNote
   */
  author: string,
  /**
   * Last edit date, wrote by NoxuNote
   */
  lastedit: string,
  /**
   * Note version
   */
  version: string,
  /**
   * Other stored metadata (from plugins, extensions, preferences..)
   */
  data: {},
}