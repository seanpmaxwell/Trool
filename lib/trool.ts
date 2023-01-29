/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import csvToJson from 'csvtojson';
import { Converter } from 'csvtojson/v2/Converter';
import { jetLogger, LoggerModes } from 'jet-logger';

import DecisionTable, { IDecisionTable } from './DecisionTable';

import {
  TAction,
  TCondition,
  TPrimitive,
  TRow,
} from './other/types';


// **** Variables **** //

const Msgs = {
  ApplyingRules: ' DecisionTables found. Applying table logic to facts.',
  Warnings: {
    NoTbls: 'No decision tables found',
    ImportName: '!!WARNING!! The spreadsheet is using an import name ' +
      'already passed via the imports object. The spreadsheet will ' + 
      'overwrite the import: ',
  },
  Errs: {
    ImportStart: 'Import start format error for',
    ImportProp: 'Import property can only be alpha-numeric and underscores ',
    RuleNameEmpty: 'The rule name (first cell for a rule row for a decision ' + 
      'table) cannot be empty.',
    invalidVal: 'The value provided in the table was not a null, boolean, ' + 
      'number, string, or import. Cell value or values:',
    startCell: 'First cell must contain "Table:" and specify 1 and only ' + 
      '1 fact.',
  },
} as const;


let logger = jetLogger();


// **** Types **** //

type TImport = Record<string, TPrimitive>;
type TImportsHolder = Record<string, TImport>;

export interface IEngine {
  csvImports: TImportsHolder;
  decisionTables: IDecisionTable[];
  applyRules: typeof applyRules;
}


// **** Functions **** //

/**
 * Get the rule engine.
 */
async function trool(
  filePathOrContent: string,
  initFromString?: boolean,
  showLogs?: boolean,
): Promise<IEngine> {
  const rows = await _getRows(filePathOrContent, initFromString);
  return _newEngine(!!showLogs, rows)
}

/**
* Get an object array from either a csv file or a csv string.
*/
function _getRows(
  filePathOrContent: string,
  initFromString?: boolean,
): Converter {
  if (initFromString) {
    return csvToJson().fromString(filePathOrContent);
  } else {
    return csvToJson().fromFile(filePathOrContent);
  }
}

/**
 * New rule engine instance.
 */
function _newEngine(showLogs: boolean, rows: any[]) {
  if (showLogs === false) {
    logger = jetLogger(LoggerModes.Off);
  }
  return {
    csvImports: _setupImports(rows),
    decisionTables: _getTables(rows),
    applyRules,
  } as const;
}

/**
 * Setup imports from CSV file.
 */
function _setupImports(rows: TRow[]): TImportsHolder {
  const imports: TImportsHolder = {};
  let importName = '';
  let newImportObj: TImport = {};
  for (let i = 0; i < rows.length; i++) {
    const firstCell = rows[i].field1.trim();
    if (firstCell.startsWith('Import:')) {
      importName = _getImportName(firstCell, imports);
    } else if (!!importName) {
      if (!/^[a-zA-Z0-9-_]+$/.test(firstCell)) {
        throw Error(Msgs.Errs.ImportProp + firstCell);
      }
      newImportObj[firstCell] = _processValFromCell(rows[i].field2, imports);
      if (_isLastRow(rows, i)) {
        imports[importName] = newImportObj;
        importName = '';
        newImportObj = {};
      }
    }
  }
  return imports;
}

/**
 * Get the name of an import.
 */
function _getImportName(firstCell: string, imports: TImportsHolder): string {
  const firstCellArr = firstCell.split(' ');
  if (firstCellArr.length !== 2) {
    throw Error(Msgs.Errs.ImportStart + ` '${firstCell}'`);
  }
  const importName = firstCellArr[1];
  if (imports.hasOwnProperty(importName)) {
    logger.warn(Msgs.Warnings.ImportName + importName);
  }
  return importName;
}

/**
 * Setup the decision tables from the rows.
 */
function _getTables(rows: TRow[]): IDecisionTable[] {
  const decisionTables: IDecisionTable[] = [];
  let startCellArr: null | string[] = null;
  let tableStart = -1;
  for (let i = 0; i < rows.length; i++) {
    const firstCol = rows[i].field1.trim();
    if (!!firstCol.startsWith('Table:')) {
      tableStart = i;
      startCellArr = _getStartCellArr(firstCol);
    } else if (!!startCellArr && _isLastRow(rows, i)) {
      const tableRows = rows.slice(tableStart, i + 1);
      const table = DecisionTable.new(startCellArr[1], tableRows, logger);
      decisionTables.push(table);
      tableStart = -1;
      startCellArr = null;
    }
  }
  return decisionTables;
}

