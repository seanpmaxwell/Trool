/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import csvToJson from 'csvtojson';
import { JetLogger, LoggerModes } from 'jet-logger';
import { getNewDecisionTbl, IDecisionTable, rowToArr, TAction, TCondition } from './decisionTable';



/*****************************************************************************************
 *                                    Vars/Constants
 ****************************************************************************************/

const messages = {
    applyingRules: ' DecisionTables found. Applying table logic to facts.',
    warnings: {
        noTables: 'No decision tables found',
        importName: '!!WARNING!! The spreadsheet is using an import name already passed via ' +
            'the imports object. The spreadsheet will overwrite the import: ',
    },
    errors: {
        importStart: 'Import start format error for',
        importProp: 'Import property can only be alpha-numeric and underscores ',
        ruleNameEmpty: 'The rule name (first cell for a rule row for a decision table) cannot ' + 
        'be empty.',
        invalidVal: 'The value provided in the table was not a null, boolean, number, string, ' + 
        'or import. Cell value or values:',
        startCell: 'First cell must contain "Table:" and specify 1 and only 1 fact.',
    },
} as const;


let logger = JetLogger();



/*****************************************************************************************
 *                                       Types
 ****************************************************************************************/

export type TPrimitive = boolean | number | null | string;
type TObject = Record<string, any>;
export type TRow = {
    [key in `field${number}`]: string;
};
// export type TRow = {[key: `field${number}`]: string}
export type TFactsHolder = Record<string, TObject[]>;
type TImportsHolder = Record<string, TObject>;
type TImport = TImportsHolder[keyof TImportsHolder];
export type TFactsArr = TFactsHolder[keyof TFactsHolder];
export type TFact = TFactsArr[number];
export type TLogger = typeof logger;

interface ITrool {
    csvImports: TImportsHolder;
    decisionTables: IDecisionTable[];
    applyRules: typeof applyRules;
}



/*****************************************************************************************
 *                                       Functions
 ****************************************************************************************/

/**
 * Main export function.
 * 
 * @param filePathOrContent 
 * @param initFromString 
 * @param showLogs 
 * @returns 
 */
export default async function trool(
    filePathOrContent: string,
    initFromString?: boolean,
    showLogs?: boolean,
): Promise<ITrool> {
    if (showLogs === false) {
        logger = JetLogger(LoggerModes.Off);
    }
    const rows = await getRows(filePathOrContent, initFromString);
    return {
        csvImports: setupImports(rows),
        decisionTables: getTables(rows),
        applyRules,
    } as const;
}


/**
 * Get an object array from either a csv file or a csv string.
 * 
 * @param filePathOrContent 
 * @param initFromString 
 * @returns 
 */
function getRows(filePathOrContent: string, initFromString?: boolean) {
    return initFromString ? csvToJson().fromString(filePathOrContent) : 
        csvToJson().fromFile(filePathOrContent);
}


/**
 * Setup imports from CSV file.
 *
 * @param rows
 */
