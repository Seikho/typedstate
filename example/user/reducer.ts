import { createReducer } from '../../src'

export { reducer }

type UserState = {
  isLoading: boolean
  name: string
  error?: string
}

type UserAction =
  | { type: 'USER_REQUEST_PROFILE' }
  | { type: 'USER_RECEIVE_PROFILE'; name?: string; error?: string }

const { reducer, handle } = createReducer<UserState, UserAction>({ isLoading: false, name: '' })

handle('USER_REQUEST_PROFILE', { isLoading: true, error: undefined, name: '' })

handle('USER_RECEIVE_PROFILE', (_state, action) => {
  return {
    isLoading: false,
    name: action.name ?? '',
    error: action.error,
  }
})
