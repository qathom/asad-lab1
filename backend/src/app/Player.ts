export class Player {
    // Private id
    // Private bank ?
    id: string
    bank: number
    currentAmountBetted: number

    constructor(id: string) {
        this.id = id
        this.bank = 10
        this.currentAmountBetted = 0
    }

    canBet(amount): Boolean{
        return (this.currentAmountBetted + amount) <= this.bank
    } 
}