import { saga } from '../store'

saga('USER_REQUEST_PROFILE', async (_action, dispatch) => {
  try {
    const res = await fetch('/profile')
    if (res.status >= 400) {
      dispatch({ type: 'USER_RECEIVE_PROFILE', error: res.statusText })
      return
    }

    const json = await res.json()
    dispatch({ type: 'USER_RECEIVE_PROFILE', name: json.name })
  } catch (ex) {
    dispatch({ type: 'USER_RECEIVE_PROFILE', error: ex.message })
  }
})
