import csvToJson from 'csvtojson';
import loggerLib, { JetLogger, LoggerModes } from 'jet-logger';

import DecisionTable from './DecisionTable';

import {
  TAction,
  TCondition,
  TPrimitive,
  TRow,
} from './common/types';


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


// **** Types **** //

type TImport = Record<string, TPrimitive>;
type TImportsHolder = Record<string, TImport>;


// **** Functions **** //

class Trool {

  private logger: JetLogger;
  private csvImports: TImportsHolder;
  private decisionTables: DecisionTable[];

  /**
   * Constructor
   */
  public constructor(showLogs?: boolean) {
    // Logs
    if (showLogs === false) {
      this.logger = new JetLogger(LoggerModes.Off);
    } else {
      this.logger = loggerLib;
    }
    // Temp
    this.csvImports = {};
    this.decisionTables = [];
  }

  /**
   * Initialize the CSV rows.
   */
  public async init(
    filePathOrContent: string,
    initFromString?: boolean,
  ): Promise<void> {
    // Get rows
    let rows: TRow[] = [];
    if (initFromString) {
      rows = await csvToJson().fromString(filePathOrContent) as TRow[];
    } else {
      rows = await csvToJson().fromFile(filePathOrContent) as TRow[];
    }
    // Setup private stuff
    this.csvImports = this.setupImports(rows);
    this.decisionTables = this.getTables(rows);
  }

  /**
   * Setup imports from CSV file.
   */
  private setupImports(rows: TRow[]): TImportsHolder {
    const imports: TImportsHolder = {};
    let importName = '';
    let newImportObj: TImport = {};
    for (let i = 0; i < rows.length; i++) {
      const firstCell = rows[i].field1.trim();
      if (firstCell.startsWith('Import:')) {
        importName = this.getImportName(firstCell, imports);
      } else if (!!importName) {
        if (!/^[a-zA-Z0-9-_]+$/.test(firstCell)) {
          throw Error(Msgs.Errs.ImportProp + firstCell);
        }
        newImportObj[firstCell] = this.processValFromCell(rows[i].field2, 
          imports);
        if (this.isLastRow(rows, i)) {
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
  private getImportName(firstCell: string, imports: TImportsHolder): string {
    const firstCellArr = firstCell.split(' ');
    if (firstCellArr.length !== 2) {
      throw Error(Msgs.Errs.ImportStart + ` '${firstCell}'`);
    }
    const importName = firstCellArr[1];
    if (Object.prototype.hasOwnProperty.call(imports, importName)) {
      this.logger.warn(Msgs.Warnings.ImportName + importName);
    }
    return importName;
  }

  /**
   * Setup the decision tables from the rows.
   */
  private getTables(rows: TRow[]): DecisionTable[] {
    const decisionTables: DecisionTable[] = [];
    let startCellArr: null | string[] = null;
    let tableStart = -1;
    for (let i = 0; i < rows.length; i++) {
      const firstCol = rows[i].field1.trim();
      if (!!firstCol.startsWith('Table:')) {
        tableStart = i;
        startCellArr = this.getStartCellArr(firstCol);
      } else if (!!startCellArr && this.isLastRow(rows, i)) {
        const tableRows = rows.slice(tableStart, i + 1);
        const table = new DecisionTable(startCellArr[1], tableRows);
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
  private getStartCellArr(firstCol: string): string[] {
    const startCellArr: string[] = firstCol.split(' ');
    if (startCellArr.length !== 2) {
      throw Error(startCellArr[0] + ' ' + Msgs.Errs.startCell);
    }
    return startCellArr;
  }

  /**
   * See if a row is the last row in the table.
   */
  private isLastRow(rows: TRow[], idx: number): boolean {
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
  public applyRules<T>(factsHolder: T, memImports?: TImportsHolder): T {
    // Check table count
    const tableCount = this.decisionTables.length;
    if (tableCount === 0) {
      this.logger.warn(Msgs.Warnings.NoTbls);
      return factsHolder;
    } else {
      this.logger.info(tableCount + Msgs.ApplyingRules);
    }
    // Apply rules
    const imports = this.combineImports(this.csvImports, memImports),
      updatedFacts: Record<string, unknown> = {},
      factsHolderClone = { ...factsHolder } as Record<string, unknown>; 
    for (let i = 0; i < tableCount; i++) {
      const table = this.decisionTables[i],
        factVal = factsHolderClone[table.getFactName()],
        factArr = (Array.isArray(factVal) ? factVal : [factVal]) as 
          Record<string, unknown>[];
      updatedFacts[table.getFactName()] = this.updateFacts(table, factArr, 
        imports);
    }
    // Return
    return updatedFacts as T;
  }

  /**
   * Merge in-memory and csv imports to single object. If overlapping name, 
   * memory imports take priority.
   */
  private combineImports(
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
  private updateFacts(
    table: DecisionTable,
    facts: Record<string, unknown>[],
    imports: TImportsHolder,
  ): Record<string, unknown>[] {
    const tableRows = table.getRows(),
      conditions = table.getConditions(),
      actions = table.getActions();
    for (const fact of facts) {
      rowLoop:
      for (let rowIdx = 2; rowIdx < tableRows.length; rowIdx++) {
        const ruleArr = DecisionTable.rowToArr(tableRows[rowIdx]);
        if (ruleArr[0] === '') {
          throw Error(Msgs.Errs.RuleNameEmpty);
        }
        let colIdx = 1;
        for (const condition of conditions) {
          const passed = this.callCondFn(fact, condition, ruleArr[colIdx++], 
            imports);
          if (!passed) { continue rowLoop; }
        }
        for (const action of actions) {
          this.callActionFn(fact, action, ruleArr[colIdx++], imports);
        }
      }
    }
    return facts;
  }

  /**
   * Call an Condition function.
   */
  private callCondFn(
    fact: Record<string, unknown>,
    condition: TCondition,
    cellValStr: string,
    imports: TImportsHolder,
  ): boolean {
    if (cellValStr === '') {
      return true;
    }
    const retVal = this.processValFromCell(cellValStr, imports);
    if (retVal === null) {
      throw Error(Msgs.Errs.invalidVal + ` '${cellValStr}'`);
    }
    return condition(fact, retVal);
  }

  /**
   * Call an Action function.
   */
  private callActionFn(
    fact: Record<string, unknown>,
    action: TAction,
    cellValStr: string,
    imports: TImportsHolder,
  ): void {
    if (cellValStr === '') {
      return;
    }
    const cellVals = cellValStr.split(',');
    const retVals = [];
    for (const cellVal of cellVals) {
      const val = this.processValFromCell(cellVal, imports);
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
  private processValFromCell(
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
    if (Object.prototype.hasOwnProperty.call(imports, importKey)) {
      if (importVal) {
        return imports[importKey][importVal];
      }
    }
    return null;
  }
}


// **** Export default **** //

export default Trool;
