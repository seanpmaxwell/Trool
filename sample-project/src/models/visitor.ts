/**
 * Visitor class
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { ITicket } from './ticket';



export interface IVisitor {
    age: number;
    partySize: number;
    type: string;
    discount: number;
    freeTShirt: boolean;
    ticket?: ITicket;
    addToDiscount?: (additionalDiscount: number) => void;
}


/**
 * Create a new user object and append the addToDiscount method.
 * 
 * @param age 
 * @param partySize 
 * @param type 
 * @param discount 
 * @param freeTShirt 
 * @param ticket 
 * @returns 
 */
export function getNew(
    age?: number,
    partySize?: number,
    type?: string,
    discount?: number,
    freeTShirt?: boolean,
    ticket?: ITicket,
): IVisitor {
    return {
        age: age ?? 0,
        partySize: partySize ?? 1,
        type: type ?? '',
        discount: discount ?? 0,
        freeTShirt: freeTShirt ?? false,
        ticket,
        addToDiscount(additionalDiscount: number) {
            this.discount += additionalDiscount;
        }
    }
}


/**
 * Set the ticket for a visitor. Note the discount needs to be applied.
 * 
 * @param visitor 
 * @param ticket 
 */
export function applyTicket(visitor: IVisitor, ticket: ITicket): void {
    if (ticket) {
        ticket.freeTShirt = visitor.freeTShirt;
        ticket.visitorType = visitor.type;
        const discount = 1 - (visitor.discount / 100);
        ticket.price *= discount;
    }
    visitor.ticket = ticket;
}


// Export default
export default {
    new: getNew,
    applyTicket,
}


// class Visitor {

//     private readonly TICKET_FALSY_ERR = 'Ticket cannot be falsy if trying to get price';

//     private _age: number;
//     private _partySize: number;
//     private _visitorType: string;
//     private _discount: number;
//     private _freeTshirt: boolean;
//     private _ticket: Ticket | null;


//     constructor(age: number) {
//         this._age = age;
//         this._partySize = 1;
//         this._visitorType = '';
//         this._discount = 0;
//         this._freeTshirt = false;
//         this._ticket = null;
//     }


//     set age(age: number) {
//         this._age = age;
//     }


//     get age(): number {
//         return this._age;
//     }


//     set partySize(partySize: number) {
//         this._partySize = partySize;
//     }


//     get partySize() {
//         return this._partySize;
//     }


//     set discount(discount: number) {
//         this._discount = discount;
//     }


//     get discount(): number {
//         return this._discount;
//     }


//     set visitorType(visitorType: string) {
//         this._visitorType = visitorType;
//     }


//     get visitorType() {
//         return this._visitorType;
//     }


//     set freeTshirt(freeTshirt: boolean) {
//         this._freeTshirt = freeTshirt;
//     }


//     get freeTshirt(): boolean {
//         return this._freeTshirt;
//     }


//     set ticket(ticket: Ticket | null) {
//         if (ticket) {
//             ticket.freeTshirt = this.freeTshirt;
//             ticket.visitorType = this.visitorType;
//             const discount = 1 - (this.discount / 100);
//             ticket.price *= discount;
//         }
//         this._ticket = ticket;
//     }


//     get ticket(): Ticket | null {
//         return this._ticket;
//     }


//     get ticketPrice(): number {
//         if (this.ticket) {
//             return this.ticket.price;
//         } else {
//             throw Error(this.TICKET_FALSY_ERR);
//         }
//     }


//     public addToDiscount(additionalDiscount: number): void {
//         this._discount += additionalDiscount;
//     }


//     public printTicket(): void {
//         if (this.ticket) {
//             cinfo(this.ticket.toString());
//         } else {
//             cerr('User does not have a ticket set');
//         }
//     }
// }
