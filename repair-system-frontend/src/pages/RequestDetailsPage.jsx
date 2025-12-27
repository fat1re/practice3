import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Paper, Typography, Stack, TextField, Button, Divider } from '@mui/material'
import apiClient from '../api/apiClient'
import { useAuthStore } from '../store/authStore'

export default function RequestDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)

  const [req, setReq] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    try {
      const { data } = await apiClient.get(`/requests/${id}`)
      setReq(data)
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка загрузки заявки')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const addComment = async () => {
    if (!comment.trim()) return
    await apiClient.post(`/requests/${id}/comments`, { message: comment })
    setComment('')
    load()
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">{String(error)}</Typography>
        </Paper>
      </Container>
    )
  }

  if (!req) return null

  const canComment = ['Specialist', 'Manager'].includes(user?.role)

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">{req.number}</Typography>
        <Typography sx={{ mt: 1 }}>Статус: {req.requestStatus}</Typography>
        <Typography>Тип: {req.climateTechType}</Typography>
        <Typography>Модель: {req.climateTechModel}</Typography>
        <Typography sx={{ mt: 1 }}>Проблема: {req.problemDescription}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6">Комментарии</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {(req.comments || []).map((c) => (
            <Paper key={c.id} sx={{ p: 1 }}>
              <Typography variant="body2">
                {c.master?.fio || '—'}: {c.message}
              </Typography>
            </Paper>
          ))}
        </Stack>

        {canComment && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField fullWidth label="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button variant="contained" onClick={addComment}>
              Добавить
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}
