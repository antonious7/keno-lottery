import { BetState } from '../models';
import { BetAction } from '../actions';

const initialState: BetState = {
	numbers: [],
	betAmount: '',
	error: ''
}

const BetReducer = (state: BetState = initialState, action: BetAction) => {

	switch (action.type) {
		case 'ON_UPDATE_BET':
			return {
				...state,
				betAmount: action.payload,
			}
		case 'ON_UPDATE_NUMBERS':
			return {
				...state,
				numbers: action.payload,
			}
		case 'ON_PLACING_BET':
			return {
				...state,
				numbers: action.payload.numbers,
				betAmount: action.payload.betAmount
			}

		case 'ON_PLACING_BET_ERROR':
			return {
				...state,
				error: action.payload
			}
		case 'ON_PLACING_BET_SUCCESS':
			return initialState;
		default:
			return state;
	}
}

export { BetReducer }
