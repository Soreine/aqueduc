import * as Redux from 'redux';

/*
 * Create a fake identity store to cache data.
 */
function createTestStore() {
    return Redux.createStore(
        (state, action) => {
            if (action.type != 'set') {
                return state;
            }

            return {
                ...state,
                [action.key]: action.value
            };
        },
        {}
    );
}

export default createTestStore;
