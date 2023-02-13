// **** Types **** //

export interface ITicket {
  option: 'Regular' | 'Season' | null;
  visitorType: string;
  price: number;
  freeTShirt: boolean;
}


// **** Ticket Class **** //

class Ticket implements ITicket {

  public option: 'Regular' | 'Season' | null;
  public visitorType: string;
  public price: number;
  public freeTShirt: boolean;

  /**
   * Constructor()
   */
  constructor(
    option?: ITicket['option'],
    visitorType?: string,
    price?: number,
    freeTShirt?: boolean,
  ) {
    this.option = (option ?? null);
    this.visitorType = (visitorType ?? '');
    this.price = (price ?? 0);
    this.freeTShirt = !!freeTShirt;
  }

  /**
   * Ticket to string
   */
  public toString(): string {
    return `Ticket Option: ${this.option} | ` +
    `Visitor Type: ${this.visitorType} | ` +
    `Ticket Price: $${this.price} | ` +
    `Free T-Shirt: ${this.freeTShirt}`;
  }
}


// **** Export default **** //

export default Ticket;
