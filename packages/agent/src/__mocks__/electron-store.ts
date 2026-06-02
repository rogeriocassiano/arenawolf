const store: Record<string, unknown> = {};
export default class Store {
  constructor(opts?: { defaults?: Record<string, unknown> }) {
    if (opts?.defaults) Object.assign(store, opts.defaults);
  }
  get(key: string) { return store[key]; }
  set(key: string, value: unknown) { store[key] = value; }
}
