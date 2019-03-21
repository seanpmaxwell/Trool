/**
 * Visitor class
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import Ticket from './Ticket';


class Visitor {

    private _age: number;
    private _discount: number;
    private _visitorType: string;
    private _partySize: number;


    constructor(age: number) {
        this._age = age;
        this._discount = 0;
        this._visitorType = '';
        this._partySize = 1;
    }

    set age(age: number) {
        this._age = age;
    }

    get age(): number {
        return this._age;
    }

    set discount(discount: number) {
        this._discount = discount;
    }

    get discount(): number {
        return this._discount;
    }

    set visitorType(visitorType: string) {
        this._visitorType = visitorType;
    }

    get visitorType() {
        return this._visitorType;
    }

    set partySize(partySize: number) {
        this._partySize = partySize;
    }

    get partySize() {
        return this._partySize;
    }


    set ticket(ticket: Ticket) {
        const price = ticket.price;
        // let discountedPrice = 100 - pick up, adjust price before setting
        // ticket.price = discountedPrice;
    }


    public getTicketPrice(): number {
        return this.ticket.price;
    }


    public addToDiscount(additionalDiscount: number): void {
        this._discount += additionalDiscount;
    }
}

export default Visitor;
