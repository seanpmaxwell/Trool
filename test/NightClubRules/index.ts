import path from 'path';
import logger from 'jet-logger';
import Trool from '../../src';
import Patron from './Patron';


const CSV_FILE_PATH = './NightClubRules.csv';

const patrons: Patron[] = [
  new Patron('Carmine', 'Falcone'),
  new Patron('Alberto', 'Falcone'),
  new Patron('Salvatore', 'Maroni'),
  new Patron('Nadia', 'Maroni'),
  new Patron('Sofia', 'Giganti'),
] as const;


interface IFactsHolder {
  Patrons: Patron[];
}


// Start
(async () => {
  try {
    const csvFilePathFull = path.join(__dirname, CSV_FILE_PATH),
      facts = { Patrons: patrons },
      trool = new Trool();
    await trool.init(csvFilePathFull);
    const updatedFacts = trool.applyRules<IFactsHolder>(facts);
    updatedFacts.Patrons.forEach(patron => logger.info(patron.toString()));
  } catch (err) {
    logger.err(err);
  }
})();
