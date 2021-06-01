import { Dispatch } from 'react'

export type Dispatcher<T extends Action> = (action: T) => void

export type StateMap<TState, TAction extends Action, TReturn> = (
  state: TState & { dispatch: Dispatcher<TAction> }
) => TReturn

export interface MiddlewareAPI<S, A extends Action> {
  dispatch: Dispatch<A>
  getState(): S
}

export interface Middleware<S, A extends Action> {
  (api: MiddlewareAPI<S, A>): (next: Dispatch<A>) => (action: any) => any
}

export type Saga<S, A extends Action> = Middleware<S, A>

export type Action = { type: string }

export type ExtractAction<U extends Action, T extends U['type']> = Extract<U, { type: T }>

export type HandleBody<S extends {}, A extends Action> = {
  [key in A['type']]?: (state: S, action: ExtractAction<A, key>) => Partial<S> | void
}
