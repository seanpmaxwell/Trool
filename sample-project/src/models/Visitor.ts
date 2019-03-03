/**
 * Visitor class
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import Ticket from './Ticket';


type VisitorTypes = 'Adult' | 'Senior' | 'Child' | null;

class Visitor {

    private _age: number;
    private _discount: number;
    private _visitorType: VisitorTypes;
    private _partySize: number;


    constructor(age: number) {
        this._age = age;
        this._discount = 0;
        this._visitorType = null;
        this._partySize = 1
    }


    set visitorType(visitorType: VisitorTypes) {
        this._visitorType = visitorType;
    }


    set partySize(partySize: number) {
        this._partySize = partySize;
    }


    set ticket(ticket: Ticket) {
        let price = ticket.price;
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
