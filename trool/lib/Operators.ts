/**
 *
 *
 * created by Sean Maxwell Mar 6, 2019
 */


class Operators {

    public static compare(operator: string, val1: any, val2: any): boolean {

        if (operator === '==') {
            return val1 == val2;
        } else if (operator === '===') {
            return val1 === val2;
        } else if (operator === '!=') {
            return val1 != val2;
        } else if (operator === '!==') {
            return val1 !== val2;
        } else if (operator === '>') {
            return val1 > val2;
        } else if (operator === '>=') {
            return val1 >= val2;
        } else if (operator === '<') {
            return val1 < val2;
        } else if (operator === '<=') {
            return val1 <= val2;
        } else {
            throw Error('Operator not found');
        }
    }
}

