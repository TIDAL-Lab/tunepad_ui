/**
 * ```html
 * <tunepad-icon icon="trash"></tunepad-icon>
 * ```
 * ### Available Icons
 * * autocompile
 * * checkmark
 * * copy
 * * cross-circle
 * * error
 * * gear
 * * insert
 * * history
 * * lock
 * * midi
 * * midiroll
 * * minus
 * * music
 * * pause
 * * piano
 * * play
 * * plus
 * * recompile
 * * score
 * * stop
 * * trash
 * * waveform
 */
export declare class TunePadIcon extends HTMLElement {
    static observedAttributes: string[];
    static readonly ELEMENT = "tunepad-icon";
    private div;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
}
//# sourceMappingURL=icon.d.ts.map