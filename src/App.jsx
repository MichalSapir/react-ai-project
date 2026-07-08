import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import './App.css'

const defaultForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
}

const starterTasks = [
  {
    id: '1',
    title: 'לסיים את מסמך המוצר',
    description: 'עדכן את התכנון והוסף נקודות מפתח לדיון עם הצוות.',
    dueDate: '2026-07-12',
    priority: 'high',
    status: 'in-progress',
    createdAt: '2026-07-08T09:00:00.000Z',
  },
  {
    id: '2',
    title: 'ביקורת על דוחות',
    description: 'בדוק את הדוחות האחרונים וודא שאין חריגות.',
    dueDate: '2026-07-10',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-07-07T12:00:00.000Z',
  },
  {
    id: '3',
    title: 'הכנת אסיפת צוות',
    description: 'ארגן את סדר היום והזמן של אנשי המקצוע.',
    dueDate: '',
    priority: 'low',
    status: 'completed',
    createdAt: '2026-07-06T08:30:00.000Z',
  },
]

function formatDate(dateString) {
  if (!dateString) return 'ללא תאריך'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'תאריך לא חוקי'

  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getTaskState(task) {
  if (task.status === 'completed') return 'הושלמה'

  if (task.dueDate) {
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDate < today) return 'באיחור'
  }

  return 'בתהליך'
}

function getStatusLabel(status) {
  switch (status) {
    case 'completed':
      return 'הושלמה'
    case 'in-progress':
      return 'בתהליך'
    default:
      return 'ממתינה'
  }
}

