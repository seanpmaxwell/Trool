/**
 * Setup Visitor data for the Price Calculator.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import { cinfo } from 'simple-color-print';

import Encounter from './models/Encounter';
import Patient from './models/Patient';
import CalcEngine from './CalcEngine';


// Data incoming from a provider
const patient1 = new Patient('Gordan', 'Freeman', new Date(1965, 5, 20));
const encounter1 = new Encounter('2222.234820.11443', null, patient1);



// All Encounters
const encounters = [encounter1];


// Compute Score
const calcEngine = new CalcEngine();
const score = calcEngine.computeScore(encounters);
cinfo(score);

