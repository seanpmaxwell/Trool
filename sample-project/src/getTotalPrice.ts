/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import path from 'path';
import logger from 'jet-logger';
import Ticket, { ITicket } from './models/ticket';
import Visitor, { IVisitor } from './models/visitor';
import trool, { TFactsHolder } from 'trool';


interface IFactsHolder {
    Visitors: IVisitor[];
    Tickets: ITicket[];
}


const csvFilePath = 'rule-files/VisitorRules.csv';


/**
 * Calculate total price for an array of visitors.
 * 
 * @param visitors 
 * @param ticketOpt 
 * @param printDecisionTables 
 * @returns 
 */
export default async function calcTotalPrice(
    visitors: IVisitor | IVisitor[],
    ticketOpt: ITicket['option'],
    printDecisionTables?: boolean,
): Promise<string> {
    let totalPrice = 0;
    visitors = (visitors instanceof Array) ? visitors : [visitors];
    try {
        const csvFilePathFull = path.join(__dirname, csvFilePath);
        const facts = setupFactsHolder(visitors, ticketOpt);
        const engine = await trool(csvFilePathFull);
        const updatedFacts = engine.applyRules<IFactsHolder>(facts);
        totalPrice = addUpEachTicketPrice(updatedFacts);
        if (printDecisionTables) {
            logger.info(engine.decisionTables);
        }
    } catch (err) {
        logger.err(err);
        totalPrice = -1;
    }
    return '$' + totalPrice.toFixed(2);
}


/**
 * Setup factors holder. Add party size to each visitor.
 * 
 * @param visitors 
 * @param ticketOpt 
 * @returns 
 */
function setupFactsHolder(
    visitors: IVisitor[],
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
        Visitors: visitors,
    };
}


/**
 * Add up total ticket price.
 * 
 * @param updatedFacts
 * @returns 
 */
function addUpEachTicketPrice(updatedFacts: IFactsHolder): number {
    const { Visitors, Tickets } = updatedFacts;
    let totalPrice = 0;
    Visitors.forEach((visitor, i) => {
        const ticket = Tickets[i];
        Visitor.applyTicket(visitor, ticket);
        totalPrice += ticket.price;
        const ticketStr = Ticket.toString(ticket);
        logger.info(ticketStr)
    });
    return totalPrice;
}
