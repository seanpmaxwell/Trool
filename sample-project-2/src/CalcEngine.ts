/**
 * Generate score for a provider based on patient encounters. Score for provider determines
 * compensation provider will receive. Every quarter a group of encounters are put through
 * the calculation-engine. Rules for the calculation-engine are in the spreadsheet CalcRules.ods.
 *
 * created by Sean Maxwell Mar 27, 2019
 */

import Trool from 'trool';
import Encounter from './models/Encounter';


class CalcEngine {

    private trool: Trool;


    constructor() {
        this.trool = new Trool(true);
    }


    public computeScore(encounters: Encounter[]): number {


        return 0;
    }
}

export default CalcEngine;

// Each encounter will have an assigned patient object
// Patient object will be used to determine if encounter gets used (i.e. birthdate)
// Combinations of Encounters (or a single Encounter) will be a DataObject
// Array of DataObjs will be used in the calculation, each DataObj will have a value
// Encounter and DataObjHolder will have DecisionTables in the spreadsheet
// DataObjHolder will call Actions which add DataObjs to the final DataObjs array
