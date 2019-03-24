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

import Trool, {FactsHolder} from 'trool';
import Ticket from './models/Ticket';
import Visitor from './models/Visitor';



class PriceCalculator {

    private trool: Trool;
    private readonly CSV_FILE = 'rule-files/VisitorRules.csv';


    constructor() {
        this.trool = new Trool();
    }


    public async calcTotalPrice(visitors: Visitor | Visitor[], ticketOption: ticketOpts):
        Promise<string> {

        let totalPrice = 0;
        const importsObj = { VisitorTypes, TicketTypes };
        visitors = (visitors instanceof Array) ? visitors : [visitors];

        try {
            const csvFilePath = path.join(__dirname, this.CSV_FILE);
            const factsObj = this.setupFactsObj(visitors, ticketOption);
            const updatedFacts = await this.trool.applyRules(csvFilePath, factsObj, importsObj,
                true);

            totalPrice = this.addUpEachTicketPrice(updatedFacts);
        } catch (err) {
            cerr(err);
            totalPrice = -1;
        } finally {
            return '$' + totalPrice.toFixed(2);
        }
    }


    private setupFactsObj(visitors: Visitor[], ticketOption: ticketOpts): FactsHolder {

        const tickets = [];

        for (let i = 0; i < visitors.length; i++) {
            visitors[i].partySize = visitors.length;
            tickets.push(new Ticket(ticketOption));
        }

        return {
            Visitors: visitors,
            Tickets: tickets
        };
    }


    private addUpEachTicketPrice(factsObj: FactsHolder): number {

        const { Visitors, Tickets } = factsObj;

        let totalPrice = 0;

        for (let i = 0; i < Visitors.length; i++) {
            Visitors[i].ticket = Tickets[i];
            totalPrice += Visitors[i].ticketPrice;
            Visitors[i].printTicket();
        }

        return totalPrice;
    }
}

export default PriceCalculator;
