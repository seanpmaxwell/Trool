/**
 * Ticket class.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

class Ticket {

    private _option: TicketOpts;
    private _price: number;
    private _freeTshirt: boolean;


    constructor(option: TicketOpts) {
        this._option = option;
        this._price = 0;
        this._freeTshirt = false;
    }


    get price(): number {
        return this._price;
    }


    set price(price: number) {
        this._price = price;
    }


    set freeTshirt(freeTshirt: boolean) {
        this._freeTshirt = freeTshirt;
    }
}

export type TicketOpts = 'Regular' | 'Season' | null;
export default Ticket;
