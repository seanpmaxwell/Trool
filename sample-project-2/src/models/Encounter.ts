/**
 * An Encounter is an interaction between a Provider
 * and a patient.
 *
 * created by Sean Maxwell Mar 28, 2019
 */

import Patient from './Patient';


class Encounter {

    private _patient: Patient | null;


    constructor() {
        this._patient = null;
    }

    set patient(patient: Patient | null) {
        this._patient = patient;
    }

    get patient(): Patient | null {
        return this._patient;
    }
}
