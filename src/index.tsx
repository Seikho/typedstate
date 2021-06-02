import * as React from 'react'
import { Saga, ExtractAction, Action, StateMap, Dispatcher, HandleBody } from './types'
import { createStore as createRedux, applyMiddleware, Store } from 'redux'
import { connect } from 'react-redux'

export { Saga, ExtractAction, Action }

let composeWithDevTools: any
try {
  composeWithDevTools = require('redux-devtools-extension').composeWithDevTools
} catch {}

type Reducer<S = any, A extends { type: string } = any> = (state: S | undefined, action: A) => S

type ExtractActions<TAction> = TAction extends (state: any, action: infer A) => any ? A : never

export function createStore<TTree extends { [key: string]: Reducer }>(
  name: string = 'main',
  tree: TTree
) {
  type Reducers = TTree[keyof TTree]
  type Action = ExtractActions<Reducers>
  type State = { [K in keyof TTree]: ReturnType<TTree[K]> }

  const initState: State = {} as any

  for (const key in tree) {
    initState[key] = tree[key](undefined, { type: '@@INIT' })
  }

  const reducers = Object.entries(tree)

  // We will use this to make our reducers in user-land declarative.
  // Calling handle('TYPE', ...) will register the handler here
  const reduce = (state: State | undefined, action: Action): State => {
    let nextState: any = state ? { ...state } : { ...initState }
    for (const [key, reducer] of reducers) {
      const subState = reducer(nextState[key] as any, action) as any
      nextState[key] = subState
    }
    return nextState
  }

  const saga = createSaga<State, Action>()

  const store: Store<State, Action> = createRedux<State, Action, {}, {}>(
    reduce,
    composeWithDevTools
      ? composeWithDevTools({
          name: `${name} - (${window.location.hostname}) `,
        })(applyMiddleware(saga.saga))
      : applyMiddleware(saga.saga)
  )

  function withState<TFromState, TProps = {}>(
    map: StateMap<State, Action, TFromState>,
    comp: Comp<TFromState & TProps & { dispatch: Dispatcher<Action> }>
  ): React.FunctionComponent<TProps> {
    const Child = connect<TFromState, State, TProps, State>((state) => ({
      ...map({ ...state, dispatch: store.dispatch }),
      dispatch: store.dispatch,
    }))(comp as any)
    return (props: TProps) => <Child {...props} />
  }

  function withDispatch<TProps = {}>(
    comp: Comp<TProps & { dispatch: Dispatcher<Action> }>
  ): React.FunctionComponent<TProps> {
    return withState(() => ({}), comp)
  }

  const setup = () => ({ store, withState, withDispatch })

  return {
    setup,
    saga: saga.handle,
    sagaBody: saga.handleBody,
  }
}

export function createReducer<TState, TAction extends Action>(
  init: TState,
  handler?: HandleBody<TState, TAction>
) {
  type TReturn = Partial<TState> | void

  const handlers = new Map<TAction['type'], any>()

  if (handler) {
    for (const [key, func] of Object.entries(handler)) {
      handlers.set(key, func)
    }
  }

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

  const reducer: Reducer<TState, TAction> = (state = init, action) => {
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

  const saga: Saga<TState, TAction> =
    ({ dispatch, getState }) =>
    (next) =>
    async (action: TAction) => {
      next(action)

      const handlers = typeHandlers.get(action.type)
      if (!handlers) return

      for (const handler of handlers) {
        // We only retrieve state if three parameters are passed to a saga handler
        // I.e. saga('TYPE', (action, dispatch, state) => ...)
        if (handler.length === 3) {
          const state = getState()
          handler(action, dispatch, state)
          continue
        }

        handler(action, dispatch)
      }

      // TODO: What to do for default error handling?
    }

  type Dispatch = (action: TAction) => void

  type SagaHandler<TType extends TAction['type']> = (
    action: ExtractAction<TAction, TType>,
    dispatch: Dispatch,
    state: TState
  ) => any

  const handle = <TType extends TAction['type']>(type: TType, handler: SagaHandler<TType>) => {
    if (!typeHandlers.has(type)) {
      typeHandlers.set(type, [])
    }

    const typeHandler = typeHandlers.get(type)!
    typeHandler.push(handler)
    typeHandlers.set(type, typeHandler)
  }

  const handleBody = (body: { [key in TAction['type']]?: SagaHandler<key> }) => {
    for (const [type, func] of Object.entries(body)) {
      if (!typeHandlers.has(type)) {
        typeHandlers.set(type, [])
      }

      const typeHandler = typeHandlers.get(type)!
      typeHandler.push(func as any)
      typeHandlers.set(type, typeHandler)
    }
  }

  return { handle, saga, handleBody }
}

type Comp<T> = React.ComponentType<T> | React.Component<T> | React.FunctionComponent<T>
