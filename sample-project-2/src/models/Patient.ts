/**
 * Patient class
 *
 * created by Sean Maxwell Mar 27, 2019
 */

type ageGroups = 'Adult' | 'Child' | 'Senior' | null;


class Patient {

    private _age: number;
    private _ageGroup: ageGroups;


    constructor() {
        this._age = -1;
        this._ageGroup = null;
    }

    set age(age: number) {
        this._age = age;
    }

    get age(): number {
        return this._age;
    }

    set ageGroup(ageGroup: ageGroups) {
        this._ageGroup = this.ageGroup;
    }

    get ageGroup(): ageGroups {
        return this._ageGroup;
    }
}

export default Patient;
