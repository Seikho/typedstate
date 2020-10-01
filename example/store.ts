import { createStore } from '../src'
import * as user from './user'
import * as game from './game'

export { saga }

const { saga, setup } = createStore('my app', {
  user: user.reducer,
  game: game.reducer,
})

export const { store, withDispatch, withState } = setup()
