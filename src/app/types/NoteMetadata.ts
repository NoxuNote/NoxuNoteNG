import { JsonObject, JsonProperty, Any } from "json2typescript";
import { UTCDateConverter } from "./UTCDateConverter";

@JsonObject("NoteMetadata")
export class NoteMetadata {
  /**
   * Unique identifier of the note (UUID)
   */
  @JsonProperty("uuid", String)
  uuid: string = undefined;
  /**
   * Title of the note, given by the user 
   */
  @JsonProperty("title", String)
  title: string = undefined;
  /**
   * Description of the note, given by the user 
   */
  @JsonProperty("description", String)
  description: string = undefined;
  /**
   * Original author of the note, wrote by NoxuNote
   */
  @JsonProperty("author", String)
  author: string = undefined;
  /**
   * Last edit date, wrote by NoxuNote
   */
  @JsonProperty("lastedit", UTCDateConverter)
  lastEdit: Date = undefined;
  /**
   * Note version
   */
  @JsonProperty("version", Number)
  version: number = undefined;
  /**
   * Other stored metadata (from plugins, extensions, preferences..)
   */
  @JsonProperty("data", Any)
  data: {} = undefined;
}