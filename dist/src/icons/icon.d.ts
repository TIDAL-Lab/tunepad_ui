/**
 * ```html
 * <tunepad-icon icon="trash"></tunepad-icon>
 * ```
 * ### Available Icons
 * * checkmark
 * * copy
 * * error
 * * lock
 * * midi
 * * midiroll
 * * minus
 * * music
 * * piano
 * * play
 * * recompile
 * * score
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