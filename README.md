# Node Cache

A simple in-memory caching library for Node.js applications. It provides an easy-to-use interface for storing, retrieving, and managing cached data to improve application performance.

## Features

- Simple key-value storage
- Time-to-live (TTL) support for cached items
- Automatic expiration of stale items
- Easy integration with Node.js applications

## Installation

```bash
npm install @devgl/node-cache
```

## Usage

```javascript
const NodeCache = require('@devgl/node-cache');
const cache = new NodeCache();

// Set a value in the cache with a TTL of 100 seconds
cache.set('key', 'value', 100);
// Get a value from the cache
const value = cache.get('key');
console.log(value); // Output: 'value'
```

## API

- `set(key, value, ttl)`: Stores a value in the cache with an optional time-to-live (TTL).
- `get(key)`: Retrieves a value from the cache by its key.
- `has(key)`: Checks if a key exists in the cache.
- `delete(key)`: Deletes a value from the cache by its key.
- `clear()`: Clears all items from the cache.

## License

MIT License
