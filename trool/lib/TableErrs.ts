

class TableErrs {

    private readonly START_CELL = 'Start cell must contain "Start:" and specify 1 and only ' +
        '1 fact.';

    private readonly START_CELL_2 = 'Start cell must begin with "Start: "';

    private readonly COND_RULE = 'Action/Condition column headers must start off with ' +
        'conditions and contain at least one condition.';

    private readonly ACTION_COL_RULE = 'Action/Condition column headers must end with an action.';

    private readonly COL_HEADER = 'Action/Condition column headers can only be "Condition" ' +
        'or "Action"';

    private readonly COL_HEADER_ARGMT = 'All conditions must specified before all actions';

    private readonly COL_LENGTH = 'The number of Action/Condition column headers must match ' +
        'and line up with the number of operations';

    private readonly COND_BLANK = 'Condition cannot be blank';

    private readonly _id: string;


    constructor(id: number) {
        this._id = 'Error on DecisionTable ' + id + ': ';
    }


    get startCell(): string {
        return this._id + this.START_CELL;
    }

    get startCell2(): string {
        return this._id + this.START_CELL_2
    }

    get condRule(): string {
        return this._id + this.COND_RULE;
    }

    get actionColRule(): string {
        return this._id + this.ACTION_COL_RULE;
    }

    get colHeader(): string {
        return this._id + this.COL_HEADER;
    }

    get colHeaderArgmt(): string {
        return this._id + this.COL_HEADER_ARGMT;
    }

    get colLenth(): string {
        return this._id + this.COL_LENGTH;
    }
}

export default TableErrs;
