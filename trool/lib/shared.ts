/**
 *
 * created by Sean Maxwell Mar 14, 2019
 */

import { ImportsObj } from './types';


export function parseCell(cellVal: string, importsObj: ImportsObj): any {

    cellVal = cellVal.trim();

    let importPropKey = '';

    if (cellVal.includes('.')) {
        importPropKey = cellVal.split('.')[0];
    }

    if (!isNaN(Number(cellVal))) {
        return Number(cellVal);
    } else if (cellVal === 'true') {
        return true;
    } else if (cellVal === 'false') {
        return false;
    } else if (cellVal.startsWith('"')  && cellVal.endsWith('"')) {
        return cellVal.substring(1, cellVal.length - 1);
    } else  {

        if (importsObj.hasOwnProperty(importPropKey)) {
            return importsObj[importPropKey];
        } else if (importsObj.hasOwnProperty(cellVal)) {
            return importsObj[name];
        } else {
            return null;
        }
    }
}
