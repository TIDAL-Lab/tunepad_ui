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

import iconCheck from './icon-check.svg';
import iconCopy from './icon-copy.svg';
import iconError from './icon-error.svg';
import iconLock from './icon-lock.svg';
import iconMidiRoll from './icon-midiroll.svg'
import iconMusic from './icon-music.svg';
import iconPiano from './icon-piano.svg';
import iconPlay from './icon-play.svg';
import iconRecompile from './icon-recompile.svg';
import iconTrash from './icon-trash.svg';
import iconWaveform from './icon-waveform.svg';

/**
 * ```html
 * <tunepad-icon icon="trash"></tunepad-icon>
 * ```
 * ### Available Icons
 * * checkmark
 * * copy
 * * error
 * * lock
 * * midi
 * * midiroll
 * * music
 * * piano
 * * play
 * * recompile
 * * score
 * * trash
 * * waveform
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
                case 'checkmark': this.div.innerHTML = iconCheck; break;
                case 'copy': this.div.innerHTML = iconCopy; break;
                case 'error': this.div.innerHTML = iconError; break;
                case 'lock': this.div.innerHTML = iconLock; break;
                case 'midi': this.div.innerHTML = iconMidiRoll; break;
                case 'midiroll': this.div.innerHTML = iconMidiRoll; break;
                case 'music': this.div.innerHTML = iconMusic; break;
                case 'piano' : this.div.innerHTML = iconPiano; break;
                case 'play': this.div.innerHTML = iconPlay; break;
                case 'recompile': this.div.innerHTML = iconRecompile; break;
                case 'score': this.div.innerHTML = iconMusic; break;
                case 'trash': this.div.innerHTML = iconTrash; break;
                case 'waveform': this.div.innerHTML = iconWaveform; break;
                default: this.div.innerHTML = '';
            }
        }
    }
}
