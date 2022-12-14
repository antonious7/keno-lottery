import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native';
import Modal from 'react-native-modalbox';
import Colors from '../constants/Colors';
import { Text } from '../components/Themed';
import { BET_PLACEMENT_SUCCESS, NUMBER_PICK_LIMIT, TOTAL_NUMBER_SQUARES } from '../constants/Lottery';
import useColorScheme from '../hooks/useColorScheme';
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import { ApplicationState, BetState, onPlacingBetAction, onUpdateBet, onUpdateNumbers } from '../redux';

export interface HomeScreenProps {
	onPlacingBetAction: Function,
	onUpdateBet: Function,
	onUpdateNumbers: Function,
	betReducer: BetState,
}

const _HomeScreen: React.FC<HomeScreenProps> = (props) => {
	const colorScheme = useColorScheme();
	const {onPlacingBetAction, onUpdateBet, onUpdateNumbers, betReducer} = props;
	const lotteryNumbers = Array.from(Array(TOTAL_NUMBER_SQUARES), (_, index) => index + 1);
	const usualBets = [ 1, 2, 5, 10, 20, 50 ];
	const selectedPlaceholderNums: any[] = [ '?', '?', '?', '?', '?' ];
	const { numbers, betAmount, error } = betReducer;
	const modal = React.useRef<Modal>(null);


	const handleSelectedNumber = (number: number) => {
		const prevState = numbers;

		if (prevState.includes(number)) {
			const index = prevState.indexOf(number);
			prevState.splice(index, 1);
		} else if (numbers.length < NUMBER_PICK_LIMIT) {
			prevState.push(number);
		}
		onUpdateNumbers(prevState);
	};

	const generateRandomNumber = (size: number) => {
		const randomNumbers = [];
		while (randomNumbers.length < size) {
			const random = Math.floor(Math.random() * TOTAL_NUMBER_SQUARES) + 1;
			if (randomNumbers.indexOf(random) === -1) randomNumbers.push(random);
		}
		return randomNumbers;
	};

	const handlePlaceBetEvent = () => {
		onPlacingBetAction({numbers: numbers, betAmount: betAmount});
		modal.current?.open();
	};

	const onSelectStake = (item: number) => {
		onUpdateBet(item.toString());
	};

	const onManualSelectStake = (item: string) => {
		debouncedManualBetUpdate(item);
	};

	const debouncedManualBetUpdate = React.useRef(
		debounce(async (item: string) => {
			onUpdateBet(item);
		}, 300)
	).current;

	const onQuickPickPress = () => {
		const luckyNumbers = generateRandomNumber(NUMBER_PICK_LIMIT);
		onUpdateNumbers(luckyNumbers);
	};

	React.useEffect(() => {
		return () => {
			debouncedManualBetUpdate.cancel();
		};
	}, [ debouncedManualBetUpdate ]);


	return (
		<ScrollView>
			<View style={styles.container}>
				<View style={styles.header}>
					<View>
						<Text style={[ styles.title, {color: Colors[ colorScheme ].tint} ]}>Choose</Text>
						<Text style={styles.subTitle}>{NUMBER_PICK_LIMIT} numbers</Text>
					</View>
					<View>
						<Text style={styles.subTitle}>or</Text>
					</View>
					<TouchableOpacity style={[ styles.button, {backgroundColor: Colors[ colorScheme ].buttonBackground} ]}
											onPress={onQuickPickPress}>
						<Text style={styles.buttonText}>Lucky Pick</Text>
					</TouchableOpacity>
				</View>

				<View
					style={[ styles.selectedNumbersContainer, {backgroundColor: Colors[ colorScheme ].secondaryBackground} ]}>
					<Text style={[ styles.selectedNumbersTitle, {color: Colors[ colorScheme ].secondaryText} ]}>
						Selected Numbers
					</Text>
					<View
						style={[ styles.grid, styles.selectedNumbers, {backgroundColor: Colors[ colorScheme ].secondaryBackground} ]}>
						{numbers.length
							? numbers.map((item: number) => (
								<TouchableOpacity
									key={item}
									style={styles.selectedNumber}
									onPress={(e) => handleSelectedNumber(item)}
								>
									<Text style={styles.numberText}>{item}</Text>
								</TouchableOpacity>
							))
							: selectedPlaceholderNums.map((item, index) => (
								<Text
									key={index}
									style={[
										styles.selectedNumber,
										{shadowOpacity: 0, backgroundColor: Colors[ colorScheme ].secondaryBackgroundTint, color: Colors[ colorScheme ].secondaryText}
									]}
								>
									{item}
								</Text>
							))}
					</View>
				</View>

				{lotteryNumbers.map((item, index) => {
						const numColumns = 8
						if (index % numColumns != 0) return null
						let row: JSX.Element[] = []
						for (let i = index; i < index + numColumns; i++) {
							if (lotteryNumbers.length > i) {
								row.push(
									<TouchableOpacity
										key={lotteryNumbers[ i ]}
										style={[
											styles.number,
											numbers.includes(lotteryNumbers[ i ]) && styles.numberActive,
										]}
										onPress={(e) => handleSelectedNumber(lotteryNumbers[ i ])}
									>
										<Text
											style={[
												styles.numberText,
												numbers.includes(lotteryNumbers[ i ]) && styles.numberTextActive,
											]}
										>
											{lotteryNumbers[ i ]}
										</Text>
									</TouchableOpacity>
								)
							}
						}
						return (
							<View key={index} style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
								{row}
							</View>
						)
					}
				)}

				<View style={styles.footer}>
					<View
						style={styles.regularBets}>
						{
							usualBets.map(item => (
								<TouchableOpacity
									style={[
										styles.betButton,
										{backgroundColor: Colors[ colorScheme ].buttonBackground},
										betAmount === item.toString() && {backgroundColor: Colors[ colorScheme ].buttonBackgroundActive}
									]}
									key={item}
									onPress={(e) => onSelectStake(item)}
								>
									<Text
										style={[
											styles.buttonText,
										]}>
										Bet {item}$
									</Text>
								</TouchableOpacity>
							))
						}
					</View>
					<View
						style={styles.manualBetContainer}>
						<TextInput
							value={betAmount}
							onChangeText={onManualSelectStake}
							keyboardType="numeric"
							style={[ styles.textInput, {color: Colors[ colorScheme ].color, borderColor: Colors[ colorScheme ].color, borderWidth: 1, borderStyle: 'solid'} ]}
							placeholder="Enter Stake"
						/>
						<TouchableOpacity
							disabled={numbers.length < NUMBER_PICK_LIMIT || !betAmount}
							style={[
								styles.button,
								{backgroundColor: Colors[ colorScheme ].buttonBackground},
								numbers.length < NUMBER_PICK_LIMIT || !betAmount
									? {backgroundColor: Colors[ colorScheme ].buttonBackgroundDisabled, opacity: 0.3}
									: null,
							]}
							onPress={handlePlaceBetEvent}
						>
							<Text style={styles.buttonText}>Place Bet</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			<Modal
				style={[ styles.modal ]}
				ref={modal}
				swipeToClose={true}
				position="center"
			>
				{!error && <Text style={{color: 'green', fontSize: 22}}>{BET_PLACEMENT_SUCCESS}</Text>}
				{!!error && <Text style={{color: 'red', fontSize: 14}}>{error}</Text>}
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 24,
	},
	header: {
		paddingTop: 14,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginVertical: 12,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	subTitle: {
		fontSize: 24,
	},
	selectedNumbersContainer: {
		paddingVertical: 16,
		marginHorizontal: -24,
		marginBottom: 24,
		display: 'flex',
		alignItems: 'center',
	},
	selectedNumbers: {
		justifyContent: 'center',
	},
	selectedNumbersTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 16,
	},
	selectedNumber: {
		width: 45,
		height: 45,
		paddingVertical: 12,
		paddingHorizontal: 8,
		marginHorizontal: 8,
		backgroundColor: 'white',
		borderRadius: 24,
		shadowColor: '#171717',
		shadowOffset: {width: -2, height: 4},
		shadowOpacity: 0.2,
		shadowRadius: 3,
		textAlign: 'center',
		overflow: 'hidden',
	},
	button: {
		paddingHorizontal: 32,
		paddingVertical: 12,
		borderRadius: 4,
	},
	betButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		marginHorizontal: 4,
		marginVertical: 4,
		borderRadius: 4,
	},
	buttonText: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	grid: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	number: {
		width: 40,
		backgroundColor: '#f4f5fc',
		padding: 8,
		margin: 8,
		borderRadius: 24,
	},
	numberText: {
		textAlign: 'center',
		fontWeight: 'bold',
		fontSize: 18,
		color: '#4f5182',
		borderRadius: 24,
	},
	numberActive: {
		backgroundColor: '#ff5a5e',
	},
	numberTextActive: {
		color: 'white',
		backgroundColor: '#ff5a5e',
		borderRadius: 24,
	},
	footer: {
		marginTop: 14,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	regularBets: {
		width: '100%',
		flex: 1,
		alignItems: 'stretch',
		flexWrap: 'wrap',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginHorizontal: 8,
		marginVertical: 8
	},
	manualBetContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignContent: 'flex-end',
		justifyContent: 'space-between',
		marginVertical: 8
	},
	textInput: {
		marginLeft: 8,
		marginRight: 8,
		borderWidth: 1,
		padding: 12,
		minWidth: 150,
		borderRadius: 4,
	},
	modal: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 150,
		width: 150,
		borderRadius: 15
	},
});

const mapStateToProps = (state: ApplicationState) => ({
	betReducer: state.betReducer,
})

const HomeScreen = connect(mapStateToProps, {onPlacingBetAction, onUpdateBet, onUpdateNumbers})(_HomeScreen);

export { HomeScreen };
