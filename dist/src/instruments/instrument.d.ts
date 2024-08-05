/**
 * Shared functionality across all instruments
 */
export default interface Instrument {
    noteOn(note: number, velocity: number): void;
    noteOff(note: number): void;
    allNotesOff(): void;
    isNoteOn(note: number): boolean;
    armKeyboard(): void;
    disarmKeyboard(): void;
    get isKeyboardArmed(): boolean;
    /** Instruments like drum pads use the patch data to help configure the UI */
    setPatch(patch: any): void;
}
//# sourceMappingURL=instrument.d.ts.map