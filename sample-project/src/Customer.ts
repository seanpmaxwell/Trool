/**
 * Customer class.
 *
 * created by Sean Maxwell Mar 2, 2019
 */


type customerTypes = 'Adult' | 'Senior' | 'Child';

class Customer {

    public age: number;
    public type: customerTypes;


    constructor(age: number, type: customerTypes) {
        this.age = age;
        this.type = type;
    }


    public setAge(age: number): void {
        this.age = age;
    }


    public setCustomerType(type: customerTypes): void {
        this.type = type;
    }
}

export default Customer;
