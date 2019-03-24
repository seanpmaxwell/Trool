/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvToJson from 'csvtojson';
import { FactsHolder, ImportsObj, Row, Logger, parseCell } from './shared';
import DecisionTable from './DecisionTable';
import TableErrs from './TableErrs';


class Trool {

    private readonly IMPORT_START_ERR = 'Import start format error for ';
    private readonly IMPORT_PROP_ERR = 'Import property can only be alpha-numeric and underscores ';
    private readonly TABLE_FORMAT_ERR = 'DecisionTables must be separated by an empty row. Row#: ';
    private readonly UPDATE_START_MSG = ' DecisionTables found. Applying table logic to facts.';
    private readonly IMPORT_NAME_WARN = '!!WARNING!! The spreadsheet is using an import name ' +
        'already passed via the imports object. The spreadsheet will overwrite the import: ';

    private readonly alphaNumReg = /^[0-9a-zA-Z_]+$/;
    private readonly logger: Logger;


    constructor(showLogs?: boolean) {
        this.logger = new Logger(showLogs || false);
    }


    public async applyRules(filePath: string, facts: FactsHolder, imports?: ImportsObj):
        Promise<FactsHolder> {

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

    private setupImports(jsonArr: Array<Row>, imports: ImportsObj): ImportsObj {

        let importName = '';
        let newImportObj: any = {};

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCell = jsonArr[i].field1.trim();

            if (firstCell.startsWith('Import: ')) {

                importName = this.getImportName(firstCell, imports);

            } else if (importName) {

                if (!this.alphaNumReg.test(firstCell)) {
                    throw Error(this.IMPORT_PROP_ERR + firstCell);
                }

                newImportObj[firstCell] = parseCell(jsonArr[i].field2, imports);

                const nextCell = jsonArr[i + 1] ? jsonArr[i + 1].field1.trim() : '';
                const endReached = !nextCell || nextCell.startsWith('Table: ') ||
                    nextCell.startsWith('Import: ');

                if (endReached) {
                    imports[importName] = newImportObj;
                    importName = '';
                    newImportObj = {};
                }
            }
        }

        return imports;
    }


    private getImportName(firstCell: string, importsObj: ImportsObj): string {

        const firstCellArr = firstCell.split(' ');

        if (firstCellArr.length !== 2) {
            throw Error(this.IMPORT_START_ERR + firstCell);
        }

        const importName = firstCellArr[1];

        if (importsObj.hasOwnProperty(importName)) {
            this.logger.warn(this.IMPORT_NAME_WARN + importName);
        }

        return importName;
    }


    /*********************************************************************************************
     *                                Setup Decision Tables
     ********************************************************************************************/

    private getTables(jsonArr: Row[], facts: FactsHolder, imports: ImportsObj): DecisionTable[] {

        const decisionTables: DecisionTable[] = [];
        let startCellArr: string[] = [];
        let tableStart = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCol = jsonArr[i].field1.trim();

            if (firstCol.startsWith('Table: ')) {

                if (tableStart !== -1) {
                    throw Error(this.TABLE_FORMAT_ERR + i);
                }

                tableStart = i;
                startCellArr = firstCol.split(' ');

            } else if (tableStart !== -1 && this.isLastRow(jsonArr[i + 1])) {

                const id = decisionTables.length + 1;
                const table = jsonArr.slice(tableStart, i);
                const factArr = this.getFactArr(startCellArr, id, facts);

                const decisionTable = new DecisionTable(id, startCellArr[1], this.logger.showLogs);
                decisionTable.initTable(table, factArr, imports);
                decisionTables.push(decisionTable);

                tableStart = -1;
                startCellArr = [];
            }
        }

        return decisionTables; // pick up here
    }


    private isLastRow(nextRow: Row): boolean {

        if (!nextRow) {
            return true;
        }

        const nextCell = nextRow.field1.trim();
        return !nextCell || nextCell.startsWith('Table: ') || nextCell.startsWith('Import: ');
    }


    private getFactArr(startCellArr: string[], id: number, facts: FactsHolder): Object[] {

        if (startCellArr.length !== 2) {
            throw Error(TableErrs.getStartCellErr(id));
        } else if (!facts[startCellArr[1]]) {
            throw Error(TableErrs.getFactFalseyErr(id));
        }

        const factArr = facts[startCellArr[1]];
        return (facts instanceof Array) ? factArr : [factArr];
    }


    /*********************************************************************************************
     *                                    Update Facts
     ********************************************************************************************/

    private updateFacts(decisionTables: DecisionTable[]): FactsHolder {

        const tableCount = decisionTables.length;

        if (tableCount === 0) {
            this.logger.warn('No decision tables found');
            return {};
        } else {
            this.logger.log(tableCount + this.UPDATE_START_MSG);
        }

        const updatedFacts: FactsHolder = {};

        for (let i = 0; i < tableCount; i++) {
            const table = decisionTables[i];
            updatedFacts[table.factName] = table.updateFacts();
        }

        return updatedFacts;
    }
}

export default Trool;
