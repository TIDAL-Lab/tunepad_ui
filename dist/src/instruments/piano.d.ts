import Instrument from './instrument';
/**
 * Piano keyboard custom element
 *
 * <piano-instrument
 *      note-hints = "true"   // show note names on keys
 *      midi-hints = "true"   // show midi note numbers on keys
 *      armed = "false"       // listen for keyboard events
 *      min-octave = "0"      // lowest octave available
 *      max-octave = "7"      // highest octave available
 *      min-note = "21"       // (optional) overrides min-octave
 *      max-note = "108"      // (optional) overrides max-octave
 *      key-range = "28"      // how many keys to show at one time
 *      focus-octave = "2">   // focus (left-most) octave showing
 * </piano-instrument>
 *
 * The piano generates custom events "note-on", "note-off", "pitch-bend"
 */
interface PianoKeyboardProps {
    noteHints: boolean;
    midiHints: boolean;
    armed: boolean;
    minNote: number;
    maxNote: number;
    keyRange: number;
    focusOctave: number;
}
export declare class Piano extends HTMLElement implements Instrument {
    static observedAttributes: string[];
    static readonly ELEMENT = "piano-instrument";
    props: PianoKeyboardProps;
    root: ShadowRoot;
    container: SVGSVGElement | null;
    parent: SVGGElement;
    allKeys: SVGGElement;
    keys: PianoKey[];
    width: number;
    height: number;
    get minKey(): number;
    get maxKey(): number;
    get minOctave(): number;
    get maxOctave(): number;
    readonly key_map = "awsedftgyhujkolp;']";
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Add note events to the event stream
     */
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
     * How many white keys to show at one time
     */
    setKeyRange(count: number): void;
    setMinOctave(octave: number): void;
    setMaxOctave(octave: number): void;
    setMinNote(note: number): void;
    setMaxNote(note: number): void;
    /**
     * Should the piano respond to keyboard events?
     */
    armKeyboard(): void;
    disarmKeyboard(): void;
    get isKeyboardArmed(): boolean;
    private getArmedKey;
    setPatch(patch: any): void;
    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e: KeyboardEvent): void;
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e: KeyboardEvent): void;
    /**
     * Convert a midi note to piano key number
     */
    _noteToKey(midi: number): PianoKey | null;
    render(): void;
    setFocusOctave(octave: number): void;
    /**
     * Show note name hints
     */
    setNoteHints(on: boolean): void;
    get showNoteHints(): boolean;
    /**
     * Show midi number hints
     */
    setMidiHints(on: boolean): void;
    get showMidiHints(): boolean;
}
/**
 * Represents a black or white key on the piano keyboard
 */
declare class PianoKey {
    static readonly NOTES: string[];
    static readonly width = 45;
    readonly note: number;
    piano: Piano;
    get step(): number;
    get octave(): number;
    get name(): string;
    get offset(): number;
    get x(): number;
    get black(): boolean;
    get white(): boolean;
    get height(): number;
    keyHint: SVGTextElement;
    readonly _key_offsets: number[];
    readonly _hint_offsets: number[];
    el: SVGGElement;
    rect: SVGRectElement;
    private _down;
    constructor(note: number, piano: Piano);
    press(): void;
    release(): void;
    isPressed(): boolean;
    autoRelease(): void;
    setKeymap(k: string): void;
    clearKeymap(): void;
}
import './instrument';
export {};
//# sourceMappingURL=piano.d.ts.map