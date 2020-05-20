export class Player {
    // Private id
    // Private bank ?
    id: string
    password: string
    bank: number

    constructor(id: string, password: string, bank: number) {
        this.id = id
        this.password = password
        this.bank = bank
    }
}