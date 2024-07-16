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
}
//# sourceMappingURL=instrument.d.ts.map