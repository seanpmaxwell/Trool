/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as path from 'path';
import { cinfo, cerr } from 'simple-color-print';
import { ticketOpts } from './models/Ticket';

import Trool, { IFactsHolder } from 'trool';
import Ticket from './models/Ticket';
import Visitor from './models/Visitor';



class PriceCalculator {

    private readonly CSV_FILE = 'rule-files/VisitorRules.csv';


    /**
     * Calculate total price for an array of visitors.
     *
     * @param visitors
     * @param ticketOpt
     */
    public async calcTotalPrice(
        visitors: Visitor | Visitor[],
        ticketOpt: ticketOpts,
        printDecisionTables?: boolean,
    ): Promise<string> {
        let totalPrice = 0;
        visitors = (visitors instanceof Array) ? visitors : [visitors];
        try {
            const csvFilePath = path.join(__dirname, this.CSV_FILE);
            const facts = this.setupFactsHolder(visitors, ticketOpt);
            const trool = new Trool();
            await trool.init(csvFilePath, facts, true);
            const updatedFacts = trool.applyRules();
            totalPrice = this.addUpEachTicketPrice(updatedFacts);
            if (printDecisionTables) {
                cinfo(trool.decisionTables);
            }
        } catch (err) {
            cerr(err);
            totalPrice = -1;
        }
        return '$' + totalPrice.toFixed(2);
    }


    private setupFactsHolder(visitors: Visitor[], ticketOpt: ticketOpts): IFactsHolder {
        const tickets: Ticket[] = [];
        visitors.forEach((visitor) => {
            visitor.partySize = visitors.length;
            tickets.push(new Ticket(ticketOpt));
        });
        return {
            Tickets: tickets,
            Visitors: visitors,
        };
    }


    private addUpEachTicketPrice(factsObj: IFactsHolder): number {
        const { Visitors, Tickets } = factsObj;
        let totalPrice = 0;
        Visitors.forEach((visitor: Visitor, i: number) => {
            visitor.ticket = Tickets[i];
            totalPrice += visitor.ticketPrice;
            visitor.printTicket();
        });
        return totalPrice;
    }
}

export default PriceCalculator;
