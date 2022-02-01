/**
 * Misc shared stuff.
 *
 * created by Sean Maxwell Mar 14, 2019
 */

import { TRow } from "./trool";



/**
 * Get row as array of strings.
 * 
 * @param row 
 * @returns 
 */
export function valsToArr(row: TRow): string[] {
    return Object.values(row).map((header) => header.trim());
};


/**
 * Add Table id to Error message.
 */
export class TableError extends Error {

    public constructor(factName: string, message: string) {
        super('Error on DecisionTable(' + factName + ') : ' + message);
    }
}
