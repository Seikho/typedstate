import { saga } from '../store'

/**
 * The state parameter is derived from `store.getState()` when a handler is invoked.
 * It is only if a third parameter is present in the signature of the handler you pass in.
 */
saga('GAME_REQUEST_SAVE', async (_action, dispatch, { game: { score } }) => {
  const body = JSON.stringify({ score })
  try {
    await fetch('/game/save', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    dispatch({ type: 'GAME_RECEIVE_SAVE' })
  } catch (ex) {
    dispatch({ type: 'GAME_RECEIVE_SAVE', error: ex.message })
  }
})
