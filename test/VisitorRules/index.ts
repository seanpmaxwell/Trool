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

const print = (total: string) => logger.info('Total Price: ' + total + '\n');

// Start
(async () => {
  let totalPrice = await getTotalPrice(singleVisitor, 'Regular');
  print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf3, 'Season');
  print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf6, 'Regular');
  print(totalPrice);
  totalPrice = await getTotalPrice(PartyOf10, 'Regular');
  print(totalPrice);
})();
