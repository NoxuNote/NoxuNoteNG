import { JsonObject, JsonProperty, Any } from "json2typescript";
import { NoteMetadata } from "./NoteMetadata";

@JsonObject("Folder")
export class Folder {
  /**
   * Unique identifier of the folder (UUID)
   */
  @JsonProperty("uuid", String)
  uuid: string = undefined;
  /**
   * Title of the folder
   */
  @JsonProperty("title", String)
  title: string = undefined;
  /**
   * Color of the folder
   */
  @JsonProperty("color", String)
  color: string = undefined;
  /**
   * Folder description, wrote by the user
   */
  @JsonProperty("description", String)
  description: string = undefined;

  /**
   * Notes in this folder
   */
  @JsonProperty("noteUUIDs", [String])  
  noteUUIDs: String[] = []
  /**
   * UUID of parent folder
   * /!\ MAY BE NULL
   */
  @JsonProperty("parentFolder", String)
  parentFolder: string = undefined;
  /**
   * Other stored metadata (from plugins, extensions, preferences..)
   */
  @JsonProperty("data", Any)
  data: {} = undefined;
}