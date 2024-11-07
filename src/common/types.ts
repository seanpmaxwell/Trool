/* eslint-disable max-len */

// Misc
export type TPrimitive = boolean | number | string | null | undefined;

// Decision-Tables
export type TRow = Record<`field${number}`, string>;
export type TCondition = (fact: Record<string, unknown>, paramVal: unknown) => boolean;
export type TAction = (fact: Record<string, unknown>, cellVals: TPrimitive[]) => void;
