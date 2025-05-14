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
import styles from './drumpad.module.css' with {type: 'css'};
import html from './drumpad.module.html';
import Instrument from './instrument';

/**
 * MPC-style drum pad interface
 * 
 *       <drums-instrument armed = "false"></drums-instrument>
 * 
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */

export class DrumPad extends HTMLElement implements Instrument {

    static observedAttributes = [ "armed" ];

    static readonly ELEMENT = "drums-instrument";

    /// all of the HTML elements for the instrument are contained within a shadow DOM
    root : ShadowRoot;

    armed : boolean = false;

    readonly keys = 'qwertyuiasdfghjk';

  
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
    }


    connectedCallback() {
        document.addEventListener("keydown", e => this.onKeyDown(e));
        document.addEventListener("keyup", e => this.onKeyUp(e));

        for (let i=0; i<16; i++) {
            const pad = document.createElement('div');
            pad.classList.add('wrapper');
            pad.innerHTML = `
                <div class="drum-pad" data-hint="${this.keys[i]}" data-note="${i}">
                    <div class="drum-name"></div>
                    <div class="key-hint">${this.keys[i]}</div>
                    <div class="pad-name">${i}</div>
                </div>`;
            this.root.querySelector('.instrument')?.append(pad);
        }

        this.root.querySelectorAll('.drum-pad').forEach((p) => {
            let down = false;
            p.addEventListener('pointerdown', (e) => {
                p.classList.add('pressed');
                this.emitNoteOn(this.getPadNote(p), "pointer");
                down = true;
            });
            p.addEventListener('pointerup', (e) => {
                if (down) {
                    p.classList.remove('pressed');
                    this.emitNoteOff(this.getPadNote(p), "pointer");
                    down = false;
                }
            });
            p.addEventListener('pointerenter', (e) => {
                if ((e as PointerEvent).buttons > 0) {
                    p.classList.add('pressed');
                    this.emitNoteOn(this.getPadNote(p), "pointer");
                    down = true;
                }
            });
            p.addEventListener('pointerleave', (e) => {
                p.classList.remove('pressed');
                this.emitNoteOff(this.getPadNote(p), "pointer");
                down = true;
            });
        });
    }

    disconnectedCallback() { }

    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        if (name === 'armed' && newValue !== oldValue) {
            (newValue === 'true') ? this.armKeyboard() : this.disarmKeyboard();
        }
    }


    emitNoteOn(note : number, source : string, velocity : number = 90) {
        if (note < 0) return;
        const e = new CustomEvent('note-on', { 
            bubbles: true,
            composed: true,
            detail: { 
                note : note,
                source : source,
                velocity : velocity
            }
        })
        this.dispatchEvent(e);
    }

    emitNoteOff(note : number, source : string) {
        if (note < 0) return;
        const e = new CustomEvent('note-off', { 
            bubbles: true,
            composed: true,
            detail: { 
                note : note,
                source : source,
                velocity : 0
            }
        })
        this.dispatchEvent(e);
    }

    emitPitchBend(value : number, source : string) {
        const e = new CustomEvent('pitch-bend', { 
            bubbles: true,
            composed: true,
            detail: { 
                source : source,
                value : value
            }
        })
        this.dispatchEvent(e);
    }


    /**
     * Show note being played
     */
    noteOn(note : number, velocity = 90) {
        this.root.querySelector(`.drum-pad[data-note="${note}"]`)?.classList.add('pressed');
    }
  
    /**
     * Hide note being played
     */
    noteOff(note : number) {
        this.root.querySelector(`.drum-pad[data-note="${note}"]`)?.classList.remove('pressed');
    }

    allNotesOff() {
        this.root.querySelectorAll('.drum-pad')?.forEach(p => p.classList.remove('pressed'));
    }

    /**
     * Is note currently pressed?
     */
    isNoteOn(note : number) : boolean {
        const pad = this.root.querySelector(`.drum-pad[data-note="${note}"]`);
        return (pad !== null && pad.classList.contains('pressed'));
    }


    /**
     * Should the piano respond to keyboard events?
     */
    armKeyboard() { 
        this.armed = true;
        this.setAttribute('armed', 'true');
        this.root.querySelector(".instrument")?.classList.add('armed');
    }
    disarmKeyboard() {
        this.armed = false;
        this.setAttribute('armed', 'false');
        this.root.querySelector(".instrument")?.classList.remove('armed');
    }

    get isKeyboardArmed() : boolean { return this.armed; }

    /**
     * Set the names of the drum pads
     */
    setPatch(patch: any): void {
        if (Array.isArray(patch.nodes)) {
            for (let node of patch.nodes) {
                if (node.type === 'drums' && Array.isArray(node.samples)) {
                    for (let samp of node.samples) {
                        if (typeof samp.step === 'number' && typeof samp.name === 'string') {
                            const name = this.root.querySelector(`.drum-pad[data-note="${samp.step}"] .drum-name`);
                            if (name) name.innerHTML = samp.name;
                        }
                    }
                    return;
                }
            }
        }
    }

    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e : KeyboardEvent) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat == true) return;
  
        if (this.isKeyboardArmed) {
            const key = e.key!.toLowerCase();
            this.root.querySelector(`.drum-pad[data-hint="${key}"]`)?.classList.add('pressed');
            const note = this.keys.indexOf(key);
            if (note >= 0) {
                this.emitNoteOn(note, "keyboard");
            }
            else if (e.key == "ArrowDown") {
                this.emitPitchBend(-200, "keyboard");
            }
            else if (e.key == "ArrowUp") {
                this.emitPitchBend(200, "keyboard");
            }
        }
    }
  
  
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e : KeyboardEvent) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            this.emitPitchBend(0, "keyboard");
        } else {
            const key = e.key!.toLowerCase();
            this.root.querySelector(`.drum-pad[data-hint="${key}"]`)?.classList.remove('pressed');
            const note = this.keys.indexOf(key);
            if (note >= 0) this.emitNoteOff(note, "keyboard");
        }
    }

    getPadNote(pad? : Element) : number {
        return parseInt(pad?.getAttribute('data-note') ?? '-1');
    }
}
