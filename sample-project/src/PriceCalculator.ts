/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as path from 'path';
import { cinfo, cerr } from 'simple-color-print';
import { VisitorTypes, TicketTypes } from './models/constants';

import Trool, { FactsObj } from 'trool';
import Ticket, { TicketOpts } from './models/Ticket';
import Visitor from './models/Visitor';



class PriceCalculator {

    private trool: Trool;
    private readonly CSV_FILE = 'rule-files/VisitorRules.csv';


    constructor() {
        this.trool = new Trool();
    }


    public async calcTotalPrice(visitors: Visitor | Visitor[], ticketOption: TicketOpts):
        Promise<string> {

        let totalPrice = 0;
        const importsObj = {VisitorTypes, TicketTypes};

        try {
            const factsObj = this.setupFactsObj(visitors, ticketOption);
            const csvFilePath = path.join(__dirname, this.CSV_FILE);
            const updatedFacts = await this.trool.applyRules(csvFilePath, factsObj, importsObj,
                true);

            totalPrice = this._calcTotalPrice(updatedFacts);
        } catch (err) {
            cerr(err);
            totalPrice = -1;
        } finally {
            return '$' + totalPrice.toFixed(2);
        }
    }


    private setupFactsObj(visitors: Visitor | Visitor[], ticketOption: TicketOpts): FactsObj {

        const tickets = [];

        if (visitors instanceof Array) {
            visitors.forEach(visitor => {
                visitor.partySize = visitors.length;
                tickets.push(new Ticket(ticketOption));
            });
        } else {
            tickets.push(new Ticket(ticketOption));
        }

        return {
            Visitors: visitors,
            Tickets: tickets
        };
    }


    private _calcTotalPrice(factsObj: FactsObj): number {

        const visitors = factsObj.Visitors as Visitor | Visitor[];
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
