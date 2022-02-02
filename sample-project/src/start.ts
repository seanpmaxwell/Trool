/**
 * Calculate some prices for various party sizes.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import logger from 'jet-logger';
import getTotalPrice from './getTotalPrice';
import Visitor from './models/visitor';


const singleVisitor = Visitor.new(67),
    partyOf3 = [
        Visitor.new(5),
        Visitor.new(35),
        Visitor.new(73),
    ],
    partyOf6 = [
        Visitor.new(7),
        Visitor.new(18),
        Visitor.new(48),
        Visitor.new(18), 
        Visitor.new(65),
        Visitor.new(101),
    ],
    partyOf10 = [
        Visitor.new(7),
        Visitor.new(12),
        Visitor.new(19),
        Visitor.new(64), 
        Visitor.new(50),
        Visitor.new(38),
        Visitor.new(21),
        Visitor.new(42),
        Visitor.new(59), 
        Visitor.new(17),
];

(async () => {
    // Party of 1
    let totalPrice = await getTotalPrice(singleVisitor, 'Regular');
    printTotal(totalPrice);
    // Party of 3
    totalPrice = await getTotalPrice(partyOf3, 'Season');
    printTotal(totalPrice);
    // // Party of 6
    totalPrice = await getTotalPrice(partyOf6, 'Regular');
    printTotal(totalPrice);
    // // Party of 10
    totalPrice = await getTotalPrice(partyOf10, 'Regular');
    printTotal(totalPrice);
})();


function printTotal(totalPrice: string) {
    logger.info('Total Price: ' + totalPrice + '\n');
}