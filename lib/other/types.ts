/**
 * Put shared types here.
 */

// Misc
export type TPrimitive = boolean | number | string | null | undefined;

// Decision-Tables
export type TRow = { [key in `field${number}`]: string };
export type TCondition = (fact: Record<string, unknown>, paramVal: any) => boolean;
export type TAction = (fact: Record<string, unknown>, cellVals: TPrimitive[]) => void;
