import {
    createStore as createReduxStore,
    applyMiddleware
} from 'redux';
import { ofType, createEpicMiddleware } from 'redux-observable';
import { switchMap, pluck, map } from 'rxjs/operators';
import { from } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// EPIC
const fetchList = () =>
    from(ajax({
        url: '/list.json',
        method: 'GET',
    })).pipe(
        pluck('response'),
        map(listLoaded),
    );

const epic = action => action.pipe(
    ofType('LOAD_LIST'),
    switchMap(fetchList)
);

const epicMiddleware = createEpicMiddleware();

// REDUCER
const initialState = {
    wholeList: [],
    currentList: [],
    budget: 0,
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
        case 'BUDGET_UPDATED': {
            return {
                ...state,
                budget: action.payload,
                currentList: state.wholeList.filter(item => item.price <= action.payload)
            };
        }

        case 'LIST_LOADED': {
            return {
                ...state,
                wholeList: action.payload,
                currentList: action.payload,
            }
        }

        default: {
            return state;
        }
    }
};

//CREATE STORE
function createStore() {
    const enhancer = applyMiddleware(epicMiddleware);
    const store =  createReduxStore(reducer, enhancer);
    epicMiddleware.run(epic);
    return store;
}

const store = createStore();
export default store;

export const budgetUpdated = budget => ({
    type: 'BUDGET_UPDATED',
    payload: budget
});

export const listLoaded = budget => ({
    type: 'LIST_LOADED',
    payload: budget
});

export const loadList = list => ({
    type: 'LOAD_LIST',
    payload: list
});