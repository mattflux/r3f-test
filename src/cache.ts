import lru from "lru-cache";

// maxAge is in ms
const cache = new lru({
    maxAge: 1000 * 60 * 5,
    max: 500000000000,
    length: (n: any) => {
        // n = item passed in to be saved (value)
        return n.length * 100;
    },
});

export const set = (key: string, value: any) => {
    cache.set(key, value);
};

export const get = (key: string) => {
    return cache.get(key);
};

const api = {
    get,
    set,
};


export default api;