import path from 'path';
import logger from 'jet-logger';
import Trool from '../../src';

import Ticket from './models/Ticket';
import Visitor from './models/Visitor';

import {
  singleVisitor,
  PartyOf3,
  PartyOf6,
  PartyOf10,
  CSV_FILE_PATH,
} from './data';


// Facts holder
interface IFactsHolder {
  Visitors: Visitor[];
  Tickets: Ticket[];
}

/**
 * Start
 */
(async () => {
  let totalPrice = await getTotalPrice(singleVisitor, 'Regular');
  _print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf3, 'Season');
  _print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf6, 'Regular');
  _print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf10, 'Regular');
  _print(totalPrice);
})();

/**
 * Calculate total price for an array of visitors.
 */
async function getTotalPrice(
  visitors: Visitor | Visitor[],
  ticketOpt: Ticket['option'],
): Promise<string> {
  let totalPrice = 0;
  visitors = (visitors instanceof Array) ? visitors : [visitors];
  try {
    const csvFilePathFull = path.join(__dirname, CSV_FILE_PATH),
      facts = _setupFactsHolder(visitors, ticketOpt),
      trool = new Trool();
    await trool.init(csvFilePathFull);
    const updatedFacts = trool.applyRules<IFactsHolder>(facts);
    totalPrice = _addUpEachTicketPrice(updatedFacts);
  } catch (err) {
    logger.err(err, true);
    totalPrice = -1;
  }
  return ('$' + totalPrice.toFixed(2));
}

/**
 * Setup factors holder. Add party size to each visitor.
 */
function _setupFactsHolder(
  visitors: readonly Visitor[],
  ticketOpt: Ticket['option'],
): IFactsHolder {
  const tickets: Ticket[] = [];
  visitors.forEach((visitor) => {
    visitor.partySize = visitors.length;
    const ticket = new Ticket(ticketOpt);
    tickets.push(ticket);
  });
  return {
    Tickets: tickets,
    Visitors: [...visitors],
  };
}

/**
 * Add up total ticket price.
 */
function _addUpEachTicketPrice(updatedFacts: IFactsHolder): number {
  const { Visitors, Tickets } = updatedFacts;
  let totalPrice = 0;
  Visitors.forEach((visitor, i) => {
    const ticket = Tickets[i];
    visitor.applyTicket(ticket);
    totalPrice += ticket.price;
    const ticketStr = ticket.toString();
    logger.info(ticketStr);
  });
  return totalPrice;
}

/**
 * Print total ticket price.
 */
function _print(total: string) {
  logger.info('Total Price: ' + total + '\n');
}
