// **** Types **** //

export interface ITicket {
  option: 'Regular' | 'Season' | null;
  visitorType: string;
  price: number;
  freeTShirt: boolean;
}


// **** Functions **** //

/**
 * Get a new ticket object.
 */
function new_(
  option?: ITicket['option'],
  visitorType?: string,
  price?: number,
  freeTShirt?: boolean,
): ITicket {
  return {
    option: (option ?? 'Regular'),
    visitorType: (visitorType ?? ''),
    price: (price ?? 0),
    freeTShirt: (freeTShirt ?? false),
  };
}

/**
 * Convert ticket to a string.
 */
function toString(ticket?: ITicket): string {
  if (!ticket) {
    return 'Ticket value undefined';
  }
  return `Ticket Option: ${ticket.option} | ` +
    `Visitor Type: ${ticket.visitorType} | ` +
    `Ticket Price: $${ticket.price} | ` +
    `Free T-Shirt: ${ticket.freeTShirt}`;
}


// **** Export default **** //

export default {
  new: new_,
  toString,
} as const;
