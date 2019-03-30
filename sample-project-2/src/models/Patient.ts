/**
 * Patient class
 *
 * created by Sean Maxwell Mar 27, 2019
 */

import * as moment from 'moment';


class Patient {

    private _birthdate: Date | null;
    private _ageGroup: ageGroups;


    constructor() {
        this._birthdate = null;
        this._ageGroup = null;
    }

    set birthdate(birthdate: Date | null) {
        this._birthdate = birthdate;
    }

    get birthdate(): Date | null {
        return this._birthdate;
    }

    get ageInYears(): number {

        if (this._birthdate) {
            return moment().diff(this._birthdate, 'years');
        } else {
            return 0;
        }
    }

    set ageGroup(ageGroup: ageGroups) {
        this._ageGroup = this.ageGroup;
    }

    get ageGroup(): ageGroups {
        return this._ageGroup;
    }
}

export type ageGroups = 'Adult' | 'Child' | 'Senior' | null;
export default Patient;
