import logger from 'jet-logger';
import getTotalPrice from './getTotalPrice';
import Visitor from './models/Visitor';


// Data
const singleVisitor = new Visitor(67);

const PartyOf3 = [
  new Visitor(5),
  new Visitor(35),
  new Visitor(73),
];

const PartyOf6 = [
  new Visitor(7),
  new Visitor(18),
  new Visitor(48),
  new Visitor(18), 
  new Visitor(65),
  new Visitor(101),
];

const PartyOf10 = [
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
];


// Start
(async () => {
  const p = (total: string) => logger.info('Total Price: ' + total + '\n');
  // Party of 1
  let totalPrice = await getTotalPrice(singleVisitor, 'Regular');
  p(totalPrice);
  // Party of 3
  totalPrice = await getTotalPrice(PartyOf3, 'Season');
  p(totalPrice);
  // Party of 6
  totalPrice = await getTotalPrice(PartyOf6, 'Regular');
  p(totalPrice);
  // Party of 10
  totalPrice = await getTotalPrice(PartyOf10, 'Regular');
  p(totalPrice);
})();
