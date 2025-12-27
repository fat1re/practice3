import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children }) {
  const isAuthed = useAuthStore((s) => s.isAuthed)
  if (!isAuthed()) return <Navigate to="/login" replace />
  return children
}
