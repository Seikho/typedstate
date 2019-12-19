# TypedStore

> A React/Redux wrapper to reduce boilerplate

## Usage

```ts
// store.ts
import { createStore } from 'typedstore'
import { UserState, UserAction } from './user'
import { GameState, GameAction } from './game'

type AppState = {
  user: UserState
  game: GameState
  // etc...
}

type AppAction = UserAction | GameAction

export const { store, createReducer, saga, dispatch, withState } = createStore<UserState, UserAction>(
  'custom name'
)

// /users/...
import { createReducer, saga } from '../store'

export type UserState = { isLoading: boolean; name: string }

export const reducer = reducer<UserAction, 'user'>('user', initState)

handle('USER_REQUEST_PROFILE', { isLoading: true })

handle('USER_RECEIVE_PROFILE', (state, action) => {
  return {
    isLoading: false,
    name: action.name,
  }
})

saga('USER_REQUEST_PROFILE', async (action, dispatch) => {
  const profile = await getProfile()
  dispatch({ type: 'USER_RECEIVE_PROFILE', name: profile.name })
})
```
