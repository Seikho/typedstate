# TypedState

> A React/Redux wrapper to reduce boilerplate and increase type safety and productivity

## Why?

After using React with Redux, I found that using `connect`, creating reducers, and sagas required a lot of boilerplate.  
In order to get the type safety I wanted, I would regularly have to modify old code to do so.

**TypedState** is an attempt to reduce the amount of effort introducing React and Redux into a project and to make it easier to use without being burdened by passing types around.

### Project Goals

- Provide a very low barrier for entry to React+Redux
- Provide complete type safety in components, reducers, and sagas
- Reduce boilerplate in React/Redux projects
- Maintain a small and discoverable API to ensure high developer experience

## Benefits

Reducers, sagas, and components gain a huge amount of type safety and type inference.  
Action types, state

## Example Setup

**You will still need to add React and Redux dependencies!**

- react
- redux
- react-redux
- react-dom

See the `example` folder for a more complete example project.

## API

### createStore()

Returns `setup` and `saga` functions

```ts
import { createStore } from 'typedstate'

function createStore(name: string, reducers: { [key: string]: Reducer })
```

### createReducer()

Returns `handle` and `reducer` functions.  
The `reducer` _must_ be exported and passed to the `createStore` function.

```ts
import { createReducer } from 'typedstate'

function createReducer<State, Action>(initState: State, handler?: HandlerBody)
```

### setup()

Returns the Redux `store` and the `withState` and `withDispatch` hooks.  
Think of `withState` as a wrapper of the react-redux `connect` function.

See `examples/App.tsx` for several examples.

## Example

See the `example/` folder for a more complete example

### Creating a Store

The amount of code required to create the store is small and less complicated.  
You no longer need to maintain a union type of all of your actions nor an interface of your application state.  
Simply adding a reducer will provide all of the type safety you need when using `store` and `withState()`.

```ts
import { createStore } from 'typedstate'
import * as user from './user'
import * as game from './game'

const { setup, saga } = createStore('my app', {
  user: user.reducer,
  game: game.reducer,
})

const { store, withDispatch, withState } = setup()

export { saga, store, withDispatch, withState }
```

### Creating a Reducer

Creating reducers and sagas is fast, easy, and declarative.

```ts
import { createReducer } from 'typedstate'

export { reducer }

interface State {
  state: 'init' | 'loading' | 'loaded'
  name?: string
  loggedIn: boolean
  error?: string
}

type Action =
  | { type: 'USER_REQUEST_LOGIN'; username: string; password: string }
  | { type: 'USER_RECEIVE_LOGIN'; name?: string; error?: string }
  | { type: 'USER_REQUEST_LOGOUT' }

const { reducer, handle } = createReducer<State, Action>({ state: 'init', loggedIn: false })

handle('USER_REQUEST_LOGIN', { error: undefined, name: undefined, state: 'loading' })
handle('USER_RECEIVE_LOGIN', (_state, action) => {
  return {
    state: 'loaded',
    name: action.name,
    error: action.error,
    loggedIn: action.error === undefined,
  }
})

handle('USER_REQUEST_LOGOUT', { name: undefined, error: undefined, loggedIn: false })
```

## Alternative way of Creating a Reducer

```ts
import { createReducer } from 'typedstate'

interface State {
  state: 'init' | 'loading' | 'loaded'
  name?: string
  loggedIn: boolean
  error?: string
}

type Action =
  | { type: 'USER_REQUEST_LOGIN'; username: string; password: string }
  | { type: 'USER_RECEIVE_LOGIN'; name?: string; error?: string }
  | { type: 'USER_REQUEST_LOGOUT' }

export const { reducer } = createReducer<State, Action>(
  { state: 'init', loggedIn: false },
  {
    USER_REQUEST_LOGIN: () => ({ error: undefined, name: undefined, state: 'loading' }),
    USER_RECEIVE_LOGIN: (_, action) => {
      return {
        state: 'loaded',
        name: action.name,
        error: action.error,
        loggedIn: action.error === undefined,
      }
    },
    USER_REQUEST_LOGOUT: () => ({ name: undefined, error: undefined, loggedIn: false }),
  }
)
```

### Creating a Component

Creating components takes less code

```tsx
import * as React from 'react'
import { withState } from '/store'

export const Profile = withState(
  ({ user }) => user,
  ({ state, name, error, loggedIn, dispatch }) => {
    const login = () => dispatch({ type: 'USER_REQUEST_LOGIN', username, password })
    const logout = () => dispatch({ type: 'USER_REQUEST_LOGOUT' })
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')

    return <div>Create your component as you normally would</div>
  }
)
```
