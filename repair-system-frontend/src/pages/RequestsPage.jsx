import { useEffect, useState } from 'react'
import { Container, Paper, Typography, TextField, Button, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import apiClient from '../api/apiClient'

export default function RequestsPage() {
  const [items, setItems] = useState([])
  const [number, setNumber] = useState('')
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    try {
      const { data } = await apiClient.get('/requests', { params: { number, page: 1, limit: 50 } })
      setItems(data.items || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Ошибка загрузки заявок')
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">Заявки</Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField label="Поиск по номеру" value={number} onChange={(e) => setNumber(e.target.value)} />
          <Button variant="contained" onClick={load}>
            Искать
          </Button>
        </Stack>

        {error && <Typography sx={{ mt: 2, color: 'error.main' }}>{String(error)}</Typography>}

        <Stack sx={{ mt: 2 }} spacing={1}>
          {items.map((r) => (
            <Paper
              key={r.id}
              component={Link}
              to={`/requests/${r.id}`}
              sx={{ p: 2, textDecoration: 'none', display: 'block' }}
            >
              <Typography variant="subtitle1">
                {r.number} — {r.requestStatus}
              </Typography>
              <Typography variant="body2">
                {r.climateTechType} / {r.climateTechModel}
              </Typography>
              <Typography variant="body2">
                Клиент: {r.client?.fio || '-'} | Мастер: {r.master?.fio || '-'}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  )
}
