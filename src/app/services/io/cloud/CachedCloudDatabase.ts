import Dexie from "dexie";
import { Note } from "../../../types/Note";
import { NoteMetadata } from "../../../types/NoteMetadata";
import { StorageMode } from "../StorageMode";

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

    /**
     * Get a complete note object from cache
     * WARNING : Does not verify if note exists
     * @param uuid Note uuid
     * @returns A promise of the node
     */
    public async getNote(uuid: string): Promise<Note> {
        return {
            meta: await this.metadatas.get(uuid),
            content: (await this.content.get(uuid)).content,
            storageMode: StorageMode.Cloud
        }
    }

    /**
     * Updates a complete note object from cache
     * WARNING : Does not verify if note exists
     * @param uuid Note uuid
     * @param node Note object
     */
    public async updateNote(uuid: string, note: Note) {
        return Promise.all([
            this.metadatas.update(uuid, note.meta),
            this.content.update(uuid, note.content)
        ])
    }

    public getLastSyncDate(): Date {
        const storedDate = localStorage.getItem("lastSyncDate")
        if (storedDate) return new Date(storedDate)
        return new Date(0)
    }

    public setLastSyncDate(date: Date) {
        localStorage.setItem("lastSyncDate", date.toISOString())
    }   

}