export interface SlotCondition {
    a: string;
    b: string;
    op: string;
    type: string;
}

export interface Slot {
    name: string;
    rules: string[][];
    show: boolean;
}
