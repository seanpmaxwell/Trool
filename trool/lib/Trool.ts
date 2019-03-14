/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';

import { cinfo, cerr } from 'simple-color-print';
import { FactsObj, ImportsObj, Row } from './types';

import DecisionTable from './DecisionTable';
import Parser from './Parser';


class Trool {

    private readonly _showLogs: boolean | undefined;

    private readonly _TABLE_FORMAT_ERR = 'End of rule block reached without a start';


    constructor(showLogs?: boolean) {
        this._showLogs = showLogs;
    }


    public async applyRules(filePath: string, factsObject: FactsObj, importsObj?: ImportsObj):
        Promise<FactsObj> {

        importsObj = importsObj || {};

        try {
            const jsonArr = await csvtojson().fromFile(filePath);
            importsObj = this._setupImports(jsonArr, importsObj);
            const decisionTables = this._getTables(jsonArr, factsObject, importsObj);
            return this._updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /**
     * If there are any imports in the spreadsheet, import them from there
     */
    private _setupImports(jsonArr: Array<Row>, importsObj: ImportsObj): ImportsObj {

        let importStart = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            if (field1 === 'ImportStart') {
                // create a new class called parser. Share it here and with
                // decision table class. Use it to grab values (string boolean int) from imports
                // or rules
                // put some more logic here to check if its an imports block
            }
        }
    }


    /**
     * Get array of DecisionTable objects from spreadsheet.
     */
    private _getTables(jsonArr: Array<Row>, factsObject: FactsObj, importsObj: ImportsObj):
        DecisionTable[] {

        const decisionTables = [];
        let tableStart = -1;

        for (let i = 0; i < jsonArr.length; i++) {

            const firstCellStr = jsonArr[i].field1;
            let startCellArr = [];

            if (firstCellStr.includes('TableStart: ')) {
                tableStart = i;
                startCellArr = firstCellStr.split(' ');
            } else if (firstCellStr === 'TableEnd') {

                if (tableStart === -1) {
                    throw Error(this._TABLE_FORMAT_ERR);
                }

                const table = jsonArr.slice(tableStart, i);
                const decisionTable = new DecisionTable(i + 1, this._showLogs);
                // pick here, pass fact array not whole factsObject
                const factArr = this._getFactArr(colHeaderArr[0], factsObj);
                decisionTable.initTable(table, factArr, importsObj);
                decisionTables.push(decisionTable);
                tableStart = -1;
            }
        }

        return decisionTables;
    }


    private _getFactArr(startCell: string, factsObj: FactsObj): Object[] {

        const startCellArr = startCell.split(' ');

        if (startCellArr.length !== 2) {
            throw Error(this.tableErrs.startCell);
        } else if (startCellArr[0] !== 'TableStart:') {
            throw Error(this.tableErrs.startCell2);
        }

        const factName = startCellArr[1];
        const facts = factsObj[factName];

        if (!factsObj[factName]) {
            throw Error(this.tableErrs.factFalsey);
        }

        return facts instanceof Array ? facts : [facts];
    }


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
