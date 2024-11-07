import Visitor from './models/Visitor';


export const CSV_FILE_PATH = './VisitorRules.csv';

export const singleVisitor = new Visitor(67);

export const PartyOf3 = [
  new Visitor(5),
  new Visitor(35),
  new Visitor(73),
];

export const PartyOf6 = [
  new Visitor(7),
  new Visitor(18),
  new Visitor(48),
  new Visitor(18), 
  new Visitor(65),
  new Visitor(101),
];

export const PartyOf10 = [
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
