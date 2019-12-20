import * as React from 'react'
import { Saga, ExtractAction, Action, StateMap, Dispatcher } from './types'
import { createStore as createRedux, applyMiddleware, Reducer, Store } from 'redux'
import { connect } from 'react-redux'

export { Saga, ExtractAction, Action }

let composeWithDevTools: any
try {
  composeWithDevTools = require('redux-devtools-extension').composeWithDevTools
} catch {}

export function createStore<TState, TAction extends Action>(name: string = 'main') {
  const reducers = new Map<keyof TState, Reducer<TState, TAction>>()
  const initState = new Map<keyof TState, any>()

  const getInitState = (): TState => {
    const state: TState = {} as any
    for (const [key, subState] of Array.from(initState)) {
      state[key] = { ...subState }
    }
    return state
  }

  const reduce = (state: TState | undefined, action: TAction): TState => {
    let nextState: TState = state ? { ...state } : getInitState()
    for (const [key, reducer] of Array.from(reducers)) {
      const subState = reducer(nextState[key] as any, action) as any
      nextState[key] = subState
    }
    return nextState
  }

  const saga = createSaga<TState, TAction>()

  let store: Store<TState, TAction>

  const setup = () => {
    store = createRedux<TState, TAction, {}, {}>(
      reduce,
      composeWithDevTools
        ? composeWithDevTools({
            name: `(${window.location.hostname}) - ${name}`,
          })(applyMiddleware(saga.saga))
        : applyMiddleware(saga.saga)
    )

    return store
  }

  function withState<TFromState, TProps = {}>(
    map: StateMap<TState, TAction, TFromState>,
    comp: Comp<TFromState & TProps & { dispatch: Dispatcher<TAction> }>
  ): React.FunctionComponent<TProps> {
    const Child = connect<TFromState, TState, TProps, TState>(state => ({
      ...map({ ...state, dispatch: store.dispatch }),
      dispatch: store.dispatch,
    }))(comp as any)
    return (props: TProps) => <Child {...props} />
  }

  return {
    withState,
    setup,
    createReducer<TAction extends Action, TKey extends keyof TState>(
      key: TKey,
      init: TState[TKey]
    ) {
      if (reducers.has(key)) {
        throw new Error('Cannot create reducer for same key twice')
      }

      const { reducer, handle } = createReducer<TState[TKey], TAction>(init)
      initState.set(key, init)
      reducers.set(key, reducer as any)
      return handle
    },
    saga: saga.handle,
  }
}

function createReducer<TState, TAction extends Action>(init: TState) {
  type TReturn = Partial<TState> | void

  const handlers = new Map<TAction['type'], any>()

  const handle = <TType extends TAction['type']>(
    type: TType,
    handler: ((state: TState, action: ExtractAction<TAction, TType>) => TReturn) | TReturn
  ) => {
    const existing = handlers.get(type)

    // This is typically a mistake
    // If this is desired, we should provide "options" to to the createReducer() to
    // specifically states that overriding existing handlers is intended
    if (existing) {
      throw new Error(`Unable to mount reducer handler '${type}': Handler already exists`)
    }
    handlers.set(type, handler)
  }

  const reducer = (state: TState = init, action: TAction | any): TState => {
    const handler = handlers.get(action.type)
    if (!handler) return state
    if (typeof handler === 'function') {
      const nextState = handler(state, action) || state
      return { ...state, ...nextState }
    }
    return { ...state, ...handler }
  }

  return { handle, reducer }
}

function createSaga<TState, TAction extends Action>() {
  const typeHandlers = new Map<TAction['type'], Array<Function>>()
  const saga: Saga<TState, TAction> = ({ dispatch, getState }) => next => async (
    action: TAction
  ) => {
    next(action)

    const handlers = typeHandlers.get(action.type)
    if (!handlers) return

    for (const handler of handlers) {
      if (handler.length === 3) {
        const state = getState()
        await handler(action, dispatch, state)
        return
      }

      await handler(action, dispatch)
    }

    // TODO: What to do for default error handling?
  }

  type Dispatch = (action: TAction) => void

  const handle = <TType extends TAction['type']>(
    type: TType,
    handler: (action: ExtractAction<TAction, TType>, dispatch: Dispatch, getState: TState) => any
  ) => {
    if (!typeHandlers.has(type)) {
      typeHandlers.set(type, [])
    }

    const typeHandler = typeHandlers.get(type)!
    typeHandler.push(handler)
    typeHandlers.set(type, typeHandler)
  }

  return { handle, saga }
}

type Comp<T> = React.ComponentType<T> | React.Component<T> | React.FunctionComponent<T>
