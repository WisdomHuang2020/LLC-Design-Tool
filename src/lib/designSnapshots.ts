// ─── Design snapshots: single source of truth ───
//
// Previously the snapshot list was read once on component mount by DesignCompare,
// with no notification mechanism. Saving wrote to storage but never reached any
// mounted view, so a freshly saved snapshot was invisible until a full page reload.
//
// This module centralises the store and broadcasts changes, so every consumer
// (the "设计快照" card and the "A/B 设计对比" panel) stays in sync automatically.

export interface DesignSnapshotParams {
  vinMin: number
  vinMax: number
  vinNom: number
  vout: number
  pout: number
  efficiency: number
  fsw: number
  topology: string
  rectifier: string
  loadMin: number
  loadMax: number
}

export interface DesignSnapshotResults {
  n: number
  fr: number
  lr: number
  cr: number
  lm: number
  q: number
  k: number
  mMax: number
  mRequired: number
  zvsMargin: boolean
  ipRms: number
  isRms: number
}

export interface DesignSnapshot {
  id: string
  name: string
  timestamp: number
  params: DesignSnapshotParams
  results: DesignSnapshotResults
}

export interface WriteResult {
  ok: boolean
  error: string | null
}

export interface SaveSnapshotResult extends WriteResult {
  snapshot: DesignSnapshot
  /** The snapshot evicted because the list was already at capacity, if any. */
  dropped: DesignSnapshot | null
}

export const SNAPSHOT_STORAGE_KEY = 'llc_design_compare'
export const MAX_SNAPSHOTS = 8

const EMPTY: DesignSnapshot[] = []

let cache: DesignSnapshot[] | null = null
const listeners = new Set<() => void>()

function readFromStorage(): DesignSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as DesignSnapshot[]) : EMPTY
  } catch {
    // Corrupted or unreadable payload — treat as empty rather than crashing.
    return EMPTY
  }
}

function emit() {
  listeners.forEach((listener) => listener())
}

/** Returns a cached reference so React can rely on identity for change detection. */
export function getSnapshots(): DesignSnapshot[] {
  if (cache === null) cache = readFromStorage()
  return cache
}

export function subscribeSnapshots(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function commit(next: DesignSnapshot[]): WriteResult {
  const previous = cache
  let error: string | null = null
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(next))
  } catch (err) {
    // Storage can be unavailable (private mode, blocked cookies, quota exceeded).
    // Surface it instead of failing silently, so the UI can tell the user.
    error = err instanceof Error ? err.message : String(err)
  }
  // Only adopt the new state if it actually persisted — otherwise the list would
  // show an entry that vanishes on reload.
  cache = error === null ? next : previous
  emit()
  return { ok: error === null, error }
}

export function saveDesignSnapshot(
  name: string,
  params: DesignSnapshotParams,
  results: DesignSnapshotResults
): SaveSnapshotResult {
  const designs = [...getSnapshots()]
  let dropped: DesignSnapshot | null = null
  if (designs.length >= MAX_SNAPSHOTS) {
    dropped = designs.shift() ?? null
  }
  const snapshot: DesignSnapshot = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    timestamp: Date.now(),
    params,
    results,
  }
  designs.push(snapshot)
  const result = commit(designs)
  return { ...result, snapshot, dropped }
}

export function removeSnapshot(id: string): WriteResult {
  return commit(getSnapshots().filter((d) => d.id !== id))
}

export function clearSnapshots(): WriteResult {
  return commit([])
}

// Keep multiple tabs of the site consistent with each other.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === SNAPSHOT_STORAGE_KEY) {
      cache = readFromStorage()
      emit()
    }
  })
}
