import { combineReducers } from 'redux';
import { BetReducer } from './betReducer';

const rootReducer = combineReducers({
	betReducer: BetReducer
})

export type ApplicationState = ReturnType<typeof rootReducer>;

export { rootReducer };
