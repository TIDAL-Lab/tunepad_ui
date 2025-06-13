/*
 * TunePad
 *
 * Michael S. Horn
 * Northwestern University
 * michael-horn@northwestern.edu
 * Copyright 2024, Michael S. Horn
 *
 * This project was funded by the National Science Foundation (grant DRL-1612619).
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */

/**
 * ## Creates a dropdown context menu.
 * 
 * ```html
 * <context-menu>
 *     <context-menu-item action="export" icon="export.svg" disabled="true" name="Export"></context-menu-item>
 *     <div class="menu-separator"></div>
 *     <context-menu-item name="Options">
 *         <context-menu>
 *             <context-menu-item action="theme" name="Dark Mode"><context-menu-item>
 *             <div class="menu-separator"></div>
 *             <context-menu-item radio-group="view" action="piano-roll" name="Show Piano Roll"><context-menu-item>
 *             <context-menu-item radio-group="view" action="waveform" name="Show Waveform"><context-menu-item>
 *             <context-menu-item radio-group="view" action="notes" name="Show Music Notation"><context-menu-item>
 *        </context-menu>
 *    </context-menu-item>
 * </context-menu>
 * ```
 */
import styles from './menu.module.css' with { type : 'css' }
import iconCheck from '../icons/icon-check.svg';

export const ContextMenuStyles = styles;

export class ContextMenu extends HTMLElement {

    static readonly ELEMENT = "context-menu";

    constructor() {
        super();
        this.classList.add('drop-menu', 'hidden');
    }

    private emitEvent(name : string) {
        this.dispatchEvent(
            new CustomEvent(name, { bubbles: true, composed: true, detail: { origin : this } })
        );
    }

    async connectedCallback() {
        const container = this.parentElement!;

        container.addEventListener('pointerdown', (e) => {
            this.classList.toggle('hidden');
            e.stopPropagation();
            this.emitEvent('context-menu-open');
        });
        document.addEventListener('pointerdown', (e) => {
            this.classList.add('hidden');
        });
        document.addEventListener('context-menu-open', (e) => {
            const origin = (e as CustomEvent).detail.origin;
            if (origin !== this) this.classList.add('hidden');
        });
        this.addEventListener('context-menu-action', (e) => {
            this.classList.add('hidden');
        });
    }
}

export class ContextMenuItem extends HTMLElement {

    static readonly ELEMENT = "context-menu-item";

    static observedAttributes = [ "name", "icon", "action", "disabled", "checked" ];

    private name : HTMLElement;
    private icon : HTMLElement;
    private expand : HTMLElement;
    private checkmark : HTMLElement;

    private get checked() { return this.getAttribute('checked') === 'true'; }
    private disabled = false;
    private get action() { return this.getAttribute('action'); }


    constructor() {
        super();
        this.classList.add('menu-item');
        this.name = document.createElement('div');
        this.name.classList.add('name');
        this.icon = document.createElement('div');
        this.icon.classList.add('icon');
        this.expand = document.createElement('div');
        this.expand.classList.add('expand');
        this.checkmark = document.createElement('div');
        this.checkmark.classList.add('checkmark');
    }


    private emitEvent(name : string) {
        this.dispatchEvent(
            new CustomEvent(name, { 
                bubbles: true,
                composed: true,
                detail: { 
                    origin : this,
                    action : this.action,
                    checked : this.checked
                }
            })
        );
    }


    async connectedCallback() {
        this.appendChild(this.icon);
        this.appendChild(this.name);
        const submenu = this.querySelector('context-menu');
        if (submenu) {
            this.appendChild(this.expand);
        } else {
            this.appendChild(this.checkmark);
            this.checkmark.innerHTML = iconCheck;
        }

        this.addEventListener('pointerdown', (e) => e.stopPropagation());
        this.addEventListener('pointerup', (e) => {
            if (!this.disabled && !submenu) {
                this.toggleChecked();
                setTimeout(() => this.emitEvent('context-menu-action'), 100);
            }
        });
    }

    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        if (name === 'name') {
            this.name.innerHTML = newValue;
        }
        else if (name === 'icon') {
            this.icon.innerHTML = `<tunepad-icon icon="${newValue}"></tunepad-icon>`;
        }
        else if (name === 'disabled') {
            this.disabled = (newValue === 'true');
            this.classList.toggle('disabled', this.disabled);
        }
        else if (name === 'checked' && newValue === 'true') {
            this.setChecked();
        }
    }


    /**
     * Recursively uncheck any context menu item with the same radio-group attribute
     */
    private uncheckSiblings(radioGroup : string) {
        let ancestor = this.parentElement;
        let p = ancestor;
        while (p instanceof ContextMenu || p instanceof ContextMenuItem) {
            p = p.parentElement;
            if (p instanceof ContextMenu) ancestor = p;
        }
        ancestor?.querySelectorAll(`.menu-item[radio-group=${radioGroup}]`)
            .forEach(item => {
                if (item instanceof ContextMenuItem && item !== this) {
                    (item as ContextMenuItem).setAttribute('checked', 'false');
                }
            }
        );
    }


    private setChecked() {
        if (this.hasAttribute('radio-group')) {
            const grp = this.getAttribute('radio-group')!;
            this.uncheckSiblings(grp);
        }
    }


    private toggleChecked() {
        if (this.hasAttribute('checked')) {
            this.setAttribute('checked', `${!this.checked}`);
        }
    }
}
