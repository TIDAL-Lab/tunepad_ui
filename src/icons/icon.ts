/*
 * TunePad
 *
 * Michael S. Horn
 * Northwestern University
 * michael-horn@northwestern.edu
 *
 * This project was funded by the National Science Foundation (grant DRL-1612619).
 * Any opinions, findings and conclusions or recommendations expressed in this
 * material are those of the author(s) and do not necessarily reflect the views
 * of the National Science Foundation (NSF).
 */
import html from './icon.module.html';

import iconCopy from './icon-copy.svg';
import iconError from './icon-error.svg';
import iconLock from './icon-lock.svg';
import iconPlay from './icon-play.svg';
import iconRecompile from './icon-recompile.svg';
import iconTrash from './icon-trash.svg';


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

export class TunePadIcon extends HTMLElement {

    static observedAttributes = [ "icon" ];
    static readonly ELEMENT = "tunepad-icon";

    private div : HTMLDivElement;


    constructor() {
        super();
        this.innerHTML = html;
        this.div = this.querySelector('div.icon') as HTMLDivElement;
    }

    connectedCallback() { }
    disconnectedCallback() { }

    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        if (name === 'icon' && newValue != oldValue) {
            switch (newValue) {
                case 'copy': this.div.innerHTML = iconCopy; break;
                case 'error': this.div.innerHTML = iconError; break;
                case 'lock': this.div.innerHTML = iconLock; break;
                case 'play': this.div.innerHTML = iconPlay; break;
                case 'recompile': this.div.innerHTML = iconRecompile; break;
                case 'trash': this.div.innerHTML = iconTrash; break;
            }
        }
    }
}
