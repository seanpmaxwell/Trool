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
  // addToDiscount?: (additionalDiscount: number) => void;
}


// **** Visitor Class **** //

class Vistor implements IVisitor {

  public age: number;
  public partySize: number;
  public type: string;
  public discount: number;
  public freeTShirt: boolean;
  public ticket?: ITicket;

  /**
   * Constructor()
   */
  constructor(
    age?: number,
    partySize?: number,
    type?: string,
    discount?: number,
    freeTShirt?: boolean,
    ticket?: ITicket,
  ) {
    this.age = (age ?? 0);
    this.partySize = (partySize ?? 1);
    this.type = (type ?? '');
    this.discount = (discount ?? 0);
    this.freeTShirt = (freeTShirt ?? false);
    this.ticket = ticket;
  }

  /**
   * Add to discount
   */
  public addToDiscount(additionalDiscount: number) {
    this.discount += additionalDiscount;
  }

  /**
   * Apply Tickets
   */
  public applyTicket(ticket: ITicket): void {
    if (ticket) {
      ticket.freeTShirt = this.freeTShirt;
      ticket.visitorType = this.type;
      const discount = 1 - (this.discount / 100);
      ticket.price *= discount;
    }
    this.ticket = ticket;
  }
}


// **** Export default **** //

export default Vistor;
