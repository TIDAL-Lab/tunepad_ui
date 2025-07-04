export declare class CircleOfFifths extends HTMLElement {
    static readonly ELEMENT = "circle-of-fifths";
    static observedAttributes: string[];
    private root;
    private svg;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent;
    _redraw(): void;
    circle(cx: number, cy: number, r: number, className?: string): SVGCircleElement;
    line(x1: number, y1: number, x2: number, y2: number, className?: string): SVGLineElement;
    text(x: number, y: number, s: string, className?: string): SVGTextElement;
    tspan(dx: number, dy: number, s: string, className?: string): SVGTSpanElement;
    arc(a0: number, a1: number, r0: number, r1: number, className?: string): SVGPathElement;
    _describeArc(r: number, angle: number): string;
}
//# sourceMappingURL=fifths.d.ts.map