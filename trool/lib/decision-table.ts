/**
 * Decision Table class. Execute a group of rules on a table. There are two categories of
 * operations: Condition operations and Action operations.
 *
 * created by Sean Maxwell Mar 3, 2019
 */

import { TableError } from './shared';
import { TFact, TLogger, TPrimitive, TRow } from './trool';


// **** Vars/Constants **** //

const errors = {
    colHeader: 'Action/Condition column headers can only be "Condition" or "Action".',
    colHeaderArgmt: 'All conditions must be specified before all actions',
    opBlank: 'Operation cannot be blank',
    opFormat: 'The operation must began with the Fact\'s attribute, contain one operator, and ' + 
        'end with "$param". Operation:',
    attrUndef: 'Attribute does not exist on the fact for operation:',
    mustEndWithParam: 'Condition operation must end with "$param". Operation:',
    paramCount: 'The number of params for an action operation must match the number of argument ' + 
        'for the method:',
    assignParamCount: 'An assignment action operation can only contain one argument. Assignment:',
    notAnOp: 'The following operator is not a comparison operator:',
} as const;


// **** Types **** //

export type TCondition = (fact: TFact, paramVal: any) => boolean;
export type TAction = (fact: TFact, cellVals: TPrimitive[]) => void;

export interface IDecisionTable {
    factName: string;
    tableRows: TRow[];
    logger: TLogger;
    conditions: TCondition[];
    actions: TAction[];
}


// **** Functions **** //

/**
 * Get a new DecisionTable instance.
 */
export function getNewDecisionTbl(
    factName: string,
    tableRows: TRow[],
    logger: TLogger,
): IDecisionTable {
    const { conditions, actions } = getConditionsAndActions(tableRows, factName);
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
function getConditionsAndActions(tableRows: TRow[], factName: string) {
    const colHeaderArr = rowToArr(tableRows[0]);
    const opsStrArr = rowToArr(tableRows[1]);
    let conditionsDone = false;
    const conditions = [];
    const actions = [];
    for (let i = 1; i < colHeaderArr.length; i++) {
        if (colHeaderArr[i] === 'Condition') {
            if (conditionsDone) {
                throw new TableError(factName, errors.colHeaderArgmt);
            }
            const condFunc = getCondOps(opsStrArr[i], factName);
            conditions.push(condFunc);
            conditionsDone = (colHeaderArr[i + 1] === 'Action');
        } else if (colHeaderArr[i] === 'Action') {
            if (!conditionsDone) {
                throw new TableError(factName, errors.colHeaderArgmt);
            }
            const actionFunc = getActionOps(opsStrArr[i], factName);
            actions.push(actionFunc);
            if (!colHeaderArr[i + 1]) { break; }
        } else {
            throw new TableError(factName, errors.colHeader);
        }
    }

    return { conditions, actions };
}

/**
 * Get row as array of strings.
 */
 export function rowToArr(row: TRow): string[] {
    return Object.values(row).map((cell) => cell.trim());
};

/**
 * Get the Condition functions.
 */
function getCondOps(opStr: string, factName: string): TCondition {
    return (fact: TFact, paramVal: any): boolean => {
        const arr = opStr.split(' ');
        const property = arr[0].replace('()', '');
        if (!opStr) {
            throw new TableError(factName, errors.opBlank);
        } else if (arr.length !== 3) {
            throw new TableError(factName, errors.opFormat + ` "${opStr}"`);
        } else if (fact[property] === undefined) {
            throw new TableError(factName, errors.attrUndef + ` "${opStr}"`);
        } else if (arr[2] !== '$param') {
            throw new TableError(factName, errors.mustEndWithParam + ` "${opStr}"`);
        }
        let attrVal = null;
        if (typeof fact[property] === 'function') {
            attrVal = fact[property]();
        } else  {
            attrVal = fact[property];
        }
        return compareVals(arr[1], attrVal, paramVal, factName);
    };
}

/**
 * Determine an equality operation from a string.
 */
function compareVals(operator: string, val1: any, val2: any, factName: string): boolean {
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
        throw new TableError(factName, errors.notAnOp + ` '${operator}'`);
    }
}

/**
 * Get the action functions.
 */
function getActionOps(actionStr: string, factName: string): TAction {
    if (!actionStr) {
        throw new TableError(factName, errors.opBlank);
    }
    return (fact: TFact, cellVals: any[]): void => {
        const argLength = actionStr.split('$param').length - 1;
        const op = ` "${actionStr}"`;
        if (argLength !== cellVals.length) {
            throw new TableError(factName, errors.paramCount + op)
        }
        const opArr = actionStr.split(' ');
        // Check if assignment or method call
        if (opArr[1] === '=') {
            if (cellVals.length !== 1) {
                throw new TableError(factName, errors.assignParamCount + op);
            } else if (fact[opArr[0]] === undefined) {
                throw new TableError(factName, errors.attrUndef + op);
            }
            fact[opArr[0]] = cellVals[0];
        } else {
            const n = actionStr.lastIndexOf('(');
            const methodName = actionStr.substring(0, n);
            if (fact[methodName] === undefined) {
                throw new TableError(factName, errors.attrUndef + op);
            }
            fact[methodName](...cellVals);
        }
    };
}
