
export interface FactsObj {
    [key: string]: Object | Object[];
}

export interface ImportsObj {
    [key: string]: Object;
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
