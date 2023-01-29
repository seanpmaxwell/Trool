/**
 * Put shared classes here.
 */

export class TblErr extends Error {

  public constructor(factName: string, message: string) {
    super('Error on DecisionTable(' + factName + ') : ' + message);
  }
}
