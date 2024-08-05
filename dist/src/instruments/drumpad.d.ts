import Instrument from './instrument';
/**
 * MPC-style drum pad interface
 *
 *       <drums-instrument armed = "false"></drums-instrument>
 *
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */
export declare class DrumPad extends HTMLElement implements Instrument {
    static observedAttributes: string[];
    static readonly ELEMENT = "drums-instrument";
    root: ShadowRoot;
    armed: boolean;
    readonly keys = "qwertyuiasdfghjk";
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    emitNoteOn(note: number, source: string, velocity?: number): void;
    emitNoteOff(note: number, source: string): void;
    emitPitchBend(value: number, source: string): void;
    /**
     * Show note being played
     */
    noteOn(note: number, velocity?: number): void;
    /**
     * Hide note being played
     */
    noteOff(note: number): void;
    allNotesOff(): void;
    /**
     * Is note currently pressed?
     */
    isNoteOn(note: number): boolean;
    /**
     * Should the piano respond to keyboard events?
     */
    armKeyboard(): void;
    disarmKeyboard(): void;
    get isKeyboardArmed(): boolean;
    /**
     * Set the names of the drum pads
     */
    setPatch(patch: any): void;
    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e: KeyboardEvent): void;
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e: KeyboardEvent): void;
    getPadNote(pad?: Element): number;
}
//# sourceMappingURL=drumpad.d.ts.map