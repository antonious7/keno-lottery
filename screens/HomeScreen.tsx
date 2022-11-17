import React from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View, } from 'react-native';
import Modal from 'react-native-modalbox';
import Colors from '../constants/Colors';
import { Text } from '../components/Themed';
import { NUMBER_PICK_LIMIT, TOTAL_NUMBER_SQUARES } from '../constants/Lottery';
import useColorScheme from '../hooks/useColorScheme';

export default function HomeScreen() {
	const colorScheme = useColorScheme();
	const numbers = Array.from(Array(TOTAL_NUMBER_SQUARES), (_, index) => index + 1);
	const usualBets = [ 1, 2, 5, 10, 20, 50 ];
	const selectedPlaceholderNums: any[] = [ '?', '?', '?', '?', '?' ];
	const [ selectedNumbers, setSelectedNumbers ] = React.useState<number[]>([]);
	const modal = React.useRef<Modal>(null);
	const [ stake, setStake ] = React.useState('');
	const [ isValidAmount, setIsValidAmount ] = React.useState(true)
	const [ isValidPick, setIsValidPick ] = React.useState(true)


	const handleSelectedNumber = (number: number) => {
		setSelectedNumbers((prevState) => {
			if (prevState.includes(number)) {
				const index = prevState.indexOf(number);
				prevState.splice(index, 1);
			} else if (selectedNumbers.length < NUMBER_PICK_LIMIT) {
				prevState.push(number);
			}
			return [ ...prevState ];
		});
	};
	const clearState = () => {
		setSelectedNumbers([]);
		setStake('');
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
		const isNumeric = !isNaN(Number(stake))
		if (!isNumeric || Number(stake) < 1) {
			setIsValidAmount(false)
			modal.current?.open()
		}
		if (selectedNumbers.length < NUMBER_PICK_LIMIT) {
			setIsValidPick(false)
		}
		if (isNumeric && Number(stake) > 0 && selectedNumbers.length === NUMBER_PICK_LIMIT) {
			setIsValidAmount(true)
			setIsValidPick(true)
			modal.current?.open()
		}
		clearState();
	};

	const onSelectStake = (item: number) => {
		if (!isValidAmount) {
			setIsValidAmount(true)
		}
		setStake(item.toString())
	};

	const onQuickPickPress = React.useCallback(() => {
		const luckyNumbers = generateRandomNumber(NUMBER_PICK_LIMIT);
		setSelectedNumbers(luckyNumbers);
	}, []);


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
						{selectedNumbers.length
							? selectedNumbers.map((item) => (
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

				{numbers.map((item, index) => {
						const numColumns = 8
						if (index % numColumns != 0) return null
						let row: JSX.Element[] = []
						for (let i = index; i < index + numColumns; i++) {
							if (numbers.length > i) {
								row.push(
									<TouchableOpacity
										key={numbers[ i ]}
										style={[
											styles.number,
											selectedNumbers.includes(numbers[ i ]) && styles.numberActive,
										]}
										onPress={(e) => handleSelectedNumber(numbers[ i ])}
									>
										<Text
											style={[
												styles.numberText,
												selectedNumbers.includes(numbers[ i ]) && styles.numberTextActive,
											]}
										>
											{numbers[ i ]}
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
										stake === item.toString() && {backgroundColor: Colors[ colorScheme ].buttonBackgroundActive}
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
							value={stake}
							onChangeText={setStake}
							keyboardType="numeric"
							style={[ styles.textInput, {color: Colors[ colorScheme ].color, borderColor: Colors[ colorScheme ].color, borderWidth: 1, borderStyle: 'solid'} ]}
							placeholder="Enter Stake"
						/>
						<TouchableOpacity
							disabled={selectedNumbers.length < NUMBER_PICK_LIMIT || !stake}
							style={[
								styles.button,
								{backgroundColor: Colors[ colorScheme ].buttonBackground},
								selectedNumbers.length < NUMBER_PICK_LIMIT || !stake
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
				{
					isValidAmount && isValidPick && <Text style={{color: 'green', fontSize: 22}}>Success</Text>}
				{
					!isValidPick && <Text
						style={{color: 'red'}}>
						Please select {NUMBER_PICK_LIMIT} numbers
					</Text>
				}
				{
					!isValidAmount && <Text
						style={{color: 'red'}}>
						Please set a valid bet
					</Text>
				}
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 24,
	},
	header: {
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
