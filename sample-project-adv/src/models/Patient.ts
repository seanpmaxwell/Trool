/**
 * Patient class
 *
 * created by Sean Maxwell Mar 27, 2019
 */


class Patient {

    private _age: number;


    constructor() {
        this._age = -1;
    }

    set age(age: number) {
        this._age = age;
    }

    get age(): number {
        return this._age;
    }

    set patientType(): {

    }
}

export default Patient;
