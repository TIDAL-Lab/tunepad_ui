export declare class Passphrase extends HTMLDialogElement {
    static readonly ELEMENT = "pass-phrase";
    static observedAttributes: string[];
    private readonly ROWS;
    private readonly COLS;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private render;
    private reset;
    private advanceFocus;
    private setFocus;
    private setHTML;
    private isComplete;
    private success;
    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent;
}
//# sourceMappingURL=passphrase.d.ts.map