import { store, withDispatch, withState } from './store'

/**
 * It is important to import our sagas after our store has been created.
 * I.e., we can only register our sagas after setup() has been called.
 * Otherwise the saga() function is called before it exists
 *
 * TypedState is designed this way so the saga() function is fully typed
 * without having to type it in user-land.
 */
import './saga'

export { store, withState, withDispatch }
