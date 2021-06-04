import { createStore } from '../src'
import * as user from './user'
import * as game from './game'
import * as nested from './nested'

export { saga }

const { saga, setup } = createStore('my app', {
  user: user.reducer,
  game: game.reducer,
  admin: {
    nested: nested.reducer,
  },
})

export const { store, withDispatch, withState } = setup()

// Using nested reducers
store.dispatch({ type: 'NESTED_REQ_ONE', id: 'foo' })
store.getState().admin.nested.name
