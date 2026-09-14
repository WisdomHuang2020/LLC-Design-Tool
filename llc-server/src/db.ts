import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = process.env.DB_PATH || join(__dirname, '../data/designs.db')
const db = new Database(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS designs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    parameters TEXT NOT NULL,
    results TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

export interface Design {
  id: number
  name: string
  description?: string
  parameters: string
  results?: string
  created_at: string
  updated_at: string
}

export const designDb = {
  create(name: string, description: string, parameters: object, results?: object): Design {
    const stmt = db.prepare(
      'INSERT INTO designs (name, description, parameters, results) VALUES (?, ?, ?, ?)'
    )
    const info = stmt.run(
      name,
      description || null,
      JSON.stringify(parameters),
      results ? JSON.stringify(results) : null
    )
    return this.getById(info.lastInsertRowid as number)!
  },

  getAll(): Design[] {
    return db.prepare('SELECT * FROM designs ORDER BY created_at DESC').all() as Design[]
  },

  getById(id: number): Design | undefined {
    return db.prepare('SELECT * FROM designs WHERE id = ?').get(id) as Design | undefined
  },

  update(id: number, data: Partial<Omit<Design, 'id' | 'created_at'>>): Design {
    const sets: string[] = []
    const values: unknown[] = []
    if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name) }
    if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description) }
    if (data.parameters !== undefined) { sets.push('parameters = ?'); values.push(data.parameters) }
    if (data.results !== undefined) { sets.push('results = ?'); values.push(data.results) }
    sets.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id)
    db.prepare(`UPDATE designs SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    return this.getById(id)!
  },

  delete(id: number): void {
    db.prepare('DELETE FROM designs WHERE id = ?').run(id)
  },
}
