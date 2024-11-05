import Ticket from './Ticket';


class Visitor {

  public age: number;
  public partySize: number;
  public type: string;
  public discount: number;
  public freeTShirt: boolean;
  public ticket?: Ticket;
  
  /**
   * Constructor()
   */
  public constructor(
    age?: number,
    partySize?: number,
    type?: string,
    discount?: number,
    freeTShirt?: boolean,
    ticket?: Ticket,
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
  public applyTicket(ticket: Ticket): void {
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

export default Visitor;
