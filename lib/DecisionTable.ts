/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { ILogger } from 'jet-logger';

import { TblErr } from './other/classes';
import { TAction, TCondition, TRow } from './other/types';


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


// **** Types **** //

export interface IDecisionTable {
  factName: string;
  tableRows: TRow[];
  logger: ILogger;
  conditions: TCondition[];
  actions: TAction[];
}


// **** Functions **** //

/**
 * Get a new DecisionTable instance.
 */
function new_(
  factName: string,
  tableRows: TRow[],
  logger: ILogger,
): IDecisionTable {
  // Conditions/Actions
  const {
    conditions,
    actions,
  } = _getConditionsAndActions(tableRows, factName);
  // Return
  return {
    factName,
    tableRows,
    conditions,
    actions,
    logger,
  }
}

/**
 * Get Condition and Action functions.
 */
function _getConditionsAndActions(tableRows: TRow[], factName: string) {
  const colHeaderArr = rowToArr(tableRows[0]);
  const opsStrArr = rowToArr(tableRows[1]);
  let conditionsDone = false;
  const conditions = [];
  const actions = [];
  for (let i = 1; i < colHeaderArr.length; i++) {
    if (colHeaderArr[i] === 'Condition') {
      if (conditionsDone) {
        throw new TblErr(factName, Errors.ColHeaderArgmt);
      }
      const condFunc = _getCondOps(opsStrArr[i], factName);
      conditions.push(condFunc);
      conditionsDone = (colHeaderArr[i + 1] === 'Action');
    } else if (colHeaderArr[i] === 'Action') {
      if (!conditionsDone) {
        throw new TblErr(factName, Errors.ColHeaderArgmt);
      }
      const actionFunc = _getActionOps(opsStrArr[i], factName);
      actions.push(actionFunc);
      if (!colHeaderArr[i + 1]) { break; }
    } else {
      throw new TblErr(factName, Errors.ColHeader);
    }
  }
  // Return
  return { conditions, actions };
}

/**
 * Get row as array of strings.
 */
function rowToArr(row: TRow): string[] {
  return Object.values(row).map((cell) => cell.trim());
};

/**
 * Get the Condition functions.
 */
function _getCondOps(opStr: string, factName: string): TCondition {
  return (fact: Record<string, unknown>, paramVal: any): boolean => {
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
    return _compareVals(arr[1], attrVal, paramVal, factName);
  };
}

/**
 * Determine an equality operation from a string.
 */
function _compareVals(
  operator: string,
  val1: any,
  val2: any,
  factName: string,
): boolean {
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

/**
 * Get the action functions.
 */
function _getActionOps(actionStr: string, factName: string): TAction {
  if (!actionStr) {
    throw new TblErr(factName, Errors.OpBlank);
  }
  return (fact: Record<string, unknown>, cellVals: any[]): void => {
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


// **** Export default **** //

export default {
  new: new_,
  rowToArr,
} as const;