import { useEffect, useState } from 'react'
import { Container, Paper, Typography, Stack } from '@mui/material'
import apiClient from '../api/apiClient'

export default function StatisticsPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiClient
      .get('/statistics')
      .then((r) => setStats(r.data))
      .catch((e) => setError(e?.response?.data?.message || 'Ошибка загрузки статистики'))
  }, [])

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography color="error.main">{String(error)}</Typography>
        </Paper>
      </Container>
    )
  }

  if (!stats) return null

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5">Статистика</Typography>
        <Stack sx={{ mt: 2 }} spacing={1}>
          <Typography>Всего заявок: {stats.totalRequests}</Typography>
          <Typography>Завершено: {stats.completedCount}</Typography>
          <Typography>Среднее время (часы): {stats.averageRepairHours}</Typography>

          <Typography sx={{ mt: 2 }}>По типам оборудования:</Typography>
          {(stats.byClimateTechType || []).map((x) => (
            <Typography key={x.type}>
              - {x.type}: {x.count}
            </Typography>
          ))}
        </Stack>
      </Paper>
    </Container>
  )
}
