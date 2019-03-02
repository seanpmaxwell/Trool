/**
 * Process customers given a using rules specified in
 * a .csv file and the trool rule engine.
 *
 * created by Sean Maxwell Mar 2, 2019
 */

import * as path from 'path';
import { cinfo, cerr } from 'simple-color-print';

import Trool, { FactsObject } from 'trool';
import Customer from './Customer';


class CustomerProcessor {

    private _trool: Trool;
    private readonly _CSV_FILE = 'CustomerRules.csv';


    constructor() {
        this._trool = new Trool();
    }


    public async processCustomers(): Promise<void> {

        let factsObj = this.setupFacts();

        try {
            const csvFilePath = path.join(__dirname, this._CSV_FILE);
            factsObj = await this._trool.applyRules(factsObj, csvFilePath);

        } catch (err) {
            cerr(err);
        } finally {
            cinfo(factsObj);
        }
    }


    private setupFacts(): FactsObject {
        return {
            Customer: new Customer(30, 'Adult')
        }
    }

}

export default CustomerProcessor;
