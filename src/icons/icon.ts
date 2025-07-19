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

import iconAutocompile from './icon-autocompile.svg';
import iconCheck from './icon-check.svg';
import iconCopy from './icon-copy.svg';
import iconCrossCircle from './icon-cross-circle.svg'
import iconError from './icon-error.svg';
import iconGear from './icon-gear.svg';
import iconHistory from './icon-history.svg';
import iconInsert from './icon-insert.svg';
import iconLibrary from './icon-library.svg';
import iconLock from './icon-lock.svg';
import iconMidiRoll from './icon-midiroll.svg'
import iconMinus from './icon-minus.svg';
import iconMusic from './icon-music.svg';
import iconPause from './icon-pause.svg';
import iconPiano from './icon-piano.svg';
import iconPlay from './icon-play.svg';
import iconPlus from './icon-plus.svg';
import iconRecompile from './icon-recompile.svg';
import iconStop from './icon-stop.svg';
import iconTrash from './icon-trash.svg';
import iconWaveform from './icon-waveform.svg';

/**
 * ```html
 * <tunepad-icon icon="trash"></tunepad-icon>
 * ```
 * ### Available Icons
 * * autocompile
 * * checkmark
 * * copy
 * * cross-circle
 * * error
 * * gear
 * * insert
 * * history
 * * library
 * * lock
 * * midi
 * * midiroll
 * * minus
 * * music
 * * pause
 * * piano
 * * play
 * * plus
 * * recompile
 * * score
 * * stop
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
                case 'autocompile': this.div.innerHTML = iconAutocompile; break;
                case 'checkmark': this.div.innerHTML = iconCheck; break;
                case 'copy': this.div.innerHTML = iconCopy; break;
                case 'cross-circle': this.div.innerHTML = iconCrossCircle; break;
                case 'error': this.div.innerHTML = iconError; break;
                case 'gear': this.div.innerHTML = iconGear; break;
                case 'history': this.div.innerHTML = iconHistory; break;
                case 'insert': this.div.innerHTML = iconInsert; break;
                case 'library': this.div.innerHTML = iconLibrary; break;
                case 'lock': this.div.innerHTML = iconLock; break;
                case 'midi': this.div.innerHTML = iconMidiRoll; break;
                case 'midiroll': this.div.innerHTML = iconMidiRoll; break;
                case 'minus': this.div.innerHTML = iconMinus; break;
                case 'music': this.div.innerHTML = iconMusic; break;
                case 'pause' : this.div.innerHTML = iconPause; break;
                case 'piano' : this.div.innerHTML = iconPiano; break;
                case 'play': this.div.innerHTML = iconPlay; break;
                case 'plus': this.div.innerHTML = iconPlus; break;
                case 'recompile': this.div.innerHTML = iconRecompile; break;
                case 'score': this.div.innerHTML = iconMusic; break;
                case 'stop': this.div.innerHTML = iconStop; break;
                case 'trash': this.div.innerHTML = iconTrash; break;
                case 'waveform': this.div.innerHTML = iconWaveform; break;
                default: this.div.innerHTML = '';
            }
            const svg = this.div.querySelector('svg');
            if (svg) svg.style.width = '100%';
        }
    }
}
