/**
 * Ticket class.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

export type ticketOpts = 'Regular' | 'Season' | null;

class Ticket {

    private _option: ticketOpts;
    private _price: number;
    private _freeTshirt: boolean;


    constructor(option: ticketOpts) {
        this._option = option;
        this._price = 0;
        this._freeTshirt = false;
    }

    get option(): ticketOpts {
        return this._option;
    }

    set option(option: ticketOpts) {
        this._option = option;
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

export default Ticket;