function getPriorityLabel(priority) {
  switch (priority) {
    case 'high':
      return 'גבוהה'
    case 'low':
      return 'נמוכה'
    default:
      return 'בינונית'
  }
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [showForm, setShowForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedTasks = window.localStorage.getItem('task-manager-tasks')
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        } else {
          setTasks(starterTasks)
        }
      } catch {
        setTasks(starterTasks)
      }

      setLoading(false)
    }, 500)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading) {
      window.localStorage.setItem('task-manager-tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const result = tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.description.toLowerCase().includes(normalizedSearch)

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityRank = { high: 3, medium: 2, low: 1 }
        return priorityRank[b.priority] - priorityRank[a.priority]
      }

      if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'he')
      }

      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })

    return result
  }, [tasks, search, statusFilter, priorityFilter, sortBy])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.status === 'completed').length
    const pending = tasks.filter((task) => task.status === 'pending').length
    const overdue = tasks.filter((task) => task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date()).length

    return { total, completed, pending, overdue }
  }, [tasks])

  const openNewTask = () => {
    setForm({ ...defaultForm })
    setEditingTaskId(null)
    setShowForm(true)
  }

  const openEditTask = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    })
    setEditingTaskId(task.id)
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim()) return

    if (editingTaskId) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: form.title.trim(),
                description: form.description.trim(),
                dueDate: form.dueDate,
                priority: form.priority,
                status: form.status,
              }
            : task,
        ),
      )
    } else {
      const newTask = {
        id: `${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
        priority: form.priority,
        status: form.status,
        createdAt: new Date().toISOString(),
      }

      setTasks((currentTasks) => [newTask, ...currentTasks])
    }

    setShowForm(false)
    setForm({ ...defaultForm })
    setEditingTaskId(null)
  }

  const toggleTaskStatus = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task

        const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
        return { ...task, status: nextStatus }
      }),
    )
  }

  const deleteTask = (taskId) => {
    if (window.confirm('האם למחוק את המשימה?')) {
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
    }
  }

  const clearCompleted = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.status !== 'completed'))
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSortBy('dueDate')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3} className="app-shell">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.28), transparent 45%)',
            }}
          />
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ maxWidth: 760 }}>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
                ניהול משימות חכם
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5 }}>
                המערכת שלך לניהול עבודה, עדכונים ויעדים
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                הוסף, ערוך, סמן כהושלם, סנן ומיין משימות מכל מצב — עם מצב טעינה, מצבים ריקים ותזכורות באיחור.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={openNewTask}>
                הוסף משימה חדשה
              </Button>
              <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={clearCompleted}>
                נקה משימות שהושלמו
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Grid container spacing={2}>
          {[
            { label: 'סה"כ', value: stats.total, color: '#6d28d9' },
            { label: 'הושלמו', value: stats.completed, color: '#16a34a' },
            { label: 'ממתינות', value: stats.pending, color: '#f59e0b' },
            { label: 'באיחור', value: stats.overdue, color: '#dc2626' },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e5e7eb' }}>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: item.color, mt: 0.5 }}>
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: '1px solid #e5e7eb' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="חפש לפי כותרת או תיאור"
              InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">סטטוס</InputLabel>
                <Select labelId="status-filter-label" value={statusFilter} label="סטטוס" onChange={(event) => setStatusFilter(event.target.value)}>
                  <MenuItem value="all">הכל</MenuItem>
                  <MenuItem value="pending">ממתינות</MenuItem>
                  <MenuItem value="in-progress">בתהליך</MenuItem>
                  <MenuItem value="completed">הושלמו</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="priority-filter-label">עדיפות</InputLabel>
                <Select labelId="priority-filter-label" value={priorityFilter} label="עדיפות" onChange={(event) => setPriorityFilter(event.target.value)}>
                  <MenuItem value="all">הכל</MenuItem>
                  <MenuItem value="high">גבוהה</MenuItem>
                  <MenuItem value="medium">בינונית</MenuItem>
                  <MenuItem value="low">נמוכה</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="sort-filter-label">מיון</InputLabel>
                <Select labelId="sort-filter-label" value={sortBy} label="מיון" onChange={(event) => setSortBy(event.target.value)}>
                  <MenuItem value="dueDate">תאריך יעד</MenuItem>
                  <MenuItem value="priority">עדיפות</MenuItem>
                  <MenuItem value="createdAt">נוסף לאחרונה</MenuItem>
                  <MenuItem value="title">כותרת</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Button variant="outlined" startIcon={<FilterListRoundedIcon />} onClick={resetFilters}>
              אפס מסננים
            </Button>
          </Stack>

          {loading ? (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Box sx={{ height: 112, borderRadius: 3, background: 'linear-gradient(110deg, #f3f4f6 8%, #ffffff 18%, #f3f4f6 33%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite' }} />
              <Box sx={{ height: 112, borderRadius: 3, background: 'linear-gradient(110deg, #f3f4f6 8%, #ffffff 18%, #f3f4f6 33%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite' }} />
            </Stack>
          ) : filteredTasks.length === 0 ? (
            <Box sx={{ mt: 3, p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 3 }}>
              <PlaylistAddCheckRoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">אין משימות להצגה כרגע</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                שנה מסננים או הוסף משימה חדשה כדי להתחיל.
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={openNewTask}>
                צור משימה חדשה
              </Button>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 3 }}>
              {filteredTasks.map((task) => {
                const overdue = task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date()
                return (
                  <Card key={task.id} variant="outlined" sx={{ borderRadius: 3, boxShadow: 'none', borderColor: overdue ? '#fecaca' : '#e5e7eb' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {task.title}
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                              {task.description || 'אין תיאור נוסף'}
                            </Typography>
                          </Box>
                          <Chip label={getStatusLabel(task.status)} color={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'info' : 'warning'} />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
                          <Chip icon={<ScheduleRoundedIcon />} label={`📅 ${formatDate(task.dueDate)}`} variant="outlined" />
                          <Chip icon={<WarningAmberRoundedIcon />} label={`⚡ ${getPriorityLabel(task.priority)}`} variant="outlined" />
                          <Chip icon={<CheckCircleRoundedIcon />} label={`🧭 ${getTaskState(task)}`} variant="outlined" />
                        </Stack>
                      </Box>
                      <CardActions sx={{ alignSelf: { xs: 'stretch', md: 'center' }, flexWrap: 'wrap' }}>
                        <Button size="small" variant="contained" color="success" onClick={() => toggleTaskStatus(task.id)}>
                          {task.status === 'completed' ? 'החזר לממתינה' : 'סמן כהושלם'}
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => openEditTask(task)}>
                          ערוך
                        </Button>
                        <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => deleteTask(task.id)}>
                          מחק
                        </Button>
                      </CardActions>
                    </CardContent>
                  </Card>
                )
              })}
            </Stack>
          )}
        </Paper>

        <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{editingTaskId ? 'עדכון משימה' : 'הוספת משימה חדשה'}</span>
            <IconButton onClick={() => setShowForm(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="כותרת"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                fullWidth
              />
              <TextField
                label="תיאור"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                multiline
                minRows={3}
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="תאריך יעד"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id="priority-form-label">עדיפות</InputLabel>
                  <Select labelId="priority-form-label" value={form.priority} label="עדיפות" onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <MenuItem value="low">נמוכה</MenuItem>
                    <MenuItem value="medium">בינונית</MenuItem>
                    <MenuItem value="high">גבוהה</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <FormControl fullWidth>
                <InputLabel id="status-form-label">סטטוס</InputLabel>
                <Select labelId="status-form-label" value={form.status} label="סטטוס" onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="pending">ממתינה</option>
                  <option value="in-progress">בתהליך</option>
                  <option value="completed">הושלמה</option>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={() => setShowForm(false)}>
              ביטול
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingTaskId ? 'שמור שינויים' : 'הוסף משימה'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  )
}
