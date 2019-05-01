export default class Collection<T> extends Map<string | number, T> {

    /** Returns first matching Object or undefined if no match */
    public find(fn: (i: T) => boolean): T | undefined {
        for (const item of this.values()) {
            if (fn(item))
                return item;
        }
        return undefined;
    }

    /** Returns an Array with all the elements that make the function evaluate true */
    public filter(fn: (i: T) => boolean): T[] {
        const results: T[] = [];
        for (const item of this.values()) {
            if (fn(item))
                results.push(item);
        }
        return results;
    }

    /** Returns an Array with the results of applying the given function to each element */
    public map<R>(fn: (i: T) => R): R[] {
        const results: R[] = [];
        for (const item of this.values()) {
            results.push(fn(item));
        }
        return results;
    }

    /** Returns a random Object from the Collection or undefined if the Collection is empty */
    public random(): T | undefined {
        if (!this.size)
            return undefined;
        return Array.from(this.values())[Math.floor(Math.random() * this.size)];
    }
}
