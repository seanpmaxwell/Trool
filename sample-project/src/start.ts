/**
 * Calculate some prices for various party sizes.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { cinfo, cerr } from 'simple-color-print';
import { ticketOpts } from './models/Ticket';
import PriceCalculator from './PriceCalculator';
import Visitor from './models/Visitor';



(async () => {
    const priceCalculator = new PriceCalculator();
    // Party of 1
    await printTotalPrice(priceCalculator, 'Season', new Visitor(67));
    // Party of 3
    await printTotalPrice(priceCalculator, 'Season', [
        new Visitor(5),
        new Visitor(35),
        new Visitor(73),
    ]);
    // Party of 6
    await printTotalPrice(priceCalculator, 'Regular', [
        new Visitor(7),
        new Visitor(18),
        new Visitor(48),
        new Visitor(18),
        new Visitor(65),
        new Visitor(101),
    ]);
    // Party of 10
    await printTotalPrice(priceCalculator, 'Regular', [
        new Visitor(7),
        new Visitor(12),
        new Visitor(19),
        new Visitor(64),
        new Visitor(50),
        new Visitor(38),
        new Visitor(21),
        new Visitor(42),
        new Visitor(59),
        new Visitor(17),
    ]);
    // Print decision-tables
    await printTotalPrice(priceCalculator, 'Season', new Visitor(0), true);
})();


/**
 * Print total price for a visitor party size.
 *
 * @param vistors
 * @param ticketOption
 */
async function printTotalPrice(
    calculator: PriceCalculator,
    ticketOption: ticketOpts,
    vistors: Visitor | Visitor[],
    printDecisionTables?: boolean,
): Promise<void> {
    try {
        const totalPrice = await calculator.calcTotalPrice(vistors, ticketOption,
            printDecisionTables);
        cinfo(totalPrice + '\n');
    } catch (err) {
        cerr(err);
    }
}
