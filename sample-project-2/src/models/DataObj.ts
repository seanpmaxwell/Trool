/**
 * Object used as a data-point in the final calculation
 *
 * created by Sean Maxwell Mar 29, 2019
 */

class DataObj {

    private _value: number;
    private _fractionPart: fractionParts;


    constructor() {
        this._value = 0;
        this._fractionPart = null;
    }

    set value(value: number) {
        this._value = value;
    }

    get value(): number {
        return this._value;
    }

    set fractionPart(fractionPart: fractionParts) {
        this._fractionPart = fractionPart;
    }

    get fractionPart(): fractionParts {
        return this._fractionPart;
    }
}

export default DataObj;
export type fractionParts = 'Numerator' | 'Denominator' | null;
