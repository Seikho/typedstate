# TypedState

> A React/Redux wrapper to reduce boilerplate

## Setup

```ts
// store/store.ts
import { createStore } from 'typedstore'
import { UserState, UserAction } from './user'
import { GameState, GameAction } from './game'

type AppState = {
  user: UserState
  game: GameState
  // etc...
}

type AppAction = UserAction | GameAction

export const { setup, createReducer, saga, dispatch, withState } = createStore<
  UserState,
  UserAction
>('custom name')

// store/users/...
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

// store/index.ts

import './users'
import { setup, withState } from './store'

const store = setup()

export { store, withState }
```

## Consumption

```tsx
// App.tsx
import { Provider } from 'react-redux'
import { store } from './store'


// A standard top-level component
export const App = () => (
  <Provider store={store}>
    <Router>
      <Switch>
        <Route ... />
        <Route ... />
        <Route ... />
      </Switch>
    </Router>
  </Provider>
)

// A random component connected with state:
import { withState } from '../store'

// If you do not pass in props to your component, the component props will be inferred
// from your "state to props" map function so these generics are optional:

// The props mapped from redux state:
type State = { name: string }

// The standard props to render the component:
type Props = { hide: boolean }

export const Component = withState<State, Props>(
  // Your map function from state to props:
  ({ user }) => ({ username: user.name }),
  // Your component with your state props + dispatch + standard props
  ({ username, hide, dispatch }) => {
    //
    return <div className={hide ? 'hide' : ''}>{username}</div>
  }
)
```
