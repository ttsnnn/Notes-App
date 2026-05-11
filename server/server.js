import mongoose from 'mongoose'
import cors from 'cors'
import express from 'express'
import Note from './models/Note.js'

const app = express()
app.use(cors())
app.use(express.json())

await mongoose.connect('mongodb://127.0.0.1:27017/notes')
console.log('MongoDB connected')

// Get notes
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find()
  res.json(notes)
})

// Add notes
app.post('/api/notes', async (req, res) => {
  const note = await Note.create(req.body)
  res.json(note)
})

// Update notes
app.patch('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    )
    res.json(note)
  } catch (error) {
    res.status(400).json({ message: "Error" })
  }
})

// Delete notes
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false })
  }
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))