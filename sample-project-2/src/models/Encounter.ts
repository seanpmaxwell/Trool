/**
 * An Encounter is an interaction between a Provider
 * and a patient.
 *
 * created by Sean Maxwell Mar 28, 2019
 */

import Patient from './Patient';


class Encounter {

    private _patient: Patient | null;
    private _code: string;
    private _category: string;


    constructor() {
        this._patient = null;
        this._code = '';
        this._category = '';
    }

    set patient(patient: Patient | null) {
        this._patient = patient;
    }

    get patient(): Patient | null {
        return this._patient;
    }

    set code(code: string) {
        this._code = code;
    }

    get code(): string {
        return this._code;
    }

    set category(category: string) {
        this._category = category;
    }

    get category(): string {
        return this._category;
    }
}

export default Encounter;
