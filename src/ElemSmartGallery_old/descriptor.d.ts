import { Query } from '@goodt-wcore/core/dremio';

export interface SlotCondition {
    a: string;
    b: string;
    op: string;
    type: string;
}

export interface Slot {
    name: string;
    rules: string[][];
}

export interface DremioSource {
    query: Query;
    dimensionList: object;
    limit: number;
}
