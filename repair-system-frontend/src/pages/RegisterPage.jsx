import { Container, Paper, Typography, TextField, Button, Box, Alert, MenuItem } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { useNavigate, Link } from 'react-router-dom'

const roles = ['Customer', 'Operator', 'Specialist', 'Manager', 'QualityManager']

export default function RegisterPage() {
  const { register, handleSubmit } = useForm({ defaultValues: { role: 'Customer' } })
  const registerFn = useAuthStore((s) => s.register)
  const error = useAuthStore((s) => s.error)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    await registerFn(data)
    navigate('/requests')
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Регистрация</Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {String(error)}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <TextField fullWidth label="ФИО" margin="normal" {...register('fio', { required: true })} />
          <TextField fullWidth label="Телефон" margin="normal" {...register('phone', { required: true })} />
          <TextField fullWidth label="Login" margin="normal" {...register('login', { required: true })} />
          <TextField fullWidth select label="Роль" margin="normal" {...register('role', { required: true })}>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Пароль" type="password" margin="normal" {...register('password', { required: true })} />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }} disabled={isLoading}>
            Создать
          </Button>
          <Button fullWidth component={Link} to="/login" sx={{ mt: 1 }}>
            Уже есть аккаунт
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
