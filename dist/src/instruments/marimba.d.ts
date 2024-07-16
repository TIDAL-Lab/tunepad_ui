import Instrument from './instrument';
/**
 * Marimba custom element
 *
 * <marimba-instrument armed="false">
 * </marimba-instrument>
 *
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */
export declare class Marimba extends HTMLElement implements Instrument {
    static readonly NOTES: string[];
    static observedAttributes: string[];
    static readonly ELEMENT = "marimba-instrument";
    armed: boolean;
    root: ShadowRoot;
    container: HTMLDivElement;
    get minKey(): number;
    get maxKey(): number;
    readonly key_map = "awsedftgyhujkolp;']";
    constructor();
    connectedCallback(): void;
    /**
     * Each key is just a div element
     */
    private _buildKey;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Add note events to the event stream
     */
    emitNoteOn(note: number, source: string, velocity?: number): void;
    emitNoteOff(note: number, source: string): void;
    emitPitchBend(value: number, source: string): void;
    isAccidental(note: number): boolean;
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
     * Should the instrument respond to keyboard events?
     */
    armKeyboard(): void;
    disarmKeyboard(): void;
    get isKeyboardArmed(): boolean;
    private getArmedKey;
    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e: KeyboardEvent): void;
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e: KeyboardEvent): void;
}
//# sourceMappingURL=marimba.d.ts.map