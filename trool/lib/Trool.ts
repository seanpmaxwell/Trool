/**
 * Main class for the
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as csvtojson from 'csvtojson';
import { cinfo, cerr } from 'simple-color-print';
import { FactsObj, ImportsObj, Row } from './types';
import DecisionTable from './DecisionTable';


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
            const decisionTables = this._setupDecisionTables(jsonArr, factsObject, importsObj);
            return this._updateFacts(decisionTables);
        } catch (err) {
            throw err;
        }
    }


    /**
     * Get array of DecisionTable objects from spreadsheet data.
     */
    private _setupDecisionTables(jsonArr: Array<Row>, factsObject: FactsObj, importsObj:
        ImportsObj): DecisionTable[] {

        const decisionTables = [];
        let tableStart = -1;
        let tableEnd = -1;
        let importStart = -1;
        let importEnd = -1;

        // Iterate entire spreadsheet
        for (let i = 0; i < jsonArr.length; i++) {

            const { field1 } = jsonArr[i];

            // Get start and end rows for a table
            if (field1.includes('TableStart: ')) {
                tableStart = i;
            } else if (field1 === 'TableEnd') {

                // pick up here, put all this in a setupDecisionTable method
                if (tableStart === -1 && importStart !== -1 && importEnd !== -1) {
                    throw Error(this._TABLE_FORMAT_ERR);
                } else {
                    tableEnd = i;
                }

                const table = jsonArr.slice(tableStart, tableEnd);
                const decisionTable = new DecisionTable(i + 1, this._showLogs);
                decisionTable.initTable(table, factsObject, importsObj);
                decisionTables.push(decisionTable);
                tableStart = tableEnd = -1;

            } else if (field1 === 'ImportStart') {
                // put some more logic here to check if its an imports block
            }
        }

        cinfo(decisionTables.length + ' decision table\\s found');
        return decisionTables;
    }


    /**
     * If there are any imports in the spreadsheet, import them from there
     */
    private _setupImports(): void {



    }


    /**
     * Update facts object, using the DecisionTable objects.
     */
    private _updateFacts(decisionTables: DecisionTable[]): FactsObj {

        const updateFacts = {} as any;

        // loop through array of decision tables
        // updatesFacts[table.getFactName] = table.updateFacts()

        return updateFacts;
    }
}

export default Trool;
