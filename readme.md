# TypedState

> A React/Redux wrapper to reduce boilerplate

## Example Setup

### ROOT/store/store.ts

```ts
import { createStore } from 'typedstore'
import * as user from './user'
import * as game from './game' // would be in ROOT/store/game/index.ts ...

export const { setup, saga } = createStore('custom name', {
  user: user.reducer,
  game: game.reducer,
})
```

### ROOT/store/users/index.ts

```ts
import { createReducer } from 'typedstate'
import { saga } from '../store'

export type UserState = { isLoading: boolean; name: string }

export const reducer = createReducer<UserState, UserAction>(initState)

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

### ROOT/store/index.ts

```ts
import { setup } from './store'

const { store, withState } = setup()

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
