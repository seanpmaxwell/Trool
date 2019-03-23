/**
 *
 * created by Sean Maxwell Mar 14, 2019
 */

export interface FactsObj {
    [key: string]: InstanceType<any> | InstanceType<any>[];
}

export interface ImportsObj {
    [key: string]: any;
}

export interface Row {
    [key: string]: string;
}


export function parseCell(cellValStr: string, importsObj: ImportsObj): any {

    cellValStr = cellValStr.trim();

    // Value is primitive
    if (!isNaN(Number(cellValStr))) {
        return Number(cellValStr);
    } else if (cellValStr === 'true') {
        return true;
    } else if (cellValStr === 'false') {
        return false;
    } else if (cellValStr.startsWith('"')  && cellValStr.endsWith('"')) {
        return cellValStr.substring(1, cellValStr.length - 1);
    } else if (cellValStr.startsWith('“')  && cellValStr.endsWith('”')) {
        return cellValStr.substring(1, cellValStr.length - 1);
    }

    // Value is from an import

    let importKey = cellValStr;
    let importVal;

    if (cellValStr.includes('.')) {
        const arr = cellValStr.split('.');
        importKey = arr[0];
        importVal = arr[1];
    }

    if (importsObj.hasOwnProperty(importKey)) {

        if (importVal) {
            return importsObj[importKey][importVal];
        } else {
            return importsObj[importKey];
        }
    }

    return null;
}


export function compareVals(operator: string, val1: any, val2: any): boolean {

    if (operator === '===') {
        return val1 === val2;
    } else if (operator === '==') {
        return val1 === val2;
    } else if (operator === '!=') {
        return val1 !== val2;
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
        throw Error('The following operator is not a comparison operator: ' + operator);
    }
}
