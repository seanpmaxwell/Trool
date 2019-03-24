/**
 * Setup Visitor data for the Price Calculator.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { cinfo, cerr } from 'simple-color-print';
import { ticketOpts } from './models/Ticket';
import PriceCalculator from './PriceCalculator';
import Visitor from './models/Visitor';



/*********************************************************************************
                           Setup Price Calculator
*********************************************************************************/

const priceCalculator = new PriceCalculator();

async function printTotalPrice(vistors: Visitor | Visitor[], ticketOption: ticketOpts):
    Promise<void> {

    try {
        const totalPrice = await priceCalculator.calcTotalPrice(vistors, ticketOption);
        cinfo(totalPrice);
        /* tslint:disable */ console.log('\n'); /* tslint:enable */
    } catch (err) {
        cerr(err);
    }
}



/*********************************************************************************
                  Calculate Some Prices for Various Party Sizes
*********************************************************************************/

callAll();

async function callAll() {

    await printTotalPrice(new Visitor(67), 'Season');

    await printTotalPrice([
        new Visitor(5),
        new Visitor(35),
        new Visitor(73)
    ], 'Season');

    await printTotalPrice([
        new Visitor(7),
        new Visitor(18),
        new Visitor(48),
        new Visitor(18),
        new Visitor(65),
        new Visitor(101)
    ], 'Regular');

    await printTotalPrice([
        new Visitor(7),
        new Visitor(12),
        new Visitor(19),
        new Visitor(64),
        new Visitor(50),
        new Visitor(38),
        new Visitor(21),
        new Visitor(42),
        new Visitor(59),
        new Visitor(17)
    ], 'Regular');
}
