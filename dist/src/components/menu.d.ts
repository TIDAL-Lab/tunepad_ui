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
    private checkmark;
    private get checked();
    private disabled;
    private get action();
    constructor();
    private emitEvent;
    connectedCallback(): Promise<void>;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    /**
     * Recursively uncheck any context menu item with the same radio-group attribute
     */
    private uncheckSiblings;
    private setChecked;
    private toggleChecked;
}
//# sourceMappingURL=menu.d.ts.map