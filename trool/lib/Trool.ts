/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import csvToJson from 'csvtojson';
import { IFactsHolder, IImportsHolder, IRow, Logger, parseCell } from './shared';
import DecisionTable from './DecisionTable';
import TableErrs from './TableErrs';


class Trool {

    private readonly NO_TABLES_WARN = 'No decision tables found';
    private readonly IMPORT_START_ERR = 'Import start format error for';
    private readonly IMPORT_PROP_ERR = 'Import property can only be alpha-numeric and underscores ';
    private readonly UPDATE_START_MSG = ' DecisionTables found. Applying table logic to facts.';
    private readonly IMPORT_NAME_WARN = '!!WARNING!! The spreadsheet is using an import name ' +
        'already passed via the imports object. The spreadsheet will overwrite the import: ';

    private readonly logger: Logger;


    constructor(showLogs?: boolean) {
        this.logger = new Logger(showLogs);
    }


    /**
     * Main entry point for the library.
     *
     * @param filePath
     * @param facts
     * @param imports
     */
    public async applyRules(
        filePath: string,
        facts: IFactsHolder,
        imports?: IImportsHolder,
    ): Promise<IFactsHolder> {
        try {
            const jsonArr = await csvToJson().fromFile(filePath);
            const allImports = this.setupImports(jsonArr, imports || {});
            const decisionTables = this.getTables(jsonArr, facts, allImports);
            return this.updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /*********************************************************************************************
     *                            Add Imports from Spreadsheet
     ********************************************************************************************/

    /**
     * Setup imports from CSV file.
     *
     * @param jsonArr
     * @param imports
     */
    private setupImports(
        jsonArr: IRow[],
        imports: IImportsHolder,
    ): IImportsHolder {
        let importName = '';
        let newImportObj: any = {};
        for (let i = 0; i < jsonArr.length; i++) {
            const firstCell = jsonArr[i].field1.trim();
            if (firstCell.startsWith('Import:')) {
                importName = this.getImportName(firstCell, imports);
            } else if (!!importName) {
                if (!/^[a-zA-Z0-9-_]+$/.test(firstCell)) {
                    throw Error(this.IMPORT_PROP_ERR + firstCell);
                }
                newImportObj[firstCell] = parseCell(jsonArr[i].field2, imports);
                if (this.isLastRow(jsonArr, i)) {
                    imports[importName] = newImportObj;
                    importName = '';
                    newImportObj = {};
                }
            }
        }
        return imports;
    }


    private getImportName(firstCell: string, imports: IImportsHolder): string {
        const firstCellArr = firstCell.split(' ');
        if (firstCellArr.length !== 2) {
            throw Error(this.IMPORT_START_ERR + ` '${firstCell}'`);
        }
        const importName = firstCellArr[1];
        if (imports.hasOwnProperty(importName)) {
            this.logger.warn(this.IMPORT_NAME_WARN + importName);
        }
        return importName;
    }


    /*********************************************************************************************
     *                                Setup Decision Tables
     ********************************************************************************************/

    /**
     * Setup the decision tables from the csv file.
     *
     * @param jsonArr
     * @param facts
     * @param imports
     */
    private getTables(
        jsonArr: IRow[],
        facts: IFactsHolder,
        imports: IImportsHolder,
    ): DecisionTable[] {
        const decisionTables: DecisionTable[] = [];
        let startCellArr: null | string[] = null;
        let tableStart = -1;
        for (let i = 0; i < jsonArr.length; i++) {
            const firstCol = jsonArr[i].field1.trim();
            if (firstCol.startsWith('Table:')) {
                tableStart = i;
                startCellArr = firstCol.split(' ');
            } else if (startCellArr && this.isLastRow(jsonArr, i)) {
                const showLogs = this.logger.showLogs;
                const id = decisionTables.length + 1;
                const tableRows = jsonArr.slice(tableStart, i + 1);
                const factArr = this.getFacts(startCellArr, id, facts);
                const table = new DecisionTable(id, startCellArr[1], showLogs);
                table.initTable(tableRows, factArr, imports);
                decisionTables.push(table);
                tableStart = -1;
                startCellArr = null;
            }
        }
        return decisionTables;
    }


    private getFacts(
        startCellArr: string[],
        id: number,
        facts: IFactsHolder,
    ): Array<InstanceType<any>> {
        const tableErrs = new TableErrs(id);
        if (startCellArr.length !== 2) {
            throw Error(tableErrs.startCell);
        } else if (!facts[startCellArr[1]]) {
            throw Error(tableErrs.factFalsey);
        }
        const factArr = facts[startCellArr[1]];
        return (factArr instanceof Array) ? factArr : [factArr];
    }


    /*********************************************************************************************
     *                                    Update Facts
     ********************************************************************************************/

    private updateFacts(decisionTables: DecisionTable[]): IFactsHolder {
        const tableCount = decisionTables.length;
        if (tableCount === 0) {
            this.logger.warn(this.NO_TABLES_WARN);
            return {};
        } else {
            this.logger.log(tableCount + this.UPDATE_START_MSG);
        }
        const updatedFacts: IFactsHolder = {};
        for (let i = 0; i < tableCount; i++) {
            const table = decisionTables[i];
            updatedFacts[table.factName] = table.updateFacts();
        }
        return updatedFacts;
    }


    /*********************************************************************************************
     *                                      Helpers
     ********************************************************************************************/

    private isLastRow(jsonArr: IRow[], idx: number): boolean {
        const nextCell = jsonArr[idx + 1] ? jsonArr[idx + 1].field1.trim() : '';
        return !nextCell || nextCell.startsWith('Table:') || nextCell.startsWith('Import:');
    }
}

export default Trool;
