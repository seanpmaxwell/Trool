
export interface FactsObject {
    [key: string]: Array<Object> | Object;
}

export interface Row {
    [key: string]: string
}

export interface Condition {
    index: number;
    operation?: Function;
}

export interface Action {
    index: number;
    operation?: Function;
}
