/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';

import { cinfo, cerr } from 'simple-color-print';
import { FactsObj, ImportsObj, Row } from './types';
import { parseCell } from './shared';

import DecisionTable from './DecisionTable';
import TableErrs from './TableErrs';


class Trool {

    private readonly _showLogs: boolean | undefined;

    private readonly _TABLE_FORMAT_ERR = 'End of DecisionTable reached without a start';


    constructor(showLogs?: boolean) {
        this._showLogs = showLogs;
    }


    public async applyRules(filePath: string, factsObject: FactsObj, importsObj?: ImportsObj):
        Promise<FactsObj> {

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            const imports = this._setupImports(jsonArr, importsObj);
            const decisionTables = this._getTables(jsonArr, factsObject, imports);

            return this._updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /*********************************************************************************************
     *                                     Setup Imports
     ********************************************************************************************/

    /**
     * If there are any imports in the spreadsheet, import them from there.
     */
    private _setupImports(jsonArr: Array<Row>, importsObj: ImportsObj | undefined): ImportsObj {

        importsObj = importsObj || {};

        let importName = '';
        let newImportObj: any = {};

        // Find spreadsheet imports
        for (let i = 0; i < jsonArr.length; i++) {

            const firstCellStr = jsonArr[i].field1.trim();

            // Setup spreadsheet import
            if (firstCellStr.startsWith('ImportObject: ')) {

                const firstCellArr = firstCellStr.split(' ');

                if (firstCellArr.length !== 2) {
                    throw Error(' ');
                }

                importName = firstCellArr[1];
                newImportObj = {};

            } else if (importName) {

                if (jsonArr[i] || jsonArr[i].field1.trim()) {
                    newImportObj[firstCellStr] = parseCell(jsonArr[i].field2, importsObj);
                } else {
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
    private _getTables(jsonArr: Array<Row>, factsObj: FactsObj, importsObj: ImportsObj):
        DecisionTable[] {

        const decisionTables = [];
        let tableStart = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCellStr = jsonArr[i].field1.trim();
            let startCellArr: string[] = [];

            if (firstCellStr.startsWith('TableStart: ')) {
                tableStart = i;
                startCellArr = firstCellStr.split(' ');
            } else if (firstCellStr === 'TableEnd') {

                if (tableStart === -1) {
                    throw Error(this._TABLE_FORMAT_ERR);
                }

                const table = jsonArr.slice(tableStart, i);
                const decisionTable = new DecisionTable(i + 1, this._showLogs);
                const factArr = this._getFactArr(startCellArr, i + 1, factsObj);

                decisionTable.initTable(table, factArr, importsObj);
                decisionTables.push(decisionTable);
                tableStart = -1;
            }
        }

        return decisionTables;
    }


    /**
     * Extract the array of facts from the facts array object provided by the user based
     * on the start cell of the Decision Table.
     */
    private _getFactArr(startCellArr: string[], id: number, factsObj: FactsObj): Object[] {

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

    /**
     * Update facts object, using the DecisionTable objects.
     */
    private _updateFacts(decisionTables: DecisionTable[]): FactsObj {

        const updateFacts = {} as any;

        if (decisionTables.length === 0) {
            cinfo('No decision tables found');
        } else {
            cinfo(decisionTables.length + ' DecisionTables found. Applying table logic to facts.');
        }
        // loop through array of decision tables
        // updatesFacts[table.getFactName] = table.updateFacts()

        return updateFacts;
    }
}

export default Trool;
