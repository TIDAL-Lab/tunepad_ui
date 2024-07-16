export declare const ContextMenuStyles: any;
export declare class ContextMenu extends HTMLElement {
    static readonly ELEMENT = "context-menu";
    constructor();
    private emitEvent;
    connectedCallback(): Promise<void>;
}
export declare class ContextMenuItem extends HTMLElement {
    static readonly ELEMENT = "context-menu-item";
    static observedAttributes: string[];
    private name;
    private icon;
    private expand;
    private disabled;
    private checked?;
    constructor();
    private emitEvent;
    connectedCallback(): Promise<void>;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private toggleChecked;
    /**
     * Recursively uncheck any context menu item with the same radio-group attribute
     */
    private uncheckSiblings;
    protected setChecked(checked: boolean): void;
}
//# sourceMappingURL=menu.d.ts.map