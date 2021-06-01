import Dexie from "dexie";
import { NoteMetadata } from "../../../types/NoteMetadata";

export class CachedCloudDatabase extends Dexie {

    metadatas: Dexie.Table<NoteMetadata, string>

    constructor() {
        super("cachedCloud");
        this.version(1).stores({
            metadatas: "uuid,title,description,author,lastedit,version,data"
        });
    }

}