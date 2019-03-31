/**
 * Each encounter will have an assigned patient object. Patient object will be used to determine
 * if encounter gets used (i.e. birthdate). Combinations of Encounters (or a single Encounter) will
 * be a DataObject. Array of DataObjs will be used in the calculation, each DataObj will have a
 * value
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { cinfo } from 'simple-color-print';

import Encounter from './models/Encounter';
import Patient from './models/Patient';
import CalcEngine from './CalcEngine';


// Data incoming from a provider
const patient1 = new Patient('Gordan', 'Freeman', new Date(1965, 5, 20));
const encounter1 = new Encounter('2222.234820.11443', patient1);



// All Encounters
const encounters = [encounter1];


// Compute Score
const calcEngine = new CalcEngine();
calcEngine.computeScore(encounters).then(score => {
    cinfo('Final Score: ' + score);
});

//
//
//
//
// Encounter and DataObjHolder will have DecisionTables in the spreadsheet
// DataObjHolder will call Actions which add DataObjs to the final DataObjs array
