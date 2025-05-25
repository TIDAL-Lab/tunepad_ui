/**
 * ```html
 * <tunepad-icon icon="trash"></tunepad-icon>
 * ```
 * ### Available Icons
 * * copy
 * * error
 * * lock
 * * play
 * * recompile
 * * trash
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