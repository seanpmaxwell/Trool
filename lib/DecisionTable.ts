/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { TAction, TCondition, TRow } from './common/types';


// **** Variables **** //

const Errors = {
  ColHeader: 'Action/Condition column headers can only be "Condition" or ' + 
    '"Action".',
  ColHeaderArgmt: 'All conditions must be specified before all actions',
  OpBlank: 'Operation cannot be blank',
  OpFormat: 'The operation must began with the Fact\'s attribute, contain ' + 
    'one operator, and end with "$param". Operation:',
  AttrUndef: 'Attribute does not exist on the fact for operation:',
  MustEndWithParam: 'Condition operation must end with "$param". Operation:',
  ParamCount: 'The number of params for an action operation must match ' + 
    'the number of argument for the method:',
  AssignParamCount: 'An assignment action operation can only contain ' + 
    'one argument. Assignment:',
  NotAnOp: 'The following operator is not a comparison operator:',
} as const;


// **** Class **** //

class DecisionTable {

  private tableRows: TRow[];
  private factName: string;
  private conditions: TCondition[] = [];
  private actions: TAction[] = [];

  /**
   * Constructor()
   */
  constructor(factName: string, tableRows: TRow[]) {
    this.factName = factName;
    this.tableRows = tableRows;
    // Setup condition and actions
    const colHeaderArr = DecisionTable.rowToArr(tableRows[0]),
      opsStrArr = DecisionTable.rowToArr(tableRows[1]);
    let conditionsDone = false;
    const conditions = [],
      actions = [];
    for (let i = 1; i < colHeaderArr.length; i++) {
      if (colHeaderArr[i] === 'Condition') {
        if (conditionsDone) {
          throw new TblErr(factName, Errors.ColHeaderArgmt);
        }
        const condFunc = this.getCondFns(opsStrArr[i], factName);
        conditions.push(condFunc);
        conditionsDone = (colHeaderArr[i + 1] === 'Action');
      } else if (colHeaderArr[i] === 'Action') {
        if (!conditionsDone) {
          throw new TblErr(factName, Errors.ColHeaderArgmt);
        }
        const actionFunc = this.getActionFns(opsStrArr[i], factName);
        actions.push(actionFunc);
        if (!colHeaderArr[i + 1]) { break; }
      } else {
        throw new TblErr(factName, Errors.ColHeader);
      }
    }
    this.conditions = conditions;
    this.actions = actions;
  }

  /**
   * Row to arraw of strings
   */
  public static rowToArr(row: TRow): string[] {
    return Object.values(row).map((cell) => cell.trim());
  }

  /**
   * Get the tables fact name.
   */
  public getFactName(): string {
    return this.factName;
  }

  /**
   * Get Conditions
   */
  public getConditions(): TCondition[] {
    return [ ...this.conditions ];
  }

  /**
   * Get actions
   */
  public getActions(): TAction[] {
    return [ ...this.actions ];
  }

  /**
   * Get table rows
   */
  public getRows(): TRow[] {
    return [ ...this.tableRows ];
  }

  /**
   * Get the Condition functions.
   */
  private getCondFns(opStr: string, factName: string): TCondition {
    return (fact: Record<string, unknown>, paramVal: unknown): boolean => {
      const arr = opStr.split(' ');
      const property = arr[0].replace('()', '');
      if (!opStr) {
        throw new TblErr(factName, Errors.OpBlank);
      } else if (arr.length !== 3) {
        throw new TblErr(factName, Errors.OpFormat + ` "${opStr}"`);
      } else if (fact[property] === undefined) {
        throw new TblErr(factName, Errors.AttrUndef + ` "${opStr}"`);
      } else if (arr[2] !== '$param') {
        throw new TblErr(factName, Errors.MustEndWithParam + ` "${opStr}"`);
      }
      let attrVal = null;
      // For getter functions
      const factVal = fact[property];
      if (typeof factVal === 'function') {
        attrVal = factVal();
      } else  {
        attrVal = factVal;
      }
      return this.compareVals(arr[1], attrVal, paramVal, factName);
    };
  }

  /**
   * Get the action functions.
   */
  private getActionFns(actionStr: string, factName: string): TAction {
    if (!actionStr) {
      throw new TblErr(factName, Errors.OpBlank);
    }
    return (fact: Record<string, unknown>, cellVals: unknown[]): void => {
      const argLength = actionStr.split('$param').length - 1;
      const op = ` "${actionStr}"`;
      if (argLength !== cellVals.length) {
        throw new TblErr(factName, Errors.ParamCount + op)
      }
      const opArr = actionStr.split(' ');
      // Check if assignment or method call
      if (opArr[1] === '=') {
        if (cellVals.length !== 1) {
          throw new TblErr(factName, Errors.AssignParamCount + op);
        } else if (fact[opArr[0]] === undefined) {
          throw new TblErr(factName, Errors.AttrUndef + op);
        }
        fact[opArr[0]] = cellVals[0];
      } else {
        const n = actionStr.lastIndexOf('('),
          methodName = actionStr.substring(0, n);
        if (fact[methodName] === undefined) {
          throw new TblErr(factName, Errors.AttrUndef + op);
        } else if (typeof fact[methodName] === 'function') {
          (fact[methodName] as Function)(...cellVals);
        } else {

        }
      }
    };
  }

  /**
   * Determine an equality operation from a string.
   */
  private compareVals(
    operator: string,
    val1: unknown,
    val2: unknown,
    factName: string,
  ): boolean {
    if (typeof val1 !== 'string' && typeof val1 !== 'number') {
      return false;
    }
    if (typeof val2! !== 'string' && typeof val2 !== 'number') {
      return false;
    }
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
      throw new TblErr(factName, Errors.NotAnOp + ` '${operator}'`);
    }
  }
}


// **** Helper Classes **** //

class TblErr extends Error {

  public constructor(factName: string, message: string) {
    super('Error on DecisionTable(' + factName + ') : ' + message);
  }
}


// **** Export default **** //

export default DecisionTable;