function setupImports(rows: TRow[]): TImportsHolder {
    const imports: TImportsHolder = {};
    let importName = '';
    let newImportObj: TImport = {};
    for (let i = 0; i < rows.length; i++) {
        const firstCell = rows[i].field1.trim();
        if (firstCell.startsWith('Import:')) {
            importName = getImportName(firstCell, imports);
        } else if (!!importName) {
            if (!/^[a-zA-Z0-9-_]+$/.test(firstCell)) {
                throw Error(messages.errors.importProp + firstCell);
            }
            newImportObj[firstCell] = processValFromCell(rows[i].field2, imports);
            if (isLastRow(rows, i)) {
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
 * 
 * @param firstCell 
 * @param imports 
 * @returns 
 */
function getImportName(firstCell: string, imports: TImportsHolder): string {
    const firstCellArr = firstCell.split(' ');
    if (firstCellArr.length !== 2) {
        throw Error(messages.errors.importStart + ` '${firstCell}'`);
    }
    const importName = firstCellArr[1];
    if (imports.hasOwnProperty(importName)) {
        logger.warn(messages.warnings.importName + importName);
    }
    return importName;
}


/**
 * Setup the decision tables from the rows.
 *
 * @param rows
 * @param facts
 */
function getTables(rows: TRow[]): IDecisionTable[] {
    const decisionTables: IDecisionTable[] = [];
    let startCellArr: null | string[] = null;
    let tableStart = -1;
    for (let i = 0; i < rows.length; i++) {
        const firstCol = rows[i].field1.trim();
        if (!!firstCol.startsWith('Table:')) {
            tableStart = i;
            startCellArr = getStartCellArr(firstCol);
        } else if (!!startCellArr && isLastRow(rows, i)) {
            const tableRows = rows.slice(tableStart, i + 1);
            const table = getNewDecisionTbl(startCellArr[1], tableRows, logger);
            decisionTables.push(table);
            tableStart = -1;
            startCellArr = null;
        }
    }
    return decisionTables;
}


/**
 * Check table name
 * 
 * @param firstCol
 * @returns 
 */
function getStartCellArr(firstCol: string): string[] {
    const startCellArr: string[] = firstCol.split(' ');
    if (startCellArr.length !== 2) {
        throw Error(startCellArr[0] + ' ' + messages.errors.startCell);
    }
    return startCellArr;
}


/**
 * See if a row is the last row in the table.
 * 
 * @param rows 
 * @param idx 
 * @returns 
 */
function isLastRow(rows: TRow[], idx: number): boolean {
    const nextCell = (rows[idx + 1] ? rows[idx + 1].field1.trim() : '');
    return !nextCell || nextCell.startsWith('Table:') || nextCell.startsWith('Import:');
}


/**
 * Apply rules from the decision-tables to the facts.
 * 
 * @param this 
 * @param factsHolder 
 * @param memImports 
 * @returns 
 */
function applyRules<T extends TObject>(
    this: ITrool,
    factsHolder: T,
    memImports?: TImportsHolder,
): T {
    const tableCount = this.decisionTables.length;
    if (tableCount === 0) {
        logger.warn(messages.warnings.noTables);
        return factsHolder;
    } else {
        logger.info(tableCount + messages.applyingRules);
    }
    const imports = combineImports(this.csvImports, memImports);
    const updatedFacts: TObject = {};
    for (let i = 0; i < tableCount; i++) {
        const table = this.decisionTables[i];
        const factVal = factsHolder[table.factName];
        const factArr = (factVal instanceof Array) ? factVal : [factVal];
        updatedFacts[table.factName] = updateFacts(table, factArr, imports)
    }
    return updatedFacts as T;
}


/**
 * Merge in-memory and csv imports to single object. If overlapping name, 
 * memory imports take priority.
 * 
 * @param csvImports 
 * @param memImports 
 * @returns 
 */
function combineImports(
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
 * 
 * @param table 
 * @param facts 
 * @param imports 
 * @returns 
 */
function updateFacts(
    table: IDecisionTable,
    facts: TObject[],
    imports: TImportsHolder,
): TObject[] {
    const { tableRows, conditions, actions } = table;
    for (let factIdx = 0; factIdx < facts.length; factIdx++) {
        const fact = facts[factIdx];
        rowLoop:
        for (let rowIdx = 2; rowIdx < tableRows.length; rowIdx++) {
            const ruleArr = rowToArr(tableRows[rowIdx]);
            if (ruleArr[0] === '') {
                throw Error(messages.errors.ruleNameEmpty);
            }
            let colIdx = 1;
            for (let i = 0; i < conditions.length; i++) {
                const passed = callCondOp(fact, conditions[i], ruleArr[colIdx++], imports);
                if (!passed) { continue rowLoop; }
            }
            for (let i = 0; i < actions.length; i++) {
                callActionOp(fact, actions[i], ruleArr[colIdx++], imports);
            }
        }
    }
    return facts;
}


/**
 * Call an Condition function.
 * 
 * @param fact 
 * @param condition 
 * @param cellValStr 
 * @param imports 
 * @returns 
 */
function callCondOp(
    fact: TFact,
    condition: TCondition,
    cellValStr: string,
    imports: TImportsHolder,
): boolean {
    if (cellValStr === '') {
        return true;
    }
    const retVal = processValFromCell(cellValStr, imports);
    if (retVal === null) {
        throw Error(messages.errors.invalidVal + ` '${cellValStr}'`);
    }
    return condition(fact, retVal);
}


/**
 * Call an Action function.
 * 
 * @param fact 
 * @param action 
 * @param cellValStr 
 * @param imports 
 * @returns 
 */
function callActionOp(
    fact: TFact,
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
        const val = processValFromCell(cellVals[i], imports);
        if (val === null) {
            throw Error(messages.errors.invalidVal + ` '${cellValStr}'`);
        } else {
            retVals.push(val);
        }
    }
    action(fact, retVals);
}


/**
 * Look at a value cell. And determine the value from the string.
 * 
 * @param cellValStr 
 * @param imports 
 * @returns 
 */
 function processValFromCell(
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
