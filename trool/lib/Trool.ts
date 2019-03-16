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

    private readonly _IMPORT_ERR = 'End of Import Block reached without a start';
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

        let importStart = -1;

        // Find import blocks
        for (let i = 0; i < jsonArr.length; i++) {

            const firstCellStr = jsonArr[i].field1.trim();

            if (firstCellStr === 'ImportStart') {
                importStart = i;
            } else if (firstCellStr === 'ImportEnd') {

                if (importStart === -1) {
                    throw Error(this._IMPORT_ERR);
                }

                // Add imports from import block to main Imports Object
                const importBlock = jsonArr.slice(importStart, i);
                const spreadSheetImports = this._processImportBlock(importBlock);
                importsObj = {...importsObj, ...spreadSheetImports};
            }
        }

        return importsObj;
    }


    /**
     * Extract objects from import block
     */
    private _processImportBlock(importBlock: Array<Row>): {} {

        const imports: any = {};
        let objName = null;
        let newObj: any = null;

        // Process import block
        for (let i = 0; i < importBlock.length; i++) {

            const firstCell = importBlock[i].field1.trim();

            // New object start
            if (!objName && firstCell.startsWith('Object: ')) {

                const arr = firstCell.split(' ');

                objName = arr[1];
                newObj = {};
                continue;
            }

            // Add new property
            if (firstCell && objName) {
                const val = importBlock[i].field2.trim();
                newObj[firstCell] = parseCell(val);
            }

            // Append imported object to the "imports object"
            if (objName && (firstCell === '' || firstCell.includes('Object:'))) {
                imports[objName] = newObj;
            }
        }

        return imports;
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
        } else if (startCellArr[0] !== 'TableStart:') {
            throw Error(TableErrs.getStartCellErr2(id));
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
