/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';
import { cinfo, cerr } from 'simple-color-print';
import { FactsObject } from './types';


class Trool {

    private readonly _FACT_FORMAT_ERR = 'End of fact reached without a start';


    public async applyRules(factsObject: FactsObject, filePath: string): Promise<FactsObject> {

        let updatedFacts = {};

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            const factArr = this._iterateArr(jsonArr);
            return factArr as any;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Group facts into an Array of Arrays.
     */
    private _iterateArr(jsonArr: Array<any>): Object[][] {

        let factArr = [];

        let factStart = -1;
        let factEnd = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            const { field1 } = jsonArr[i];

            if (field1.includes('Start: ')) {
                factStart = i;
            } else if (field1 === 'End') {
                if (factStart === -1) {
                    throw Error(this._FACT_FORMAT_ERR);
                } else {
                    factEnd = i;
                }
            }

            if (factStart !== -1 && factEnd !== -1) {
                const fact = jsonArr.slice(factStart, factEnd);
                factArr.push(fact);
                factStart = -1;
                factEnd = -1;
            }
        }

        return factArr;
    }


    private _processFacts(factArr: Object[][]): FactsObject {

        cinfo(factArr);
        return {};
    }
}

export default Trool;


// Operators to add
// Operators.push(new Operator('equal', (a, b) => a === b))
// Operators.push(new Operator('notEqual', (a, b) => a !== b))
// Operators.push(new Operator('in', (a, b) => b.indexOf(a) > -1))
// Operators.push(new Operator('notIn', (a, b) => b.indexOf(a) === -1))
// add isBetween here
//
// Operators.push(new Operator('contains', (a, b) => a.indexOf(b) > -1, Array.isArray))
// Operators.push(new Operator('doesNotContain', (a, b) => a.indexOf(b) === -1, Array.isArray))
//
// function numberValidator (factValue) {
//     return Number.parseFloat(factValue).toString() !== 'NaN'
// }
// Operators.push(new Operator('lessThan', (a, b) => a < b, numberValidator))
// Operators.push(new Operator('lessThanInclusive', (a, b) => a <= b, numberValidator))
// Operators.push(new Operator('greaterThan', (a, b) => a > b, numberValidator))
// Operators.push(new Operator('greaterThanInclusive', (a, b) => a >= b, numberValidator))
