import { createReducer } from '../../src'

export { reducer }

type GameState = {
  enabled: boolean
  score: number
}

type GameAction =
  | { type: 'GAME_ENABLE' }
  | { type: 'GAME_DISABLE' }
  | { type: 'GAME_SCORE_ADD'; score: number }
  | { type: 'GAME_REQUEST_SAVE' }
  | { type: 'GAME_RECEIVE_SAVE'; error?: string }

const { reducer, handle } = createReducer<GameState, GameAction>({ enabled: false, score: 0 })

// We can pass in an object instead of a action handler if we don't need any reducer logic
handle('GAME_ENABLE', { enabled: true })
handle('GAME_DISABLE', { enabled: false })

handle('GAME_SCORE_ADD', (state, action) => {
  return { score: state.score + action.score }
})
