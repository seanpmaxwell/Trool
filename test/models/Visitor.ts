/**
 * Visitor class
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { ITicket } from './Ticket';


// **** Types **** //

export interface IVisitor {
  age: number;
  partySize: number;
  type: string;
  discount: number;
  freeTShirt: boolean;
  ticket?: ITicket;
  addToDiscount?: (additionalDiscount: number) => void;
}


// **** Functions **** //

/**
 * Create a new user object and append the addToDiscount method.
 */
function _new(
  age?: number,
  partySize?: number,
  type?: string,
  discount?: number,
  freeTShirt?: boolean,
  ticket?: ITicket,
): IVisitor {
  return {
    age: (age ?? 0),
    partySize: (partySize ?? 1),
    type: (type ?? ''),
    discount: (discount ?? 0),
    freeTShirt: (freeTShirt ?? false),
    ticket,
    addToDiscount(additionalDiscount: number) {
      this.discount += additionalDiscount;
    },
  };
}

/**
 * Set the ticket for a visitor. Note the discount needs to be applied.
 */
function applyTicket(visitor: IVisitor, ticket: ITicket): void {
  if (ticket) {
    ticket.freeTShirt = visitor.freeTShirt;
    ticket.visitorType = visitor.type;
    const discount = 1 - (visitor.discount / 100);
    ticket.price *= discount;
  }
  visitor.ticket = ticket;
}


// **** Export default **** //

export default {
  new: _new,
  applyTicket,
} as const;
