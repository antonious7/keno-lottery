import { Dispatch } from 'redux';
import { BetAmount, LotteryNumbers, BetPlacement } from '../models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	NUMBER_PICK_LIMIT,
	ERROR_MESSAGES_INVALID_BET_AMOUNT,
	ERROR_MESSAGES_INVALID_NUMBERS
} from '../../constants/Lottery';

export interface UpdateBetAction {
	readonly type: 'ON_UPDATE_BET',
	payload: BetAmount
}

export interface PlacingBetAction {
	readonly type: 'ON_PLACING_BET',
	payload: BetPlacement
}

export interface PlacingBetActionSuccess {
	readonly type: 'ON_PLACING_BET_SUCCESS'
}

export interface PlacingBetActionError {
	readonly type: 'ON_PLACING_BET_ERROR',
	payload: any
}

export interface UpdateNumbersAction {
	readonly type: 'ON_UPDATE_NUMBERS',
	payload: LotteryNumbers
}

export type BetAction =
	UpdateNumbersAction
	| UpdateBetAction
	| PlacingBetAction
	| PlacingBetActionSuccess
	| PlacingBetActionError;

// Actions used inside the components

export const onPlacingBetAction = (betPlacement: BetPlacement) => {
	return async (dispatch: Dispatch<BetAction>) => {
		try {
			await AsyncStorage.setItem('betPlacement', JSON.stringify(betPlacement));
			dispatch({
				type: 'ON_PLACING_BET',
				payload: betPlacement
			})

			if (betPlacement.numbers.length < NUMBER_PICK_LIMIT) {
				let errorLimit = new Error();
				errorLimit.message = ERROR_MESSAGES_INVALID_NUMBERS;
				throw errorLimit;
			} else if (isNaN(Number(betPlacement.betAmount)) || betPlacement.betAmount < 1) {
				let errorBet = new Error();
				errorBet.message = ERROR_MESSAGES_INVALID_BET_AMOUNT;
				throw errorBet;
			} else {
				await AsyncStorage.removeItem('betPlacement');
				dispatch({
					type: 'ON_PLACING_BET_SUCCESS'
				})
			}
		} catch (error) {
			await AsyncStorage.mergeItem('betPlacement', JSON.stringify({error: error.message}));
			dispatch({
				type: 'ON_PLACING_BET_ERROR',
				payload: error.message
			})
		}
	}
}

export const onUpdateBet = (betAmount: BetAmount) => {
	return async (dispatch: Dispatch<BetAction>) => {
		await AsyncStorage.mergeItem('betPlacement', JSON.stringify({betAmount}));

		dispatch({
			type: 'ON_UPDATE_BET',
			payload: betAmount
		})
	}
}

export const onUpdateNumbers = (numbers: LotteryNumbers) => {
	return async (dispatch: Dispatch<BetAction>) => {
		const currentBet = await AsyncStorage.getItem('betPlacement');
		const currentBetParsed = {...JSON.parse(currentBet!), numbers};
		await AsyncStorage.setItem('betPlacement', JSON.stringify(currentBetParsed));
		dispatch({
			type: 'ON_UPDATE_NUMBERS',
			payload: numbers
		})
	}
}
