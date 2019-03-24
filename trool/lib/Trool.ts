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
    private readonly TABLE_FORMAT_ERR = 'End of DecisionTable reached without a start at row ';
    private readonly UPDATE_START_MSG = ' DecisionTables found. Applying table logic to facts.';
    private readonly IMPORT_NAME_WARN = '!!WARNING!! The spreadsheet is using an import name ' +
        'already passed via the imports object. The spreadsheet will overwrite the import: ';

    private readonly alphaNumReg = /^[0-9a-zA-Z_]+$/;
    private readonly logger: Logger;


    constructor(showLogs?: boolean) {
        this.logger = new Logger(showLogs || false);
    }


    public async applyRules(filePath: string, facts: FactsHolder, importsObj?: ImportsObj):
        Promise<FactsHolder> {

        try {
            const jsonArr = await csvToJson().fromFile(filePath);
            const allImports = this.setupImports(jsonArr, importsObj || {});
            const decisionTables = this.getTables(jsonArr, facts, allImports);

            return this.updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /*********************************************************************************************
     *                            Add Imports from Spreadsheet
     ********************************************************************************************/

    private setupImports(jsonArr: Array<Row>, importsObj: ImportsObj): ImportsObj {

        importsObj = importsObj || {};

        let importName = '';
        let newImportObj: any = {};

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCell = jsonArr[i].field1.trim();

            if (firstCell.startsWith('ImportObject: ')) {

                importName = this.getImportName(firstCell, importsObj);

            } else if (importName) {

                if (!this.alphaNumReg.test(firstCell)) {
                    throw Error(this.IMPORT_PROP_ERR + firstCell);
                }

                newImportObj[firstCell] = parseCell(jsonArr[i].field2, importsObj);

                const nextCell = jsonArr[i + 1] ? jsonArr[i + 1].field1.trim() : '';
                const endReached = !nextCell || nextCell.startsWith('TableStart:') ||
                    nextCell.startsWith('ImportStart:');

                if (endReached) {
                    importsObj[importName] = newImportObj;
                    importName = '';
                    newImportObj = {};
                }
            }
        }

        return importsObj;
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

    private getTables(jsonArr: Array<Row>, facts: FactsHolder, importsObj: ImportsObj):
        DecisionTable[] {

        const decisionTables = [];
        let startCellArr: string[] = [];
        let tableStart = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCellStr = jsonArr[i].field1.trim();

            if (firstCellStr.startsWith('TableStart: ')) {
                tableStart = i;
                startCellArr = firstCellStr.split(' ');
            } else if (firstCellStr === 'TableEnd') {

                if (tableStart === -1) {
                    throw Error(this.TABLE_FORMAT_ERR + i);
                }

                const id: number = decisionTables.length + 1;
                const table = jsonArr.slice(tableStart, i);
                const factArr = this.getFactArr(startCellArr, id, facts);
                const decisionTable = new DecisionTable(id, startCellArr[1], this.logger.showLogs);

                decisionTable.initTable(table, factArr, importsObj);
                decisionTables.push(decisionTable);

                tableStart = -1;
                startCellArr = [];
            }
        }

        return decisionTables;
    }


    private getFactArr(startCellArr: string[], id: number, factsObj: FactsHolder): Object[] {

        if (startCellArr.length !== 2) {
            throw Error(TableErrs.getStartCellErr(id));
        } else if (!factsObj[startCellArr[1]]) {
            throw Error(TableErrs.getFactFalseyErr(id));
        }

        const facts = factsObj[startCellArr[1]];
        return (facts instanceof Array) ? facts : [facts];
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
