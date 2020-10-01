# TypedState

> A React/Redux wrapper to reduce boilerplate and increase type safety and productivity

## Why?

After using React with Redux, I found that using `connect`, creating reducers, and sagas required a lot of boilerplate.  
In order to get the type safety I wanted, I would regularly have to modify old code to do so.

**TypedState** is an attempt to reduce the amount of effort introducing React and Redux into a project and to make it easier to use without being burdened by passing types around.

## Benefits

Reducers, sagas, and components gain a huge amount of type safety and type inference.  
Action types, state

## Example Setup

See the `example` folder.

## API

### createStore()

Returns `setup` and `saga` functions

```ts
import { createStore } from 'typedstate'

function createStore(name: string, reducers: { [key: string]: Reducer })
```

### createReducer()

Returns `handle` and `reducer` functions.  
The `reducer` _must_ be exported and passed to the `createStore` function.

```ts
import { createReducer } from 'typedstate'

function createReducer<State, Action>(initState: State)
```

### setup()

Returns the Redux `store` and the `withState` and `withDispatch` hooks.  
Think of `withState` as a wrapper of the react-redux `connect` function.

See `examples/App.tsx` for several examples.