/**
 * Check table name
 */
function _getStartCellArr(firstCol: string): string[] {
  const startCellArr: string[] = firstCol.split(' ');
  if (startCellArr.length !== 2) {
    throw Error(startCellArr[0] + ' ' + Msgs.Errs.startCell);
  }
  return startCellArr;
}

/**
 * See if a row is the last row in the table.
 */
function _isLastRow(rows: TRow[], idx: number): boolean {
  const nextCell = (rows[idx + 1] ? rows[idx + 1].field1.trim() : '');
  return (
    !nextCell || 
    nextCell.startsWith('Table:') || 
    nextCell.startsWith('Import:')
  );
}

/**
 * Apply rules from the decision-tables to the facts.
 */
function applyRules<T>(
  this: IEngine,
  factsHolder: T,
  memImports?: TImportsHolder,
): T {
  // Check table count
  const tableCount = this.decisionTables.length;
  if (tableCount === 0) {
    logger.warn(Msgs.Warnings.NoTbls);
    return factsHolder;
  } else {
    logger.info(tableCount + Msgs.ApplyingRules);
  }
  // Apply rules
  const imports = _combineImports(this.csvImports, memImports),
    updatedFacts: Record<string, unknown> = {},
    factsHolderClone = { ...factsHolder } as Record<string, unknown>; 
  for (let i = 0; i < tableCount; i++) {
    const table = this.decisionTables[i],
      factVal = factsHolderClone[table.factName],
      factArr = (Array.isArray(factVal) ? factVal : [factVal]);
    updatedFacts[table.factName] = _updateFacts<T>(table, factArr, imports);
  }
  // Return
  return updatedFacts as T;
}

/**
 * Merge in-memory and csv imports to single object. If overlapping name, 
 * memory imports take priority.
 */
function _combineImports(
  csvImports: TImportsHolder,
  memImports?: TImportsHolder,
): TImportsHolder {
  const allImports: TImportsHolder = {};
  for (const key in csvImports) {
    allImports[key] = csvImports[key];
  }
  for (const key in memImports) {
    allImports[key] = memImports[key];
  }
  return allImports;
}

/**
 * Update a single array of facts.
 */
function _updateFacts<T>(
  table: IDecisionTable,
  facts: Record<string, unknown>[],
  imports: TImportsHolder,
): Record<string, unknown>[] {
  const { tableRows, conditions, actions } = table;
  for (let factIdx = 0; factIdx < facts.length; factIdx++) {
    const fact = facts[factIdx];
    rowLoop:
    for (let rowIdx = 2; rowIdx < tableRows.length; rowIdx++) {
      const ruleArr = DecisionTable.rowToArr(tableRows[rowIdx]);
      if (ruleArr[0] === '') {
        throw Error(Msgs.Errs.RuleNameEmpty);
      }
      let colIdx = 1;
      for (let i = 0; i < conditions.length; i++) {
        const passed = _callCondOp(fact, conditions[i], ruleArr[colIdx++], 
          imports);
        if (!passed) { continue rowLoop; }
      }
      for (let i = 0; i < actions.length; i++) {
        _callActionOp(fact, actions[i], ruleArr[colIdx++], imports);
      }
    }
  }
  return facts;
}

/**
 * Call an Condition function.
 */
function _callCondOp<T>(
  fact: Record<string, unknown>,
  condition: TCondition,
  cellValStr: string,
  imports: TImportsHolder,
): boolean {
  if (cellValStr === '') {
    return true;
  }
  const retVal = _processValFromCell(cellValStr, imports);
  if (retVal === null) {
    throw Error(Msgs.Errs.invalidVal + ` '${cellValStr}'`);
  }
  return condition(fact, retVal);
}

/**
 * Call an Action function.
 */
function _callActionOp<T>(
  fact: Record<string, unknown>,
  action: TAction,
  cellValStr: string,
  imports: TImportsHolder,
): void {
  if (cellValStr === '') {
    return;
  }
  const cellVals = cellValStr.split(',');
  const retVals = []
  for (let i = 0; i < cellVals.length; i++) {
    const val = _processValFromCell(cellVals[i], imports);
    if (val === null) {
      throw Error(Msgs.Errs.invalidVal + ` '${cellValStr}'`);
    } else {
      retVals.push(val);
    }
  }
  action(fact, retVals);
}

/**
 * Look at a value cell. And determine the value from the string.
 */
function _processValFromCell(
  cellValStr: string,
  imports: TImportsHolder,
): TPrimitive {
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
    }
  }
  return null;
};


// **** Export default **** //

export default trool;
