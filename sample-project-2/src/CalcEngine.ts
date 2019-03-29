/**
 * Generate score for a provider based on patient encounters. Score for provider determines
 * compensation provider will receive. Every quarter a group of encounters are put through
 * the calculation-engine. Rules for the calculation-engine are in the spreadsheet CalcRules.ods.
 *
 * created by Sean Maxwell Mar 27, 2019
 */

class CalcEngine {

    // constructor() {
    //
    // }

    // Each encounter will have an assigned patient object
    // Patient object will be used to determine if encounter gets used (i.e. birthdate)
    // Combinations of Encounters (or a single Encounter) will be a DataObject
    // Array of DataObjects will be used in the calculation
    // Encounter and DataObject will have DecisionTables in the spreadsheet


}

export default CalcEngine;
