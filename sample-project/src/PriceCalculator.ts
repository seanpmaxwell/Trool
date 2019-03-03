/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as path from 'path';
import { cinfo, cerr } from 'simple-color-print';

import Trool, { FactsObject } from 'trool';
import Ticket, { TicketOpts } from './models/Ticket';
import Visitor from './models/Visitor';


class PriceCalculator {

    private _trool: Trool;
    private readonly _CSV_FILE = 'rule-files/VisitorRules.csv';


    constructor() {
        this._trool = new Trool();
    }


    public async calcTotalPrice(visitors: Visitor | Visitor[], ticketOption: TicketOpts): Promise<number> {

        let totalPrice = -1;

        try {
            const factsObj = this.setupFacts(visitors, ticketOption);
            const csvFilePath = path.join(__dirname, this._CSV_FILE);
            const updatedFacts = await this._trool.applyRules(factsObj, csvFilePath);
            totalPrice = this._calcTotalPrice(updatedFacts);
        } catch (err) {
            cerr(err);
        } finally {
            return totalPrice;
        }
    }


    private setupFacts(visitors: Visitor | Visitor[], ticketOption: TicketOpts): FactsObject {

        const tickets = [];

        if (visitors instanceof Array) {
            visitors.forEach(vistor => {
                vistor.partySize = visitors.length;
                tickets.push(new Ticket(ticketOption));
            });
        } else {
            tickets.push(new Ticket(ticketOption));
        }

        return {
            Visitors: visitors,
            Tickets: tickets
        }
    }


    private _calcTotalPrice(factsObj: FactsObject): number {

        const visitors = factsObj['Visitors'] as Visitor | Visitor[];
        let totalPrice = 0;

        if (visitors instanceof Array) {
            visitors.forEach(visitor => {
                totalPrice += visitor.getTicketPrice();
            });
        } else {
            totalPrice = visitors.getTicketPrice();
        }

        return totalPrice;
    }
}

export default PriceCalculator;
