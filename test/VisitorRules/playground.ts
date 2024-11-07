import logger from 'jet-logger';

import Ticket from './models/Ticket';
import Visitor from './models/Visitor';
import addTicketToVisitors from './addTicketToVisitors';

import {
  singleVisitor,
  PartyOf3,
  PartyOf6,
  PartyOf10,
} from './data';


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
  visitors = await addTicketToVisitors(visitors, ticketOpt);
  let totalPrice = 0;
  visitors.forEach(visitor => {
    totalPrice += visitor.getTicketPrice();
    const ticketStr = visitor.getTicketStr();
    logger.info(ticketStr);
  });
  return ('$' + totalPrice.toFixed(2));
}

/**
 * Print total ticket price.
 */
function _print(total: string) {
  logger.info('Total Price: ' + total + '\n');
}
