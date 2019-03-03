/**
 * Sample project for the trool library
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { cinfo, cerr } from 'simple-color-print';
import { TicketOpts } from './Ticket';
import PriceCalculator from './PriceCalculator';
import Visitor from './Visitor';



/*=================================================================================
                           Setup Price Calculator
 ================================================================================*/

const priceCalculator = new PriceCalculator();

async function printTotalPrice(vistors: Visitor | Visitor[], ticketOption: TicketOpts):
    Promise<void> {

    try {
        const totalPrice = await priceCalculator.calcTotalPrice(vistors, ticketOption);
        cinfo(totalPrice);
    } catch (err) {
        cerr(err);
    }
}



/*=================================================================================
                  Calculate Some Prices for Various Part Sizes
 ================================================================================*/


printTotalPrice(new Visitor(23), 'Season');

// printTotalPrice([
//     new Visitor(5),
//     new Visitor(35),
//     new Visitor(73)
// ], 'Season');
//
// printTotalPrice([
//     new Visitor(7),
//     new Visitor(18),
//     new Visitor(48),
//     new Visitor(18),
//     new Visitor(65),
//     new Visitor(101)
// ], 'Regular');
//
// printTotalPrice([
//     new Visitor(7),
//     new Visitor(12),
//     new Visitor(19),
//     new Visitor(64),
//     new Visitor(50),
//     new Visitor(38),
//     new Visitor(21),
//     new Visitor(42),
//     new Visitor(59),
//     new Visitor(17)
// ], 'Regular');
