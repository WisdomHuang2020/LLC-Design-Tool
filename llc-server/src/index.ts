import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { designDb } from './db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 获取所有设计
app.get('/api/designs', (_req: Request, res: Response) => {
  try {
    const designs = designDb.getAll()
    res.json(designs.map(d => ({
      ...d,
      parameters: JSON.parse(d.parameters),
      results: d.results ? JSON.parse(d.results) : null,
    })))
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// 创建设计
app.post('/api/designs', (req: Request, res: Response) => {
  try {
    const { name, description, parameters, results } = req.body
    const design = designDb.create(name, description, parameters, results)
    res.status(201).json({
      ...design,
      parameters: JSON.parse(design.parameters),
      results: design.results ? JSON.parse(design.results) : null,
    })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// 获取单个设计
app.get('/api/designs/:id', (req: Request, res: Response) => {
  try {
    const design = designDb.getById(Number(req.params.id))
    if (!design) return res.status(404).json({ error: 'Not found' })
    res.json({
      ...design,
      parameters: JSON.parse(design.parameters),
      results: design.results ? JSON.parse(design.results) : null,
    })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// 更新设计
app.put('/api/designs/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const data: Record<string, string> = {}
    if (req.body.name !== undefined) data.name = req.body.name
    if (req.body.description !== undefined) data.description = req.body.description
    if (req.body.parameters !== undefined) data.parameters = JSON.stringify(req.body.parameters)
    if (req.body.results !== undefined) data.results = JSON.stringify(req.body.results)
    const design = designDb.update(id, data)
    res.json({
      ...design,
      parameters: JSON.parse(design.parameters),
      results: design.results ? JSON.parse(design.results) : null,
    })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

// 删除设计
app.delete('/api/designs/:id', (req: Request, res: Response) => {
  try {
    designDb.delete(Number(req.params.id))
    res.json({ success: true })
  } catch (e) {
    res.status(500).json({ error: (e as Error).message })
  }
})

app.listen(PORT, () => {
  console.log(`LLC Server running on port ${PORT}`)
})
