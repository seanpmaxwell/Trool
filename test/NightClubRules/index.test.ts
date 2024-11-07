import { expect, test } from 'vitest';
import { updateFacts } from './index';


test('NightClubRules spreadsheet', async () => {

  const { Patrons = []} = await updateFacts() ?? {};

  // Carmine Falcone
  expect(Patrons[0].isVip).toStrictEqual(true);
  expect(Patrons[0].isFlagged).toStrictEqual(false);
  // Alberto Falcone
  expect(Patrons[1].isVip).toStrictEqual(true);
  expect(Patrons[1].isFlagged).toStrictEqual(false);
  // Salvatore Maroni
  expect(Patrons[2].isVip).toStrictEqual(false);
  expect(Patrons[2].isFlagged).toStrictEqual(false);
  // Nadia Maroni
  expect(Patrons[3].isVip).toStrictEqual(false);
  expect(Patrons[3].isFlagged).toStrictEqual(false);
  // Sofia Giganti
  expect(Patrons[4].isVip).toStrictEqual(false);
  expect(Patrons[4].isFlagged).toStrictEqual(true);
});
