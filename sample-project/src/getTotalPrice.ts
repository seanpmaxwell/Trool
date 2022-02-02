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
        const updatedFacts = engine.applyRules(facts);
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
): TFactsHolder {
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
function addUpEachTicketPrice(updatedFacts: TFactsHolder): number {
    const { Visitors, Tickets } = updatedFacts;
    let totalPrice = 0;
    Visitors.forEach((visitor, i) => {
        const ticket = Tickets[i] as ITicket;
        Visitor.applyTicket(visitor as IVisitor, ticket);
        totalPrice += ticket.price;
        const ticketStr = Ticket.toString(ticket);
        logger.info(ticketStr)
    });
    return totalPrice;
}


// class PriceCalculator {

//     private readonly CSV_FILE = 'rule-files/VisitorRules.csv';


//     /**
//      * Calculate total price for an array of visitors.
//      *
//      * @param visitors
//      * @param ticketOpt
//      */
//     public async calcTotalPrice(
//         visitors: Visitor | Visitor[],
//         ticketOpt: ticketOpts,
//         printDecisionTables?: boolean,
//     ): Promise<string> {
//         let totalPrice = 0;
//         visitors = (visitors instanceof Array) ? visitors : [visitors];
//         try {
//             const csvFilePath = path.join(__dirname, this.CSV_FILE);
//             const facts = this.setupFactsHolder(visitors, ticketOpt);
//             const trool = new Trool();
//             await trool.init(csvFilePath, facts, true);
//             const updatedFacts = trool.applyRules();
//             totalPrice = this.addUpEachTicketPrice(updatedFacts);
//             if (printDecisionTables) {
//                 cinfo(trool.decisionTables);
//             }
//         } catch (err) {
//             cerr(err);
//             totalPrice = -1;
//         }
//         return '$' + totalPrice.toFixed(2);
//     }


//     private setupFactsHolder(visitors: Visitor[], ticketOpt: ticketOpts): IFactsHolder {
//         const tickets: Ticket[] = [];
//         visitors.forEach((visitor) => {
//             visitor.partySize = visitors.length;
//             tickets.push(new Ticket(ticketOpt));
//         });
//         return {
//             Tickets: tickets,
//             Visitors: visitors,
//         };
//     }


//     private addUpEachTicketPrice(factsObj: IFactsHolder): number {
//         const { Visitors, Tickets } = factsObj;
//         let totalPrice = 0;
//         Visitors.forEach((visitor: Visitor, i: number) => {
//             visitor.ticket = Tickets[i];
//             totalPrice += visitor.ticketPrice;
//             visitor.printTicket();
//         });
//         return totalPrice;
//     }
// }

// export default PriceCalculator;
