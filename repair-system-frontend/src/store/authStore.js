import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '../api/apiClient'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      isAuthed: () => Boolean(get().token && get().user),

      register: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          // ожидается ответ: { token, user }
          const { data } = await apiClient.post('/auth/register', payload)
          set({ token: data.token, user: data.user, isLoading: false })
          return data
        } catch (e) {
          set({ error: e?.response?.data?.message || 'Ошибка регистрации', isLoading: false })
          throw e
        }
      },

      login: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          // ожидается ответ: { token, user }
          const { data } = await apiClient.post('/auth/login', payload)
          set({ token: data.token, user: data.user, isLoading: false })
          return data
        } catch (e) {
          set({ error: e?.response?.data?.message || 'Ошибка входа', isLoading: false })
          throw e
        }
      },

      logout: () => {
        set({ token: null, user: null, error: null })
      },
    }),
    {
      name: 'repair-auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
