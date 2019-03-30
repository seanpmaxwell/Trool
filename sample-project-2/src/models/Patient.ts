/**
 * Patient class
 *
 * created by Sean Maxwell Mar 27, 2019
 */




class Patient {

    private _firstName: string;
    private _lastName: string;
    private _birthdate: Date;
    private _ageGroup: ageGroups;


    constructor(firstName: string, lastName: string, birthdate: Date) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._birthdate = birthdate;
        this._ageGroup = null;
    }

    set firstName(firstName: string) {
        this._firstName = firstName;
    }

    get firstName(): string {
        return this._firstName;
    }

    set lastName(lastName: string) {
        this._lastName = lastName;
    }

    get lastName(): string {
        return this._lastName;
    }

    set birthdate(birthdate: Date) {
        this._birthdate = birthdate;
    }

    get birthdate(): Date {
        return this._birthdate;
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
