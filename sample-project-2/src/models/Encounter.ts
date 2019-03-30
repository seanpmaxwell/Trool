/**
 * An Encounter is an interaction between a Provider
 * and a patient.
 *
 * created by Sean Maxwell Mar 28, 2019
 */

import Patient from './Patient';


class Encounter {

    private _code: string;
    private _category: string | null;
    private _patient: Patient | null;


    constructor(code: string, category: string | null, patient: Patient) {
        this._code = code;
        this._category = category;
        this._patient = patient;
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

    set category(category: string | null) {
        this._category = category;
    }

    get category(): string | null {
        return this._category;
    }
}

export default Encounter;
