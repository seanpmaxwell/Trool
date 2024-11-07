import path from 'path';
import logger from 'jet-logger';
import Trool from '../../src';

import Ticket from './models/Ticket';
import Visitor from './models/Visitor';


const CSV_FILE_PATH = './VisitorRules.csv';

// Facts holder
interface IFactsHolder {
  Visitors: Visitor[];
  Tickets: Ticket[];
}

/**
 * Calculate total price for an array of visitors.
 */
async function addTicketToVisitors(
  visitors: Visitor | Visitor[],
  ticketOpt: Ticket['option'],
): Promise<Visitor[]> {
  // Apply rules
  visitors = (visitors instanceof Array) ? visitors : [visitors];
  try {
    const csvFilePathFull = path.join(__dirname, CSV_FILE_PATH),
      facts = _setupFactsHolder(visitors, ticketOpt),
      trool = new Trool();
    await trool.init(csvFilePathFull);
    const updatedFacts = trool.applyRules<IFactsHolder>(facts);
    _addTicketToVisitor(updatedFacts);
    return updatedFacts.Visitors;
  } catch (err) {
    logger.err(err, true);
  }
  // Failsafe return
  return [];
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
function _addTicketToVisitor(updatedFacts: IFactsHolder): void {
  const { Visitors, Tickets } = updatedFacts;
  Visitors.forEach((visitor, i) => {
    const ticket = Tickets[i];
    visitor.applyTicket(ticket);
  });
}


// **** Export default **** //

export default addTicketToVisitors;