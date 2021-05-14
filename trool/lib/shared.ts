/**
 * Misc shared stuff.
 *
 * created by Sean Maxwell Mar 14, 2019
 */

import colors from 'colors';


export interface IFactsHolder {
    [key: string]: InstanceType<any> | Array<InstanceType<any>>;
}

export interface IImportsHolder {
    [key: string]: any;
}

export interface IRow {
    [key: string]: string;
}


export const valsToArr = (obj: object) => {
    return Object.values(obj).map((header) => header.trim());
};


export const parseCell = (cellValStr: string, imports: IImportsHolder) => {
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
    } else if (cellValStr.startsWith('\'')  && cellValStr.endsWith('\'')) {
        return cellValStr.substring(1, cellValStr.length - 1);
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
};


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
            // tslint:disable-next-line
            console.log(colors.green(msg));
        }
    }


    public warn(msg: string): void {
        if (this._showsLogs) {
            // tslint:disable-next-line
            console.log(colors.yellow(msg));
        }
    }
}
