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
import styles from './marimba.module.css' with {type: 'css'};
import html from './marimba.module.html';
import Instrument from './instrument';

/**
 * Marimba custom element
 * 
 * <marimba-instrument armed="false">
 * </marimba-instrument>
 * 
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */

export class Marimba extends HTMLElement implements Instrument {

    /// musical notes (in half steps) in the 12-note chromatic scale
    static readonly NOTES = [ "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B" ];

    static observedAttributes = [ 
        "armed",       // accepts keyboard input ("true" | "false")
    ];

    static readonly ELEMENT = "marimba-instrument";

    armed : boolean = false;

    /// all of the HTML elements for the instrument are contained within a shadow DOM
    root : ShadowRoot;

    /// <svg> tag that contains the instrument
    container : HTMLDivElement;

    get minKey() { return 48; }
    get maxKey() { return 77; }

  
    /// mapping from computer keys to instrument keys
    readonly key_map = "awsedftgyhujkolp;']";
  
  
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
        this.container = (this.root.querySelector('.instrument') as HTMLDivElement);
    }


    connectedCallback() {
        const naturals = document.createElement('div');
        const accidentals = document.createElement('div');

        naturals.classList.add('naturals');
        accidentals.classList.add('accidentals');

        // generate each key
        for (let n = this.minKey; n <= this.maxKey; n++) {
            const key = this._buildKey(n);
            if (this.isAccidental(n)) {
                accidentals.append(key);
            } else {
                naturals.append(key);
            }
            if ([5, 11].includes(n % 12) || n == this.maxKey || n == this.minKey) {
                const spacer = document.createElement('div');
                spacer.classList.add('spacer');
                accidentals.append(spacer);
            }
            this.container.append(accidentals);
            this.container.append(naturals);
        }

        // listen to keyboard events
        document.addEventListener("keydown", e => this.onKeyDown(e));
        document.addEventListener("keyup", e => this.onKeyUp(e));
    }


    /**
     * Each key is just a div element
     */
    private _buildKey(n : number) : HTMLDivElement {

        const step = n % 12;
        const octave = Math.floor(n / 12) - 1;
        const name = Marimba.NOTES[step];
        const index = n - this.minKey;

        const key = document.createElement('div');
        const hint = document.createElement('div');
        const noteName = document.createElement('div');
        const midiValue = document.createElement('div');

        key.classList.add('marimba-key');
        hint.classList.add('key-hint');
        noteName.classList.add('note-name');
        midiValue.classList.add('midi-value');

        key.setAttribute('data-note', `${n}`);
        if (this.isAccidental(n)) {
            key.classList.add('accidental');
        } else {
            key.style.height = `${145 - index * 2}px`;
        }

        if (index >= 0 && index < this.key_map.length) {
            key.setAttribute('data-trigger', `${this.key_map[index]}`);
            hint.innerHTML = `${this.key_map[index]}`;
        }
        noteName.innerHTML = `${name}${octave}`;
        midiValue.innerHTML = `${n}`;

        key.append(midiValue);
        key.append(noteName);
        key.append(hint);

        // set up mouse events
        let down = false;
        key.addEventListener('pointerdown', (e) => {
            this.emitNoteOn(n, "pointer");
            down = true;
            key.classList.add('pressed');
            e.stopPropagation();
        });
        key.addEventListener('pointerup', (e) => {
            down = false;
            this.emitNoteOff(n, "pointer");
            key.classList.remove('pressed');
        });
        key.addEventListener('pointerleave', (e) => {
            if (down) {
                this.emitNoteOff(n, "pointer");
                key.classList.remove('pressed');
                down = false;
            }
        });
        key.addEventListener('pointerenter', (e) => {
            if (e.buttons > 0) {
                this.emitNoteOn(n, "pointer");
                key.classList.add('pressed');
                down = true;
            }
        });
        return key;
    }

    disconnectedCallback() {
        //console.log("Custom element removed from page.");
    }

    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        switch (name) {
            case 'armed': (newValue == "false") ? this.disarmKeyboard() : this.armKeyboard(); break;
        }
    }

    /**
     * Add note events to the event stream
     */
    emitNoteOn(note : number, source : string, velocity : number = 90) {
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

    isAccidental(note : number) : boolean {
        return [ 1, 3, 6, 8, 10 ].includes(note % 12);
    }

    /**
     * Show note being played
     */
    noteOn(note : number, velocity = 90) {
        const key = this.root.querySelector(`.marimba-key[data-note="${note}"]`);
        key?.classList.add('pressed');
    }
  
    /**
     * Hide note being played
     */
    noteOff(note : number) {
        const key = this.root.querySelector(`.marimba-key[data-note="${note}"]`);
        key?.classList.remove('pressed');
    }


    allNotesOff() {
        this.root.querySelectorAll('.marimba-key')
            .forEach((key) => key.classList.remove('pressed'));
    }


    /**
     * Is note currently pressed?
     */
    isNoteOn(note : number) : boolean {
        const key = this.root.querySelector(`.marimba-key[data-note="${note}"]`);
        if (key) return key.classList.contains('pressed');
        return false;
    }

    /**
     * Should the instrument respond to keyboard events?
     */
    armKeyboard() { 
        this.armed = true;
        this.container.classList.add('armed');
    }

    disarmKeyboard() {
        this.armed = false;
        this.container.classList.remove('armed');
    }
    get isKeyboardArmed() : boolean { return this.armed; }


    private getArmedKey(char : string) : Element | null {
        return this.root.querySelector(`.marimba-key[data-trigger="${char}"]`);
    }

    setPatch(patch : any) {  }

    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e : KeyboardEvent) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat == true) return;

        if (e.key == "ArrowDown") {
            this.emitPitchBend(-200, "keyboard");
        }
        else if (e.key == "ArrowUp") {
            this.emitPitchBend(200, "keyboard");
        }
        else if (this.isKeyboardArmed) {
            const key = this.getArmedKey(e.key!.toLowerCase());
            key?.classList.add('pressed');
            const note = toInt(key?.getAttribute('data-note'), -1);
            if (note > 0) this.emitNoteOn(note, "keyboard");
        }
    }
  
  
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e : KeyboardEvent) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            this.emitPitchBend(0, "keyboard");
        } else {
            const key = this.getArmedKey(e.key!.toLowerCase());
            key?.classList.remove('pressed');
            const note = toInt(key?.getAttribute('data-note'), -1);
            if (note > 0) this.emitNoteOff(note, "keyboard");
        }
    }
}

function toInt(d: any, defaultValue: number = 0): number {
    const n = parseInt(d);
    return isNaN(n) ? defaultValue : n;
}
