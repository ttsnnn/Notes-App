let notes = []
let editingNoteId = null

// load all notes
async function loadNotes() {
  try {
    const response = await fetch('http://localhost:3000/api/notes')
    const data = await response.json()
    notes = data
    renderNotes()
  } catch (error) {
    console.error('Failed to load notes:', error)
  }
}

// save || update note
async function saveNote(event) {
  event.preventDefault()

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  if (editingNoteId) {
    // Update existing Note
    try {
      const response = await fetch(`http://localhost:3000/api/notes/${editingNoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const updatedNote = await response.json();

      const index = notes.findIndex(n => n._id === editingNoteId);
      notes[index] = updatedNote;
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  } else {
    // Add New Note
    try {
      const response = await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const newNote = await response.json();
      notes.unshift(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  editingNoteId = null;
  closeNoteDialog();
  renderNotes();
}

// delete note
async function deleteNote(noteId) {
  const noteToDelete = notes.find(n => n._id === noteId);
  const noteTitle = noteToDelete ? noteToDelete.title : "this note";

  const confirmed = confirm(`Are you sure you want to delete "${noteTitle}"?`);

  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      notes = notes.filter(note => note._id !== noteId)
      renderNotes()
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
    alert('Something went wrong. Could not delete the note.');
  }
}

// rendering
function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if (notes.length === 0) {
    notesContainer.innerHTML = `
    <div class="empty-state">
      <h2>No notes yet</h2>
      <p>Create your first note to get started!</p>
      <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
    </div>
    `

    return
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
    <div class="note-actions">
      <button class="edit-btn" onclick="openNoteDialog('${note._id}')" title="Edit Note">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#191b23"><path d="M184-184v-83.77l497.23-498.77q5.15-5.48 11.07-7.47 5.93-1.99 11.99-1.99 6.06 0 11.62 1.54 5.55 1.54 11.94 7.15l38.69 37.93q5.61 6.38 7.54 12 1.92 5.63 1.92 12.25 0 6.13-2.24 12.06-2.24 5.92-7.22 11.07L267.77-184H184Zm505.15-466.46L744-704.54 704.54-744l-54.08 54.85 38.69 38.69Z"/></svg>
      </button>
      <button class="delete-btn" onclick="deleteNote('${note._id}')" title="Delete Note">
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#191b23"><path d="M291-267.69 267.69-291l189-189-189-189L291-692.31l189 189 189-189L692.31-669l-189 189 189 189L669-267.69l-189-189-189 189Z"/></svg>
      </button>
    </div>
    </div>
    `).join('')
}

// open dialog
function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if (noteId) {
    // Edit Mode
    const noteToEdit = notes.find(note => note._id === noteId)
    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'
    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
  } else {
    // Add Mode
    editingNoteId = null
    document.getElementById('dialogTitle').textContent = 'Add New Note'
    titleInput.value = ''
    contentInput.value = ''
  }

  dialog.showModal()
  titleInput.focus()
}

// close dialog
function closeNoteDialog() {
  document.getElementById('noteDialog').close()
}

// toggle theme
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}

// store theme
function applyStoredTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}

// when DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
  applyStoredTheme()
  loadNotes()

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

  document.getElementById('noteDialog').addEventListener('click', function (event) {
    if (event.target === this) {
      closeNoteDialog()
    }
  })
})