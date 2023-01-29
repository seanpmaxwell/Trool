/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import path from 'path';
import logger from 'jet-logger';

import Ticket, { ITicket } from './models/Ticket';
import Visitor, { IVisitor } from './models/Visitor';
import trool from '../lib';


// **** Variables **** //

const CSV_FILE_PATH = './VisitorRules.csv';


// **** Types **** //

interface IFactsHolder {
  Visitors: IVisitor[];
  Tickets: ITicket[];
}


// **** Functions **** //

/**
 * Calculate total price for an array of visitors.
 */
async function calcTotalPrice(
  visitors: IVisitor | readonly IVisitor[],
  ticketOpt: ITicket['option'],
  printDecisionTables?: boolean,
): Promise<string> {
  let totalPrice = 0;
  visitors = (visitors instanceof Array) ? visitors : [visitors];
  try {
    const csvFilePathFull = path.join(__dirname, CSV_FILE_PATH),
      facts = _setupFactsHolder(visitors, ticketOpt),
      engine = await trool(csvFilePathFull),
      updatedFacts = engine.applyRules<IFactsHolder>(facts);
    totalPrice = _addUpEachTicketPrice(updatedFacts);
    if (printDecisionTables) {
      logger.info(engine.decisionTables);
    }
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
  visitors: readonly IVisitor[],
  ticketOpt: ITicket['option'],
): IFactsHolder {
  const tickets: ITicket[] = [];
  visitors.forEach((visitor) => {
    visitor.partySize = visitors.length;
    const ticket = Ticket.new(ticketOpt);
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
    Visitor.applyTicket(visitor, ticket);
    totalPrice += ticket.price;
    const ticketStr = Ticket.toString(ticket);
    logger.info(ticketStr);
  });
  return totalPrice;
}


// **** Export default **** //

export default calcTotalPrice;
