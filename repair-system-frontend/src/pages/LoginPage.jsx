import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const { register, handleSubmit } = useForm()
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    await login({ login: data.login, password: data.password })
    navigate('/requests')
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Вход</Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {String(error)}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField fullWidth label="Login" margin="normal" {...register('login', { required: true })} />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            {...register('password', { required: true })}
          />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }} disabled={isLoading}>
            Войти
          </Button>
          <Button fullWidth component={Link} to="/register" sx={{ mt: 1 }}>
            Регистрация
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
