/**
 * Compatibility shim: makes node-sqlite3-wasm behave like better-sqlite3.
 * Key difference handled: better-sqlite3 accepts spread args (run(a,b,c))
 * while node-sqlite3-wasm requires array args (run([a,b,c])) for multi-params.
 */
const { Database: RawDB } = require('node-sqlite3-wasm');

function toParams(args) {
  if (args.length === 0) return undefined;
  if (args.length === 1) {
    const a = args[0];
    if (Array.isArray(a)) return a;
    if (a !== null && typeof a === 'object') return a;
    return [a];
  }
  return args;
}

function wrapStmt(raw) {
  return {
    run(...args) {
      const p = toParams(args);
      return raw.run(p) || { changes: 0, lastInsertRowid: 0 };
    },
    get(...args) {
      const p = toParams(args);
      return raw.get(p);
    },
    all(...args) {
      const p = toParams(args);
      return raw.all(p) || [];
    },
    free() { try { raw.free(); } catch {} },
  };
}

class CompatDB {
  constructor(path) { this._db = new RawDB(path); }

  prepare(sql) { return wrapStmt(this._db.prepare(sql)); }

  exec(sql) { this._db.exec(sql); return this; }

  pragma(str) {
    this._db.exec(`PRAGMA ${str.replace(/\s*=\s*/, '=')}`);
    return this;
  }

  transaction(fn) {
    return (...args) => {
      this._db.exec('BEGIN');
      try {
        const r = fn(...args);
        this._db.exec('COMMIT');
        return r;
      } catch (err) {
        try { this._db.exec('ROLLBACK'); } catch {}
        throw err;
      }
    };
  }

  close() { this._db.close(); }
}

module.exports = CompatDB;
