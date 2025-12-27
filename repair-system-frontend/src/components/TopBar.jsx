import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function TopBar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Repair System</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit" component={Link} to="/requests">
          Заявки
        </Button>
        <Button color="inherit" component={Link} to="/statistics">
          Статистика
        </Button>
        <Typography sx={{ mx: 2 }}>
          {user?.fio || user?.fullName || user?.login} ({user?.role})
        </Typography>
        <Button
          color="inherit"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Выйти
        </Button>
      </Toolbar>
    </AppBar>
  )
}
