import Dexie from "dexie";
import { NoteMetadata } from "../../../types/NoteMetadata";

// Add uuid to content because IndexedDB needs the key path to be part of the object
export type ContentWithUuid = {
    uuid: string,
    content: Object
}

export class CachedCloudDatabase extends Dexie {

    metadatas: Dexie.Table<NoteMetadata, string>

    content: Dexie.Table<ContentWithUuid, string>

    constructor() {
        super("cachedCloud");
        this.version(2).stores({
            metadatas: "uuid,title,description,author,lastedit,version,data",
            content: "uuid,content"
        });
    }

}