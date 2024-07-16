export declare class Dial extends HTMLElement {
    static readonly ELEMENT = "range-dial";
    static observedAttributes: string[];
    private root;
    private readonly minAngle;
    private readonly maxAngle;
    private minValue;
    private maxValue;
    private _value;
    /** current value between [ min, max ] */
    get value(): number;
    /** set the value of the dial (clamped between min and max) */
    set value(v: number);
    private ring;
    private line;
    private arc;
    private container;
    private get angle();
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private _startVal;
    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent;
    _redraw(): void;
    _describeArc(r: number): string;
}
//# sourceMappingURL=dial.d.ts.map