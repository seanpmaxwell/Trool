/**
 * Misc shared stuff.
 *
 * created by Sean Maxwell Mar 14, 2019
 */


export class TableError extends Error {

  public constructor(factName: string, message: string) {
    super('Error on DecisionTable(' + factName + ') : ' + message);
  }
}
