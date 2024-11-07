import { expect, test } from 'vitest';

import Ticket from './models/Ticket';
import Visitor from './models/Visitor';
import addTicketToVisitors from './addTicketToVisitors';

import {
  singleVisitor,
  PartyOf3,
  PartyOf6,
  PartyOf10,
} from './data';


// Run unit-tests
test('ticket price for different party sizes', async () => {

  // Single visitor Regular ticket
  const totalPrice1 = await getTotalPrice(singleVisitor, 'Regular');
  expect(totalPrice1).toStrictEqual(49);
  expect(singleVisitor.freeTShirt).toStrictEqual(false);

  // Season ticket party of 3
  const totalPrice2 = await getTotalPrice(PartyOf3, 'Season');
  expect(totalPrice2).toStrictEqual(1530);
  expect(PartyOf3[0].freeTShirt).toStrictEqual(false);

  // Regular ticket party of 6
  const totalPrice3 = await getTotalPrice(PartyOf6, 'Regular');
  expect(totalPrice3).toStrictEqual(346.50);
  expect(PartyOf6[0].freeTShirt).toStrictEqual(false);

  // Regular ticket party of 10
  const totalPrice4 = await getTotalPrice(PartyOf10, 'Regular');
  expect(totalPrice4).toStrictEqual(598.50);
  expect(PartyOf10[0].freeTShirt).toStrictEqual(true);
});

/**
 * Calculate total price for an array of visitors.
 */
async function getTotalPrice(
  visitors: Visitor | Visitor[],
  ticketOpt: Ticket['option'],
): Promise<number> {
  visitors = await addTicketToVisitors(visitors, ticketOpt);
  let totalPrice = 0;
  visitors.forEach(visitor => {
    totalPrice += visitor.getTicketPrice();
  });
  return totalPrice;
}
