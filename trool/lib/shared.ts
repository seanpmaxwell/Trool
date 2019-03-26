/**
 * Misc shared stuff.
 *
 * created by Sean Maxwell Mar 14, 2019
 */

import * as colors from 'colors';


export interface FactsHolder {
    [key: string]: InstanceType<any> | InstanceType<any>[];
}

export interface ImportsHolder {
    [key: string]: any;
}

export interface Row {
    [key: string]: string;
}


export function valsToArr(obj: Object) {
    return Object.values(obj).map(header => header.trim());
}


export function parseCell(cellValStr: string, imports: ImportsHolder): any {

    cellValStr = cellValStr.trim();
    const cellValLowerCase = cellValStr.toLowerCase();

    // Value is primitive
    if (!isNaN(Number(cellValStr))) {
        return Number(cellValStr);
    } else if (cellValLowerCase === 'true') {
        return true;
    } else if (cellValLowerCase === 'false') {
        return false;
    } else if (cellValLowerCase === 'null') {
        return null;
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

    if (imports.hasOwnProperty(importKey)) {

        if (importVal) {
            return imports[importKey][importVal];
        } else {
            return imports[importKey];
        }
    }

    return null;
}


/* tslint:disable */
export class Logger {

    private readonly _showsLogs: boolean;


    constructor(showLogs?: boolean) {
        this._showsLogs = !!showLogs;
    }

    get showLogs(): boolean {
        return this._showsLogs;
    }

    public log(msg: string): void {
        if (this._showsLogs) {
            console.log(colors.green(msg));
        }
    }


    public warn(msg: string): void {
        if (this._showsLogs) {
            console.log(colors.yellow(msg));
        }
    }
}
