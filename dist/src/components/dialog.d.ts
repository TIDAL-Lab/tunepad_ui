/**
 * <modal-dialog>html content</modal-dialog>
 */
export declare class ConfirmDialog extends HTMLElement {
    static readonly ELEMENT = "confirm-dialog";
    private root;
    promise?: (result: string | undefined) => void;
    private result;
    private content;
    constructor();
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    show(title: string, message: string): Promise<string | undefined>;
    close(result?: string): void;
    private waitForWindowLoad;
}
//# sourceMappingURL=dialog.d.ts.map