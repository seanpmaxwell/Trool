/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';

import { cinfo } from 'simple-color-print';
import { FactsObj, ImportsObj, Row, parseCell } from './shared';

import DecisionTable from './DecisionTable';
import TableErrs from './TableErrs';


class Trool {

    private readonly IMPORT_START_ERR = 'Import start format error for ';
    private readonly IMPORT_PROP_ERR = 'Import property must only be alpha-numeric ';
    private readonly TABLE_FORMAT_ERR = 'End of DecisionTable reached without a start at row ';
    private readonly alphaNumReg = /^[0-9a-zA-Z]+$/;


    public async applyRules(filePath: string, factsObject: FactsObj, importsObj?: ImportsObj,
                            showLogs?: boolean): Promise<FactsObj> {

        importsObj = importsObj || {};
        showLogs = showLogs || false;

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            const allImports = this.setupImports(jsonArr, importsObj);
            const decisionTables = this.getTables(jsonArr, factsObject, allImports, showLogs);

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

        // Find spreadsheet imports
        for (let i = 0; i < jsonArr.length; i++) {

            const firstCell = jsonArr[i].field1.trim();

            // Start new spreadsheet import
            if (firstCell.startsWith('ImportObject: ')) {

                const firstCellArr = firstCell.split(' ');

                if (firstCellArr.length !== 2) {
                    throw Error(this.IMPORT_START_ERR + firstCell);
                }

                importName = firstCellArr[1];
                newImportObj = {};

            } else if (importName) {

                if (!this.alphaNumReg.test(firstCell)) {
                    throw Error(this.IMPORT_PROP_ERR + firstCell);
                }

                // Add property
                newImportObj[firstCell] = parseCell(jsonArr[i].field2, importsObj);

                // Append new object to imports object if end reached
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


    /*********************************************************************************************
     *                                Setup Decision Tables
     ********************************************************************************************/

    /**
     * Get array of DecisionTable objects from spreadsheet.
     */
    private getTables(jsonArr: Array<Row>, factsObj: FactsObj, importsObj: ImportsObj,
                       showLogs: boolean): DecisionTable[] {

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
                const factArr = this.getFactArr(startCellArr, id, factsObj);
                const decisionTable = new DecisionTable(id, startCellArr[1], showLogs);

                decisionTable.initTable(table, factArr, importsObj); // pick up here, make sure table passed is setup correctly
                decisionTables.push(decisionTable);

                tableStart = -1;
                startCellArr = [];
            }
        }

        return decisionTables;
    }


    /**
     * Extract the array of facts from the facts array object provided by the user based
     * on the start cell of the Decision Table.
     */
    private getFactArr(startCellArr: string[], id: number, factsObj: FactsObj): Object[] {

        // Check for format errors
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

    private updateFacts(decisionTables: DecisionTable[]): FactsObj {

        const updatedFacts: FactsObj = {};

        if (decisionTables.length === 0) {
            cinfo('No decision tables found');
            return updatedFacts;
        }

        cinfo(decisionTables.length + ' DecisionTables found. Applying table logic to facts.');

        for (let i = 0; i < decisionTables.length; i++) {
            const table = decisionTables[i];
            updatedFacts[table.factName] = table.updateFacts();
        }

        return updatedFacts;
    }
}

export default Trool;
