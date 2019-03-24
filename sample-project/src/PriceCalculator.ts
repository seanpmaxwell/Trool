/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as path from 'path';
import { cerr } from 'simple-color-print';
import { VisitorTypes, TicketTypes } from './models/constants';
import { ticketOpts } from './models/Ticket';

import Trool, { FactsHolder } from 'trool';
import Ticket from './models/Ticket';
import Visitor from './models/Visitor';



class PriceCalculator {

    private trool: Trool;
    private readonly CSV_FILE = 'rule-files/VisitorRules.csv';


    constructor() {
        this.trool = new Trool(true);
    }


    public async calcTotalPrice(visitors: Visitor | Visitor[], ticketOpt: ticketOpts):
        Promise<string> {

        let totalPrice = 0;
        const imports = { VisitorTypes, TicketTypes };
        visitors = (visitors instanceof Array) ? visitors : [visitors];

        try {
            const csvFilePath = path.join(__dirname, this.CSV_FILE);
            const facts = this.setupFactsHolder(visitors, ticketOpt);
            const updatedFacts = await this.trool.applyRules(csvFilePath, facts, imports);

            totalPrice = this.addUpEachTicketPrice(updatedFacts);
        } catch (err) {
            cerr(err);
            totalPrice = -1;
        } finally {
            return '$' + totalPrice.toFixed(2);
        }
    }


    private setupFactsHolder(visitors: Visitor[], ticketOpt: ticketOpts): FactsHolder {

        const tickets: Ticket[] = [];

        visitors.forEach(visitor => {
            visitor.partySize = visitors.length;
            tickets.push(new Ticket(ticketOpt));
        });

        return {
            Visitors: visitors,
            Tickets: tickets
        };
    }


    private addUpEachTicketPrice(factsObj: FactsHolder): number {

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
