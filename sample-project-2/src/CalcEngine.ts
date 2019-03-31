/**
 * Generate score for a provider based on patient encounters. Score for provider determines
 * compensation provider will receive. Every quarter a group of encounters are put through
 * the calculation-engine. Rules for the calculation-engine are in the spreadsheet CalcRules.ods.
 *
 * created by Sean Maxwell Mar 27, 2019
 */

import * as path from 'path';
import { cinfo, cerr } from 'simple-color-print';

import Trool, { FactsHolder } from 'trool';
import Encounter from './models/Encounter';



class CalcEngine {

    private trool: Trool;
    private readonly CSV_FILE = 'rule-files/CalcRules.csv';


    constructor() {
        this.trool = new Trool(true);
    }


    public async computeScore(encounters: Encounter[]): Promise<number> {

        let score = -1;

        const facts = {
            Encounters: encounters
        };

        try {
            const csvFilePath = path.join(__dirname, this.CSV_FILE);
            const updatedFacts = this.trool.applyRules(csvFilePath, facts);
            score = this.performCalculation(updatedFacts);
        } catch (err) {
            cerr(err);
        } finally {
            return score;
        }
    }


    private performCalculation(updateFacts: FactsHolder): number {
        return 0;
    }
}

export default CalcEngine;

