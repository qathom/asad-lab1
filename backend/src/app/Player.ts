export class Player {
    // Private id
    // Private bank ?
    id: string
    password: string
    bank: number

    constructor(id: string, password: string) {
        this.id = id
        this.password = password
        this.bank = 10
    }
}