/**
 * An Encounter is an interaction between a Provider
 * and a patient.
 *
 * created by Sean Maxwell Mar 28, 2019
 */

import * as moment from 'moment';
import Patient from './Patient';


class Encounter {

    // Set all initialization
    private _code: string;
    private _patient: Patient | null;

    // Set through the rule file
    private _category: string;
    private _initPop: boolean;


    constructor(code: string, patient: Patient) {

        this._code = code;
        this._patient = patient;

        this._category = '';
        this._initPop = false;
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

    set initPop(initPop: boolean) {
        this._initPop = initPop;
    }

    get initPop(): boolean {
        return this._initPop;
    }

    get ageInYears(): number {

        if (this.patient) {
            const date = this.patient.birthdate;
            return moment().diff(date, 'years');
        } else {
            return 0;
        }
    }
}

export default Encounter;
