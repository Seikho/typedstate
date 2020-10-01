import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { store, withDispatch, withState } from './store'
import { Router, Route, Switch } from 'react-router'
import { Provider } from 'react-redux'
import * as H from 'history'

const history = H.createBrowserHistory()

export const App = () => {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route path="/one" exact={true} component={ExampleOne} />
          <Route path="/two" exact={true} component={ExampleTwo} />
          <Router path="/three" extract={true} component={ExampleThree} />
          <Router path="/four" extract={true} component={ExampleFour} />
        </Switch>
      </Router>
    </Provider>
  )
}

/**
 * A connected component with both types of props
 */
type OneProps = { example: string }

const ExampleOne: React.FC<OneProps> = withState(
  (state) => ({ username: state.user.name }),
  /**
   * The `example` prop is available because of the `React.FC<Props>` type annotation
   */
  ({ username, example }) => {
    return (
      <div className="example">
        <div>{example}</div>
        <div>{username}</div>
      </div>
    )
  }
)

/**
 * A connected component with only props from state
 * Also dispatches actions
 */
const ExampleTwo = withState(
  ({ game }) => ({ score: game.score }),
  ({ score, dispatch }) => {
    // The dispatch function is type safe
    const addScore = () => dispatch({ type: 'GAME_SCORE_ADD', score: 10 })

    return (
      <div>
        <div>Score: {score}</div>
        <button onClick={addScore}>Add Score</button>
      </div>
    )
  }
)

/** Handling an async action using sagas */
const ExampleThree = withState(
  ({ user: { isLoading, name, error } }) => ({ isLoading, username: name, error }),
  ({ username, dispatch, isLoading, error }) => {
    // The reducer for this action clears the error
    const reload = () => dispatch({ type: 'USER_REQUEST_PROFILE' })

    const Name = error ? `Failed to load profile: ${error}` : isLoading ? 'Loading...' : username

    return (
      <div>
        <div>{Name}</div>
        <div>
          <button onClick={reload}>Reload Profile</button>
        </div>
      </div>
    )
  }
)

/** An example with no mapping of state */
const ExampleFour = withDispatch(({ dispatch }) => {
  const save = () => dispatch({ type: 'GAME_REQUEST_SAVE' })

  return (
    <div>
      <button onClick={save}>Save my Game</button>
    </div>
  )
})

const root = document.querySelector('#app')
ReactDOM.render(<App />, root)
