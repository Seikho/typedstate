import { createReducer } from '../../src'

export { reducer }

type State = {
  isLoading: boolean
  name: string
  error?: string
}

type Action = { type: 'NESTED_REQ_ONE'; id: string } | { type: 'NESTED_REC_ONE'; nested: { id: string; name: string } }

const init: State = { isLoading: false, name: '' }

const { reducer } = createReducer<State, Action>(init, {
  NESTED_REQ_ONE: () => ({ isLoading: true }),
  NESTED_REC_ONE: (_, action) => ({ isLoading: false, name: action.nested.name }),
})
