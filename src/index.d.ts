import * as React from 'react';
import { Saga, ExtractAction, Action, StateMap, Dispatcher } from './types';
export { Saga, ExtractAction, Action };
export declare function createStore<TState, TAction extends Action>(name?: string): {
    dispatch: import("redux").Dispatch<TAction>;
    withState: <TFromState, TProps = {}>(map: StateMap<TState, TAction, TFromState>, comp: Comp<TFromState & TProps & {
        dispatch: Dispatcher<TAction>;
    }>) => React.FunctionComponent<TProps>;
    store: import("redux").Store<TState & {}, TAction>;
    createReducer<TAction_1 extends Action, TKey extends keyof TState>(key: TKey, init: TState[TKey]): <TType extends TAction_1["type"]>(type: TType, handler: void | Partial<TState[TKey]> | ((state: TState[TKey], action: Extract<TAction_1, {
        type: TType;
    }>) => void | Partial<TState[TKey]>)) => void;
    saga: <TType_1 extends TAction["type"]>(type: TType_1, handler: (action: Extract<TAction, {
        type: TType_1;
    }>, dispatch: (action: TAction) => void, getState: TState) => any) => void;
};
declare type Comp<T> = React.ComponentType<T> | React.Component<T> | React.FunctionComponent<T>;
