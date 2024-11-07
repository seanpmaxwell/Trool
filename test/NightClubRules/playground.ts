import logger from 'jet-logger';
import updateFacts from './updateFacts';


// Print results
(async () => {
  const updatedFacts = await updateFacts();
  updatedFacts?.Patrons.forEach(patron => logger.info(patron.toString()));
})();

