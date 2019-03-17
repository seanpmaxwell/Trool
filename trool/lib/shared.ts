/**
 *
 * created by Sean Maxwell Mar 14, 2019
 */

import { ImportsObj } from './types';


export function parseCell(cellVal: string, importsObj: ImportsObj): any {

    cellVal = cellVal.trim();

    if (!isNaN(Number(cellVal))) {
        return Number(cellVal);
    } else if (cellVal === 'true') {
        return true;
    } else if (cellVal === 'false') {
        return false;
    } else if (cellVal.startsWith('"')  && cellVal.endsWith('"')) {
        return cellVal.substring(1, cellVal.length - 1);
    } else  {

        let importKey = cellVal;
        let importVal;

        if (cellVal.includes('.')) {
            const arr = cellVal.split('.');
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
    }

    return null;
}
