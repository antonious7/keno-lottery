export interface LotteryNumbers {
	numbers: number[]
}

export interface BetAmount {
	betAmount: any
}

export interface BetPlacement extends BetAmount, LotteryNumbers{}

export interface BetState extends BetPlacement{
	error: string
}
