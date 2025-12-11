interface CacheOptions {
  /**
   * Time-to-live for cache entries in seconds.
   * 
   * if not provided, entries will not expire.
   */
  ttl?: number;

  /** 
   * Enable debug logging.
   */
  debug?: boolean;
}

export class NodeCache {

  private store: any = {};
  private keys: Set<string> = new Set();

  constructor(private readonly options: CacheOptions = {}) {}

  /** 
   * Gets a value from the cache by key.
   * 
   * @param key The key of the value to retrieve.
   * @returns The value associated with the key.
   */
  public readonly get = <T>(key: string): T | undefined => {
    if (!this.keys.has(key)) {
      if (this.options.debug)
        console.debug(`[DevGLCache] Key not found: ${key}`);

      return undefined;
    }

    let current = this.store;
    for (const part of key.split(':')) {
      if (!(part in current))
        return undefined;
      current = current[part];
    }

    if (this.options.debug)
      console.debug(`[DevGLCache] Key found: ${key}`);

    return current;
  }

  /** 
   * Sets a value in the cache with an optional TTL.
   * 
   * @param key The key to associate with the value.
   * @param value The value to store.
   * @param ttl Optional time-to-live in seconds.
   */
  public readonly set = <T extends any>(key: string, value: T, ttl?: number): void => {
    if (this.options.debug) {
      console.debug(`[DevGLCache] Setting key: ${key} with TTL: ${ttl ?? this.options.ttl ?? 'none'}`);
    }

    this.addKey(key);

    let current = this.store;
    key.split(':').forEach((part, index, parts) => {
      if (index === parts.length - 1) {
        current[part] = value;
      } else {
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }
    });

    if (this.options.debug) {
      console.debug(`[DevGLCache] Key set: ${key}`);
      console.debug('[DevGLCache] Current store:', JSON.stringify(this.store));
      console.debug('[DevGLCache] Current keys:', Array.from(this.keys));
    }

    if (ttl || this.options.ttl) {
      const effectiveTtl = (ttl ?? this.options.ttl)! * 1000;
      setTimeout(() => {
        if (this.options.debug)
          console.debug(`[DevGLCache] TTL expired for key: ${key}, deleting...`);

        this.delete(key);
      }, effectiveTtl);
    }
  }

  /** 
   * Checks if a key exists in the cache.
   * 
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  public readonly has = (key: string): boolean => this.keys.has(key);

  /** 
   * Deletes a value from the cache by key.
   * 
   * @param key The key of the value to delete.
   */
  public readonly delete = (key: string): void => {
    if (this.options.debug)
      console.debug(`[DevGLCache] Deleting key: ${key}`);

    this.deleteKey(key);

    let current = this.store;
    const parts = key.split(':');
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        return;
      }
      current = current[part];
    }

    delete current[parts[parts.length - 1]];

    if (this.options.debug) {
      console.debug(`[DevGLCache] Key deleted: ${key}`);
      console.debug('[DevGLCache] Current store:', JSON.stringify(this.store));
      console.debug('[DevGLCache] Current keys:', Array.from(this.keys));
    }
  }

  /** 
   * Clears all entries from the cache.
   */
  public readonly clear = (): void => {
    this.keys.clear();
    this.store = {};
    if (this.options.debug)
      console.debug('[DevGLCache] Cache cleared');
  }

  /** 
   * Adds a key to the keys set, including all parent keys.
   * 
   * @param key The key to add.
   */
  private readonly addKey = (key: string) => {
    const parts = key.split(':');
    parts.forEach((_, index) => {
      this.keys.add(parts.slice(0, index + 1).join(':'));
    })
  }

  /** 
   * Deletes a key and all its sub-keys from the keys set.
   * 
   * @param key The key to delete.
   */
  private readonly deleteKey = (key: string) => {
    Array
      .from(this.keys)
      .filter(k => k === key || k.startsWith(key + ':'))
      .forEach(k => this.keys.delete(k));
  }
}