export declare class FilterExample extends HTMLElement {
    static readonly ELEMENT = "filter-example";
    static observedAttributes: never[];
    private root;
    private context?;
    private freq;
    private reso;
    private gain;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    addClass(selector: string, className: string): void;
    removeClass(selector: string, className: string): void;
}
//# sourceMappingURL=filter.d.ts.map