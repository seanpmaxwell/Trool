/**
 * Misc shared stuff.
 *
 * created by Sean Maxwell Mar 14, 2019
 */


/**
 * Add Table id to Error message.
 */
export class TableError extends Error {

    public constructor(factName: string, message: string) {
        super('Error on DecisionTable(' + factName + ') : ' + message);
    }
}
