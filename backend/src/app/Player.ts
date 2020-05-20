export class Player {
    // Private id
    // Private bank ?
    id: string
    password: string
    bank: number
    currentAmountBetted: number

    constructor(id: string, password: string, bank: number) {
        this.id = id
        this.password = password
        this.bank = bank
        this.currentAmountBetted = 0
    }

    canBet(amount): Boolean{
        return (this.currentAmountBetted + amount) <= this.bank
    } 
}