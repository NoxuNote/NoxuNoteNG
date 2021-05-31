/**
 * A generic type that adds properties like lastWrite to T
 */
export type Cached<T> = T & {
    /**
     * Last write date
     */
    lastWrite: Date
}

/**
 * Get an item from localStorage
 * @param key localStorage key
 * @returns The T object extended with the Cached properties (like lastWrite)
 */
export function get<T>(key: string): Cached<T> {
    return JSON.parse(localStorage.getItem(key)) as Cached<T>
}

/**
 * Write an Object to localStorage
 * @param key localStorage key
 * @param val Object to serialize in localStorage
 */
export function set<T>(key: string, val: T) {
    localStorage.setItem(key, JSON.stringify({
        ...val, 
        lastWrite: new Date()
    } as Cached<T>))
}