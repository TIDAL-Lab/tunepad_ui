const stylesheet$4 = new CSSStyleSheet();
stylesheet$4.replaceSync(`#ring {
    fill: #3e3e3c;
    stroke: none;
}
.track {
    fill: #181818;
    stroke: black;
    stroke-width: 1.5;
}
#arc {
    stroke: #7ff;
    stroke-width: 7;
    fill: none;
}
.active #arc {
    stroke: white;
}
#pointer {
    stroke: #ddd;
    stroke-width: 6;
    pointer-events: none;
}
#container {
    max-width: 100px;
    user-select: none;
}
.tick {
    fill: #999;
}
.cover {
    fill: #fff2;
    stroke: #fff1;
    stroke-width: 4;
    pointer-events: none;
}`);

var html$3 = "<div id=\"container\">\n    <svg version=\"1.1\" viewBox=\"-50 -50 100 100\">\n        <g transform=\"rotate(135, 0, 0)\">\n            <circle class=\"track\" cx=\"0\" cy=\"0\" r=\"49\"/>\n            <path id=\"arc\" d=\"\"/>\n            <circle id=\"ring\" cx=\"0\" cy=\"0\" r=\"36\"/>\n            <line id=\"pointer\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"46\"/>\n            <circle class=\"cover\" cx=\"0\" cy=\"0\" r=\"27\"/>\n            <circle class=\"tick\" cx=\"55\" cy=\"0\" r=\"4\"/>\n            <circle class=\"tick\" cx=\"0\" cy=\"-55\" r=\"4\"/>\n        </g>\n    </svg>\n</div>\n";

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
class Dial extends HTMLElement {
    /** current value between [ min, max ] */
    get value() {
        const range = this.maxValue - this.minValue;
        return this.minValue + this._value * range;
    }
    /** set the value of the dial (clamped between min and max) */
    set value(v) {
        const range = this.maxValue - this.minValue;
        v = Math.min(this.maxValue, Math.max(this.minValue, v));
        this._value = (v - this.minValue) / range;
        this._redraw();
    }
    // which direction is the dial pointing (radians)?
    get angle() {
        const sweep = this.maxAngle - this.minAngle;
        return this._value * sweep + this.minAngle;
    }
    constructor() {
        super();
        // minimum angle of the dial
        this.minAngle = 0.0;
        // maximum angle of the dial
        this.maxAngle = Math.PI * 1.5;
        // minimum possible value of the dial
        this.minValue = 0.0;
        // maximum possible value of the dial
        this.maxValue = 1.0;
        // current value between [ 0.0, 1.0 ]
        this._value = 0.0;
        this._startVal = 0.0;
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(stylesheet$4);
        this.root.innerHTML = html$3;
        this.container = this.root.querySelector('#container');
        this.ring = this.root.querySelector('#ring');
        this.line = this.root.querySelector('#pointer');
        this.arc = this.root.querySelector('#arc');
        this._value = 1;
        console.log(this._describeArc(55));
    }
    connectedCallback() {
        this.value = this._startVal;
        this._redraw();
        let down = false;
        let downY = -1;
        this.ring.addEventListener('pointerdown', (e) => {
            down = true;
            downY = e.clientY;
            this.container.classList.add('active');
        });
        document.addEventListener('pointermove', (e) => {
            if (down) {
                const deltaY = downY - e.clientY;
                downY = e.clientY;
                this._value = Math.max(0, Math.min(1.0, this._value + deltaY / 100.0));
                this._redraw();
                this.emitEvent('adjusted');
            }
        });
        document.addEventListener('pointerup', (e) => {
            if (down) {
                down = false;
                this.container.classList.remove('active');
                this.emitEvent('changed');
            }
        });
    }
    disconnectedCallback() {
    }
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'min') {
            this.minValue = parseFloat(newValue);
        }
        else if (name === 'max') {
            this.maxValue = parseFloat(newValue);
        }
        else if (name === 'value') {
            // if we're not connected yet, just hold on to this initial value
            // because it's possible that the min and max attributes haven't been set
            if (!this.isConnected) {
                this._startVal = parseFloat(newValue);
            }
            // otherwise directly change the property
            else {
                this.value = parseFloat(newValue);
            }
        }
    }
    /**
     * Fire custom events whenever the value is changed by the user
     */
    emitEvent(name) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail: {
                origin: this,
                value: this.value
            }
        }));
    }
    _redraw() {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const r1 = 15, r2 = 33, r3 = 43;
        this.line.setAttribute('x1', `${r1 * cos}`);
        this.line.setAttribute('y1', `${r1 * sin}`);
        this.line.setAttribute('x2', `${r2 * cos}`);
        this.line.setAttribute('y2', `${r2 * sin}`);
        this.arc.setAttribute('d', this._describeArc(r3));
    }
    _describeArc(r) {
        const sx = r * Math.cos(this.angle);
        const sy = r * Math.sin(this.angle);
        const ex = r * Math.cos(0);
        const ey = r * Math.sin(0);
        const large = (this.angle >= Math.PI) ? 1 : 0;
        return ["M", ex, ey, "A", r, r, 0, large, 1, sx, sy].join(" ");
    }
}
Dial.ELEMENT = "range-dial";
Dial.observedAttributes = [
    'min',
    'max',
    'value'
];

const stylesheet$3 = new CSSStyleSheet();
stylesheet$3.replaceSync(`
.drop-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #0001;
    border-radius: 8px;
    padding: 8px 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    box-shadow: 0px 3px 5px #0005;
    -webkit-touch-callout: none;
    user-select: none;
    margin: 0;
}
.drop-menu.hidden { display: none; }
.drop-menu:hover { cursor: pointer; }
.drop-menu.terminal {
    max-height: 70vh;
    overflow-y: auto !important;
}
.menu-item {
    line-height: 140%;
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: normal;
    color: #3C4E60;
    outline: none;
    border: none;
    padding: 5px 20px 5px 10px;
    white-space: nowrap;
    position: relative;
    text-align: left;
}
.menu-item:hover { background: rgba(0, 0, 0, 0.15); }
.menu-item:not(:has(.drop-menu)):active { background: rgba(0, 0, 0, 0.2); }
.menu-item.highlight { background: rgba(0, 0, 0, 0.085); }
.menu-item.disabled { color: #aaa; }
.menu-item.disabled:hover { background-color: transparent; }
.menu-item.disabled:active { background-color: transparent; }
.menu-item.disabled .icon { opacity: 0.3; }
.menu-item.hidden { display: none; }

.menu-item:hover > .drop-menu {
  display: flex;
  left: 88%;
  top: -10px;
}

.menu-item .icon {
    width: 1.1rem;
    height: 1.1rem;
    margin: 0 0.85rem 0 0.5rem;
    text-align: center;
    opacity: 0.6;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
}
.menu-item .expand {
  text-align: right;
  position: relative;
  left: 5px;
  font-size: 90%;
  width: 2em;
  flex: 1;
}
.menu-item .name {
  flex: 1;
}
.menu-item .expand::before {
  content: "▸";
  font-size: 17px;
  color: rgba(0,0,0,0.6);
  font-weight: 600;
}
.menu-separator {
    border-top: 1px solid #0005;
    margin: 10px;
    height: 2px;
}`);

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
const ContextMenuStyles = stylesheet$3;
class ContextMenu extends HTMLElement {
    constructor() {
        super();
        this.classList.add('drop-menu', 'hidden');
    }
    emitEvent(name) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail: { origin: this } }));
    }
    async connectedCallback() {
        const container = this.parentElement;
        container.addEventListener('pointerdown', (e) => {
            this.classList.toggle('hidden');
            e.stopPropagation();
            this.emitEvent('context-menu-open');
        });
        document.addEventListener('pointerdown', (e) => {
            this.classList.add('hidden');
        });
        document.addEventListener('context-menu-open', (e) => {
            const origin = e.detail.origin;
            if (origin !== this)
                this.classList.add('hidden');
        });
        this.addEventListener('context-menu-action', (e) => {
            this.classList.add('hidden');
        });
    }
}
ContextMenu.ELEMENT = "context-menu";
class ContextMenuItem extends HTMLElement {
    constructor() {
        super();
        this.disabled = false;
        this.classList.add('menu-item');
        this.name = document.createElement('div');
        this.name.classList.add('name');
        this.icon = document.createElement('div');
        this.icon.classList.add('icon');
        this.expand = document.createElement('div');
        this.expand.classList.add('expand');
    }
    emitEvent(name) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail: {
                origin: this,
                action: this.getAttribute('action'),
                checked: this.checked
            }
        }));
    }
    async connectedCallback() {
        this.appendChild(this.icon);
        this.appendChild(this.name);
        const submenu = this.querySelector('context-menu');
        if (submenu)
            this.appendChild(this.expand);
        this.addEventListener('pointerdown', (e) => e.stopPropagation());
        this.addEventListener('pointerup', (e) => {
            if (!this.disabled && !submenu) {
                this.toggleChecked();
                setTimeout(() => this.emitEvent('context-menu-action'), 100);
            }
        });
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this.name.innerHTML = newValue;
        }
        else if (name === 'icon') {
            this.icon.style.backgroundImage = `url(${newValue})`;
        }
        else if (name === 'disabled') {
            this.disabled = (newValue === 'true');
            this.classList.toggle('disabled', this.disabled);
        }
        else if (name === 'checked') {
            if (this.hasAttribute('radio-group') && newValue === 'true') {
                this.toggleChecked();
            }
            else {
                this.setChecked(newValue === 'true');
            }
        }
    }
    toggleChecked() {
        if (this.hasAttribute('radio-group')) {
            const grp = this.getAttribute('radio-group');
            this.uncheckSiblings(grp);
            this.setChecked(true);
            let ancestor = this.parentElement;
            while (ancestor instanceof ContextMenu || ancestor instanceof ContextMenuItem) {
                if (ancestor instanceof ContextMenuItem) {
                    if (ancestor.getAttribute('radio-group') === grp) {
                        ancestor.setChecked(true);
                    }
                }
                ancestor = ancestor.parentElement;
            }
        }
        else if (this.checked !== undefined) {
            this.setChecked(!this.checked);
        }
    }
    /**
     * Recursively uncheck any context menu item with the same radio-group attribute
     */
    uncheckSiblings(radioGroup) {
        let ancestor = this.parentElement;
        let p = ancestor;
        while (p instanceof ContextMenu || p instanceof ContextMenuItem) {
            p = p.parentElement;
            if (p instanceof ContextMenu)
                ancestor = p;
        }
        ancestor?.querySelectorAll(`.menu-item[radio-group=${radioGroup}]`)
            .forEach(item => {
            if (item instanceof ContextMenuItem) {
                item.setChecked(false);
            }
        });
    }
    setChecked(checked) {
        this.checked = checked;
        this.icon.style.backgroundImage = this.checked ? 'url(/assets/images/check-icon.svg)' : 'none';
    }
}
ContextMenuItem.ELEMENT = "context-menu-item";
ContextMenuItem.observedAttributes = ["name", "icon", "action", "disabled", "checked"];

const stylesheet$2 = new CSSStyleSheet();
stylesheet$2.replaceSync(`* {
    box-sizing: border-box;
}

.instrument {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
}

.instrument.armed {
    /*outline: 1px solid gold;*/
}

.wrapper {
    margin: 0 3px 3px 0;
    color: white;
    flex: 1;
    border-radius: 4px;
    border: 2px solid #fff1;
    box-shadow: 3px 3px 3px #0002;
}

.drum-pad {
    min-width: 58px;
    height: 72px;
    text-align: center;
    border-radius: 1px;
    background-color: #fff2;
    display: flex;
    flex-direction: column;
    border: 1px solid #fff5;
    position: relative;
}
.drum-pad:hover { 
    background-color: #fff5;
    border: 1px solid #fff7;
}
.drum-pad.pressed {
    background-color: #fff7;
    border: 1px solid #fff7;
}
.drum-name {
    color: #fffa;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 10px;
    user-select: none;
    flex: 1;
    align-content: center;
}
.drum-pad:hover .drum-name { color: white; }

.pad-name, .key-hint {
    font-size: 10px;
    pointer-events: none;
    user-select: none;
    position: absolute;
    bottom: 3px;
    color: #fff6;
}
.pad-name {
    font-weight: bold;
    color: #fffd;
    left: 3px;
}
.key-hint { right: 3px; }

.wrapper:has(.drum-pad.pressed[data-note="0"]) {
    background-color: hsl(0 90 50);
    box-shadow: 0px 0px 5px hsl(0 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="1"]) {
    background-color: hsl(22 90 50);
    box-shadow: 0px 0px 5px hsl(22 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="2"]) {
    background-color: hsl(44 90 50);
    box-shadow: 0px 0px 5px hsl(44 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="3"]) {
    background-color: hsl(66 90 50);
    box-shadow: 0px 0px 5px hsl(66 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="4"]) {
    background-color: hsl(88 90 50);
    box-shadow: 0px 0px 5px hsl(88 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="5"]) {
    background-color: hsl(110 90 50);
    box-shadow: 0px 0px 5px hsl(110 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="6"]) {
    background-color: hsl(132 90 50);
    box-shadow: 0px 0px 5px hsl(132 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="7"]) {
    background-color: hsl(154 90 50);
    box-shadow: 0px 0px 5px hsl(154 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="8"]) {
    background-color: hsl(176 90 50);
    box-shadow: 0px 0px 5px hsl(176 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="9"]) {
    background-color: hsl(198 90 50);
    box-shadow: 0px 0px 5px hsl(198 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="10"]) {
    background-color: hsl(220 90 50);
    box-shadow: 0px 0px 5px hsl(220 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="11"]) {
    background-color: hsl(242 90 50);
    box-shadow: 0px 0px 5px hsl(242 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="12"]) {
    background-color: hsl(264 90 50);
    box-shadow: 0px 0px 5px hsl(264 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="13"]) {
    background-color: hsl(286 90 50);
    box-shadow: 0px 0px 5px hsl(286 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="14"]) {
    background-color: hsl(308 90 50);
    box-shadow: 0px 0px 5px hsl(308 90 50);
}
.wrapper:has(.drum-pad.pressed[data-note="15"]) {
    background-color: hsl(330 90 50);
    box-shadow: 0px 0px 5px hsl(330 90 50);
}

@media screen and (max-width: 650px) {
    .instrument {
        grid-template-columns: repeat(4, 1fr);
    }
}`);

var html$2 = "<div class=\"instrument\"></div>\n";

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
/**
 * MPC-style drum pad interface
 *
 *       <drums-instrument armed = "false"></drums-instrument>
 *
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */
class DrumPad extends HTMLElement {
    constructor() {
        super();
        this.armed = false;
        this.keys = 'qwertyuiasdfghjk';
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(stylesheet$2);
        this.root.innerHTML = html$2;
    }
    connectedCallback() {
        document.addEventListener("keydown", e => this.onKeyDown(e));
        document.addEventListener("keyup", e => this.onKeyUp(e));
        for (let i = 0; i < 16; i++) {
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
                if (e.buttons > 0) {
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
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'armed' && newValue !== oldValue) {
            (newValue === 'true') ? this.armKeyboard() : this.disarmKeyboard();
        }
    }
    emitNoteOn(note, source, velocity = 90) {
        if (note < 0)
            return;
        const e = new CustomEvent('note-on', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: velocity
            }
        });
        this.dispatchEvent(e);
    }
    emitNoteOff(note, source) {
        if (note < 0)
            return;
        const e = new CustomEvent('note-off', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: 0
            }
        });
        this.dispatchEvent(e);
    }
    emitPitchBend(value, source) {
        const e = new CustomEvent('pitch-bend', {
            bubbles: true,
            composed: true,
            detail: {
                source: source,
                value: value
            }
        });
        this.dispatchEvent(e);
    }
    /**
     * Show note being played
     */
    noteOn(note, velocity = 90) {
        this.root.querySelector(`.drum-pad[data-note="${note}"]`)?.classList.add('pressed');
    }
    /**
     * Hide note being played
     */
    noteOff(note) {
        this.root.querySelector(`.drum-pad[data-note="${note}"]`)?.classList.remove('pressed');
    }
    allNotesOff() {
        this.root.querySelectorAll('.drum-pad')?.forEach(p => p.classList.remove('pressed'));
    }
    /**
     * Is note currently pressed?
     */
    isNoteOn(note) {
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
    get isKeyboardArmed() { return this.armed; }
    /**
     * Set the names of the drum pads
     */
    setPatch(patch) {
        if (Array.isArray(patch.nodes)) {
            for (let node of patch.nodes) {
                if (node.type === 'drums' && Array.isArray(node.samples)) {
                    for (let samp of node.samples) {
                        if (typeof samp.step === 'number' && typeof samp.name === 'string') {
                            const name = this.root.querySelector(`.drum-pad[data-note="${samp.step}"] .drum-name`);
                            if (name)
                                name.innerHTML = samp.name;
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
    onKeyDown(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat == true)
            return;
        if (this.isKeyboardArmed) {
            const key = e.key.toLowerCase();
            console.log(key);
            console.log(this.root.querySelector(`.drum-pad[data-hint="${key}"]`));
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
    onKeyUp(e) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            this.emitPitchBend(0, "keyboard");
        }
        else {
            const key = e.key.toLowerCase();
            this.root.querySelector(`.drum-pad[data-hint="${key}"]`)?.classList.remove('pressed');
            const note = this.keys.indexOf(key);
            if (note >= 0)
                this.emitNoteOff(note, "keyboard");
        }
    }
    getPadNote(pad) {
        return parseInt(pad?.getAttribute('data-note') ?? '-1');
    }
}
DrumPad.observedAttributes = ["armed"];
DrumPad.ELEMENT = "drums-instrument";

const stylesheet$1 = new CSSStyleSheet();
stylesheet$1.replaceSync(`/*
@keyframes fade-out {
    0% {
        opacity: 1.0;
    }

    100% {
        opacity: 0.0;
    }
}
*/
.instrument {
    position: relative;
    box-sizing: border-box;
    display: flex;
    background-color: #222;
    overflow: hidden;
    flex-direction: column;
}

.instrument.armed {
    outline: 1px solid gold;
}

.naturals, .accidentals {
    width: 100%;
    display: flex;
}
.accidentals {
    height: 50px;
    position: relative;
    top: 10px;
    left: -20px;
}
.marimba-key, .spacer {
    border: 2px solid #fff2;
    flex: 1;
    margin: 3px;
    box-sizing: border-box;
    min-width: 34px;
}

.marimba-key {
    background-color: burlywood;
    background-image: url('/assets/images/marimba-key.png');
    background-position: center;
    background-size: cover;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    text-align: center;
    height: 160px;
    font-size: 12px;
    padding-top: 20px;
    color: #fff9;
    user-select: none;
    box-shadow: 0 0 6px #000b;
}

.spacer {
    pointer-events: none;
    opacity: 0;
}

.marimba-key.accidental {
    height: 70px;
    padding-top: 10px;
    position: relative;
    top: -20px;
}

.accidental .note-name { display: none; }

.marimba-key:hover {
    border: 2px solid #fff7;
    color: white;
}

.marimba-key.pressed {
    border: 2px solid white;
}
/*
.marimba-key.white.pressed.step-0 { fill: rgb(229, 76, 78); }
.marimba-key.white.pressed.step-2 { fill: rgb(228, 171, 81); }
.marimba-key.white.pressed.step-4 { fill: rgb(223, 228, 78); }
.marimba-key.white.pressed.step-5 { fill: rgb(174, 215, 71); }
.marimba-key.white.pressed.step-7 { fill: rgb(63, 169, 180); }
.marimba-key.white.pressed.step-9 { fill: rgb(78, 69, 179); }
.marimba-key.white.pressed.step-11 { fill: rgb(202, 69, 147); }
*/

.note-name { flex: 1; }
.key-hint { margin-bottom: 1rem; display: none; }
.armed .key-hint { display: block; }
`);

var html$1 = "<div class=\"instrument\"></div>";

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
/**
 * Marimba custom element
 *
 * <marimba-instrument armed="false">
 * </marimba-instrument>
 *
 * Generates custom events "note-on", "note-off", "pitch-bend"
 */
class Marimba extends HTMLElement {
    get minKey() { return 48; }
    get maxKey() { return 77; }
    constructor() {
        super();
        this.armed = false;
        /// mapping from computer keys to instrument keys
        this.key_map = "awsedftgyhujkolp;']";
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(stylesheet$1);
        this.root.innerHTML = html$1;
        this.container = this.root.querySelector('.instrument');
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
            }
            else {
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
    _buildKey(n) {
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
        }
        else {
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
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'armed':
                (newValue == "false") ? this.disarmKeyboard() : this.armKeyboard();
                break;
        }
    }
    /**
     * Add note events to the event stream
     */
    emitNoteOn(note, source, velocity = 90) {
        const e = new CustomEvent('note-on', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: velocity
            }
        });
        this.dispatchEvent(e);
    }
    emitNoteOff(note, source) {
        const e = new CustomEvent('note-off', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: 0
            }
        });
        this.dispatchEvent(e);
    }
    emitPitchBend(value, source) {
        const e = new CustomEvent('pitch-bend', {
            bubbles: true,
            composed: true,
            detail: {
                source: source,
                value: value
            }
        });
        this.dispatchEvent(e);
    }
    isAccidental(note) {
        return [1, 3, 6, 8, 10].includes(note % 12);
    }
    /**
     * Show note being played
     */
    noteOn(note, velocity = 90) {
        const key = this.root.querySelector(`.marimba-key[data-note="${note}"]`);
        key?.classList.add('pressed');
    }
    /**
     * Hide note being played
     */
    noteOff(note) {
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
    isNoteOn(note) {
        const key = this.root.querySelector(`.marimba-key[data-note="${note}"]`);
        if (key)
            return key.classList.contains('pressed');
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
    get isKeyboardArmed() { return this.armed; }
    getArmedKey(char) {
        return this.root.querySelector(`.marimba-key[data-trigger="${char}"]`);
    }
    setPatch(patch) { }
    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat == true)
            return;
        if (e.key == "ArrowDown") {
            this.emitPitchBend(-200, "keyboard");
        }
        else if (e.key == "ArrowUp") {
            this.emitPitchBend(200, "keyboard");
        }
        else if (this.isKeyboardArmed) {
            const key = this.getArmedKey(e.key.toLowerCase());
            key?.classList.add('pressed');
            const note = toInt$1(key?.getAttribute('data-note'), -1);
            if (note > 0)
                this.emitNoteOn(note, "keyboard");
        }
    }
    /**
     * Process a computer key up event ... possibly release a note
     */
    onKeyUp(e) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            this.emitPitchBend(0, "keyboard");
        }
        else {
            const key = this.getArmedKey(e.key.toLowerCase());
            key?.classList.remove('pressed');
            const note = toInt$1(key?.getAttribute('data-note'), -1);
            if (note > 0)
                this.emitNoteOff(note, "keyboard");
        }
    }
}
/// musical notes (in half steps) in the 12-note chromatic scale
Marimba.NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
Marimba.observedAttributes = [
    "armed", // accepts keyboard input ("true" | "false")
];
Marimba.ELEMENT = "marimba-instrument";
function toInt$1(d, defaultValue = 0) {
    const n = parseInt(d);
    return isNaN(n) ? defaultValue : n;
}

const stylesheet = new CSSStyleSheet();
stylesheet.replaceSync(`/*
@keyframes fade-out {
    0% {
        opacity: 1.0;
    }

    100% {
        opacity: 0.0;
    }
}
*/
.wrapper {
    display: flex;
}

.instrument {
    flex: 1;
    position: relative;
    box-sizing: border-box;
    display: flex;
}

.backdrop {
    fill: #30303f;
}

.container {
    width: 100%;
}

.piano-key.black {
    fill: #1d1e1f;
    stroke: #222;
    stroke-width: 1.5;
    rx: 1.5;
}

.piano-key.black .black-top {
    fill: #444;
}

.piano-key.black:hover .black-top {
    fill: #777;
}

.piano-key.black.pressed .black-top {
    fill: #222;
}

.piano-key.white {
    fill: #ecedee;
    stroke: #f7f7f8;
    stroke-width: 1.5;
    rx: 1.4;
}

.piano-key.white:hover {
    fill: #ccc;
}

.piano-key.white.pressed {
    fill: #aaa;
    stroke: #777;
}
/*
.piano-key.white.pressed.step-0 { fill: rgb(229, 76, 78); }
.piano-key.white.pressed.step-2 { fill: rgb(228, 171, 81); }
.piano-key.white.pressed.step-4 { fill: rgb(223, 228, 78); }
.piano-key.white.pressed.step-5 { fill: rgb(174, 215, 71); }
.piano-key.white.pressed.step-7 { fill: rgb(63, 169, 180); }
.piano-key.white.pressed.step-9 { fill: rgb(78, 69, 179); }
.piano-key.white.pressed.step-11 { fill: rgb(202, 69, 147); }
*/
.note-hint,
.midi-hint,
.key-hint {
    stroke: none;
    font: 9pt sans-serif;
    fill: #0006;
    text-anchor: middle;
    opacity: 0.0;
    pointer-events: none;
    user-select: none;
}

.midi-hint.black, .note-hint.black, .key-hint.black {
    fill: #ccc;
}
.show {
    opacity: 1.0;
}

.note-hint.always-show {
    opacity: 1.0;
}

.felt {
    fill: #a00;
}

.animated-slide {
    transition: transform 0.5s ease-in-out;
}

.mini-piano {
    opacity: 0.0;
    transition: opacity 0.25s;
}

.mini-piano.show {
    opacity: 1.0;
}

.octave-button {
    background-color: transparent;
    border: none;
    outline: none;
    color: #fffc;
    font-size: 14px;
    user-select: none;
    width: 12px;
    padding: 0;
    height: 100%;
    position: absolute;
    top: 0;
}
.octave-button:hover { color: #fff; }
.octave-button:active { color: rgb(121, 216, 245); }
#down-octave { left: 0; }
#up-octave { right: 0; }`);

var html = "<div classs=\"wrapper\">\n    <button id=\"down-octave\" class=\"octave-button\" title=\"Lower Octave\">❮</button>\n    <div class=\"instrument\"><svg class=\"container\" version=\"1.1\"></svg></div>\n    <button id=\"up-octave\" class=\"octave-button\" title=\"Higher Octave\">❯</button>\n</div>";

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
class Piano extends HTMLElement {
    get minKey() { return this.props.minNote; }
    get maxKey() { return this.props.maxNote; }
    get minOctave() { return Math.floor(this.minKey / 12) - 1; }
    get maxOctave() {
        const maxOctave = Math.floor(this.maxKey / 12) - 1;
        const focusNote = maxOctave * 12 + 12;
        return (this.maxKey - focusNote < this.key_map.length) ? maxOctave - 1 : maxOctave;
    }
    constructor() {
        super();
        /// attribute set
        this.props = {
            noteHints: true,
            midiHints: true,
            armed: false,
            minNote: 12,
            maxNote: 107,
            keyRange: 17,
            focusOctave: 2
        };
        /// <svg> tag that contains the instrument
        this.container = null;
        /// group that contains all of the visual elements
        this.parent = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        /// group that contains all the keys
        this.allKeys = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        /// array of piano keys
        this.keys = [];
        /// size of the containing element
        this.width = 700;
        this.height = 190;
        /// mini piano that shows where we are left-to-right
        //late MiniPiano mini;
        /// mapping from computer keys to piano keys
        this.key_map = "awsedftgyhujkolp;']";
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(stylesheet);
        //this.mini = MiniPiano(this);
    }
    connectedCallback() {
        const template = document.createElement('template');
        template.innerHTML = html;
        // Create a shadow root
        this.root.appendChild(template.content.cloneNode(true));
        // load the container <svg> element from the shadow dom
        this.container = this.root.querySelector("svg.container");
        this.container?.append(this.parent);
        this.container?.setAttribute('viewBox', `0 0 ${this.props.keyRange * PianoKey.width} 190`);
        // render SVG content
        this.render();
        // listen to keyboard events
        document.addEventListener("keydown", e => this.onKeyDown(e));
        document.addEventListener("keyup", e => this.onKeyUp(e));
        this.root.querySelector('#down-octave')?.addEventListener('click', (e) => {
            this.setFocusOctave(this.props.focusOctave - 1);
        });
        this.root.querySelector('#up-octave')?.addEventListener('click', (e) => {
            this.setFocusOctave(this.props.focusOctave + 1);
        });
    }
    disconnectedCallback() {
        //console.log("Custom element removed from page.");
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'note-hints':
                this.setNoteHints(newValue == "true");
                break;
            case 'midi-hints':
                this.setMidiHints(newValue == "true");
                break;
            case 'armed':
                (newValue == "true") ? this.armKeyboard() : this.disarmKeyboard();
                break;
            case 'key-range':
                this.setKeyRange(parseInt(newValue));
                break;
            case 'min-octave':
                this.setMinOctave(parseInt(newValue));
                break;
            case 'max-octave':
                this.setMaxOctave(parseInt(newValue));
                break;
            case 'min-note':
                this.setMinNote(parseInt(newValue));
                break;
            case 'max-note':
                this.setMaxNote(parseInt(newValue));
                break;
            case 'focus-octave':
                this.setFocusOctave(parseInt(newValue));
                break;
        }
    }
    /**
     * Add note events to the event stream
     */
    emitNoteOn(note, source, velocity = 90) {
        const e = new CustomEvent('note-on', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: velocity
            }
        });
        this.dispatchEvent(e);
    }
    emitNoteOff(note, source) {
        const e = new CustomEvent('note-off', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: 0
            }
        });
        this.dispatchEvent(e);
    }
    emitPitchBend(value, source) {
        const e = new CustomEvent('pitch-bend', {
            bubbles: true,
            composed: true,
            detail: {
                source: source,
                value: value
            }
        });
        this.dispatchEvent(e);
    }
    /**
     * Show note being played
     */
    noteOn(note, velocity = 90) {
        const key = this._noteToKey(note);
        key?.press();
    }
    /**
     * Hide note being played
     */
    noteOff(note) {
        let key = this._noteToKey(note);
        key?.release();
    }
    allNotesOff() {
        this.keys.forEach((key) => key.release());
    }
    /**
     * Is note currently pressed?
    */
    isNoteOn(note) {
        const key = this._noteToKey(note);
        return (key != null && key.isPressed());
    }
    /**
     * How many white keys to show at one time
     */
    setKeyRange(count) {
        if (!isNaN(count)) {
            this.props.keyRange = Math.max(7, Math.min(count, 56));
            this.container?.setAttribute('viewBox', `0 0 ${this.props.keyRange * PianoKey.width} 190`);
        }
    }
    setMinOctave(octave) {
        if (!isNaN(octave))
            this.setMinNote(octave * 12 + 12);
    }
    setMaxOctave(octave) {
        if (!isNaN(octave))
            this.setMaxNote(octave * 12 + 23);
    }
    setMinNote(note) {
        if (isNaN(note))
            return;
        note = Math.max(0, Math.min(96, note));
        if (note != this.props.minNote) {
            this.props.minNote = note;
            this.render();
        }
    }
    setMaxNote(note) {
        if (isNaN(note))
            return;
        note = Math.max(12, Math.min(108, note));
        if (note != this.props.maxNote) {
            this.props.maxNote = note;
            this.render();
        }
    }
    /**
     * Should the piano respond to keyboard events?
     */
    armKeyboard() {
        this.props.armed = true;
        this.root.querySelectorAll(".key-hint").forEach(e => { e.classList.add("show"); });
    }
    disarmKeyboard() {
        this.props.armed = false;
        this.root.querySelectorAll(".key-hint").forEach(e => { e.classList.remove("show"); });
    }
    get isKeyboardArmed() { return this.props.armed; }
    getArmedKey(char) {
        let focusNote = this.props.focusOctave * 12 + 12;
        if (focusNote < this.props.minNote) {
            focusNote += 12;
        }
        const ki = this.key_map.indexOf(char.toLowerCase());
        return (ki >= 0) ? this._noteToKey(focusNote + ki) : null;
    }
    setPatch(patch) {
        if ('min-note' in patch) {
            this.setMinNote(toInt(patch['min-note'], this.props.minNote));
        }
        if ('max-note' in patch) {
            this.setMaxNote(toInt(patch['max-note'], this.props.maxNote));
        }
        if ('key-range' in patch) {
            this.setKeyRange(toInt(patch['key-range'], this.props.keyRange));
        }
        if ('focus-octave' in patch) {
            this.setFocusOctave(toInt(patch['focus-octave'], this.props.focusOctave));
        }
    }
    /**
     * Process a computer key down event ... possibly play a note
     */
    onKeyDown(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.repeat == true)
            return;
        if (this.isKeyboardArmed) {
            const key = this.getArmedKey(e.key.toLowerCase());
            if (key) {
                this.emitNoteOn(key.note, "keyboard");
                key.press();
            }
            else if (e.key == "ArrowLeft") {
                this.setFocusOctave(this.props.focusOctave - 1);
            }
            else if (e.key == "ArrowRight") {
                this.setFocusOctave(this.props.focusOctave + 1);
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
    onKeyUp(e) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            this.emitPitchBend(0, "keyboard");
        }
        else {
            const key = this.getArmedKey(e.key.toLowerCase());
            if (key) {
                this.emitNoteOff(key.note, "keyboard");
                key.release();
            }
        }
    }
    /**
     * Convert a midi note to piano key number
     */
    _noteToKey(midi) {
        for (let key of this.keys) {
            if (key.note === midi)
                return key;
        }
        return null;
    }
    render() {
        if (this.container == null)
            return; // only render once mounted
        this.parent.innerHTML = "";
        this.keys = [];
        const backdrop = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        backdrop.classList.add("backdrop");
        backdrop.setAttribute("width", "100%");
        backdrop.setAttribute("height", "100%");
        this.parent.append(backdrop);
        this.allKeys.classList.add("animated-slide");
        const whiteKeys = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        const blackKeys = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        // generate piano keys
        for (let i = this.minKey; i <= this.maxKey; i++) {
            const key = new PianoKey(i, this);
            this.keys.push(key);
            if (key.black) {
                blackKeys.append(key.el);
            }
            else {
                whiteKeys.append(key.el);
            }
        }
        this.allKeys.innerHTML = '';
        this.allKeys.append(whiteKeys);
        this.allKeys.append(blackKeys);
        this.parent.append(this.allKeys);
        /*
                const shelf = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
                shelf.setAttribute("width", "100%");
                shelf.setAttribute("height", "6");
                shelf.setAttribute("x", "0");
                shelf.setAttribute("y", "1");
                shelf.setAttribute("fill", "black");
                shelf.setAttribute("fill-opacity", "0.2");
                this.parent.append(shelf);
        */
        const felt = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        felt.classList.add("felt");
        felt.setAttribute("width", "100%");
        felt.setAttribute("height", "1.5");
        felt.setAttribute("x", "0");
        felt.setAttribute("y", "0");
        this.parent.append(felt);
        // set up minified piano
        //this.mini.render();
        this.setFocusOctave(this.props.focusOctave);
        //this.mini.hide();
        //this.parent.append(mini.el);
    }
    setFocusOctave(octave) {
        if (isNaN(octave) || this.container == null)
            return;
        this.props.focusOctave = Math.max(this.minOctave, Math.min(this.maxOctave, octave));
        let focusNote = this.props.focusOctave * 12 + 12;
        if (focusNote < this.props.minNote) {
            focusNote += 12;
        }
        const focusKey = this._noteToKey(focusNote);
        this.keys.forEach((key) => key.autoRelease());
        if (focusKey) {
            const dx = focusKey.x;
            this.allKeys.style.transform = `translateX(${-dx}px)`;
            // update keyboard hints
            this.keys.forEach((key) => key.clearKeymap());
            for (let i = 0; i < this.key_map.length; i++) {
                const key = this._noteToKey(focusNote + i);
                if (key)
                    key.setKeymap(this.key_map[i]);
            }
            //this.mini.show();
            //this.mini.slide(dx);
        }
    }
    /**
     * Show note name hints
     */
    setNoteHints(on) {
        this.props.noteHints = on;
        this.root.querySelectorAll(".note-hint").forEach(e => { e.classList.toggle("show", on); });
    }
    get showNoteHints() { return this.props.noteHints; }
    /**
     * Show midi number hints
     */
    setMidiHints(on) {
        this.props.midiHints = on;
        this.root.querySelectorAll(".midi-hint").forEach(e => { e.classList.toggle("show", on); });
    }
    get showMidiHints() { return this.props.midiHints; }
}
Piano.observedAttributes = [
    "note-hints", // show note names ("true" | "false")
    "midi-hints", // show midi note numbers ("true" | "false")
    "armed", // accepts keyboard input ("true" | "false")
    "min-octave", // lowest octave (0)
    "max-octave", // highest octave (7)
    "min-note", // lowest note available (21 optional overrides min-octave)
    "max-note", // highest note available (108 optional overrides min-octave)
    "key-range", // how many keys to show at one time
    "focus-octave" // left-most octave showing
];
Piano.ELEMENT = "piano-instrument";
/**
 * Represents a black or white key on the piano keyboard
 */
class PianoKey {
    /// half step value (0 - 12)
    get step() { return this.note % 12; }
    /// note octave
    get octave() { return Math.floor(this.note / 12) - 1; }
    /// note name
    get name() { return `${PianoKey.NOTES[this.step]}`; }
    /// index x-coordinate on the keyboard
    get offset() {
        const oct = this.octave - this.piano.minOctave;
        return oct * 7 + this._key_offsets[this.step];
    }
    /// pixel x-coordinate on the keyboard
    get x() { return this.offset * PianoKey.width; }
    /// is this a black key or white key?
    get black() { return [1, 3, 6, 8, 10].includes(this.step); }
    /// is this a white key
    get white() { return !this.black; }
    /// height of key
    get height() { return this.black ? 130 : 195; }
    constructor(note, piano) {
        /// key map hint
        this.keyHint = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        /// key offset arrangement starting with C
        /// this helps us render black keys at off-center positions
        this._key_offsets = [0, 0.45, 1, 1.55, 2, 3, 3.4, 4, 4.5, 5, 5.6, 6];
        this._hint_offsets = [-8, 0, 0, 0, +8, -8, 0, 0, 0, 0, 0, +8];
        /// visual element for SVG
        this.el = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        /// main key rectangle
        this.rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        /// is the key currently pressed?
        this._down = false;
        this.note = note;
        this.piano = piano;
        this.el.setAttribute("transform", `translate(${this.x}, 0)`);
        this.el.classList.add("piano-key", `step-${this.step}`);
        this.el.classList.add(this.black ? "black" : "white");
        const pad = this.black ? 10 : 1.5;
        let x0 = pad;
        let w = PianoKey.width - (pad * 2);
        this.rect.setAttribute("x", `${x0}`);
        this.rect.setAttribute("y", "-8");
        this.rect.setAttribute("width", `${w}`);
        this.rect.setAttribute("height", `${this.height}`);
        this.rect.setAttribute("rx", "3");
        this.el.append(this.rect);
        if (this.black) {
            x0 += 3;
            w -= 6;
            const r = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            r.classList.add("black-top");
            r.setAttribute("x", `${x0}`);
            r.setAttribute("y", "-5");
            r.setAttribute("width", `${w}`);
            r.setAttribute("height", `${this.height - 20}`);
            r.setAttribute("pointer-events", "none");
            this.el.append(r);
        }
        else {
            const noteHint = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            noteHint.classList.add("note-hint");
            noteHint.setAttribute("x", `${x0 + w / 2}`);
            noteHint.setAttribute("y", `${this.height - 17}`);
            noteHint.innerHTML = `${this.name}${this.octave}`;
            if (this.piano.showNoteHints)
                noteHint.classList.add("show");
            // always show C notes
            if (this.step == 0)
                noteHint.classList.add('always-show');
            this.el.append(noteHint);
        }
        const midiHint = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        midiHint.classList.add("midi-hint");
        if (this.black)
            midiHint.classList.add("black");
        midiHint.setAttribute("x", `${x0 + w / 2}`);
        midiHint.setAttribute("y", `${this.height - 35}`);
        midiHint.innerHTML = `${this.note}`;
        if (this.piano.showMidiHints)
            midiHint.classList.add("show");
        this.el.append(midiHint);
        let hx = x0 + w / 2 + this._hint_offsets[this.step];
        this.keyHint.classList.add("key-hint");
        if (this.black)
            this.keyHint.classList.add("black");
        this.keyHint.setAttribute("x", `${hx}`);
        this.keyHint.setAttribute("y", this.black ? "45" : "60");
        //this.keyHint.setAttribute("y", `${this.height - 57}`);
        if (this.piano.isKeyboardArmed)
            this.keyHint.classList.add("show");
        this.el.append(this.keyHint);
        // set up mouse events
        this.el.addEventListener('pointerdown', (e) => {
            this.piano.emitNoteOn(this.note, "pointer");
            this.press();
            e.stopPropagation();
        });
        this.el.addEventListener('pointerup', (e) => {
            this.piano.emitNoteOff(this.note, "pointer");
            this.release();
        });
        this.el.addEventListener('pointerleave', (e) => {
            if (this._down) {
                this.piano.emitNoteOff(this.note, "pointer");
                this.release();
            }
        });
        this.el.addEventListener('pointerenter', (e) => {
            if (e.buttons > 0) {
                this.piano.emitNoteOn(this.note, "pointer");
                this.press();
            }
        });
    }
    press() {
        this._down = true;
        this.el.classList.add("pressed");
    }
    release() {
        if (this._down) {
            this._down = false;
            this.el.classList.remove("pressed");
        }
    }
    isPressed() {
        return this.el.classList.contains("pressed");
    }
    autoRelease() {
        if (this._down) {
            this.piano.emitNoteOff(this.note, "system");
            this._down = false;
            this.el.classList.remove("pressed");
        }
    }
    setKeymap(k) {
        this.keyHint.innerHTML = k;
    }
    clearKeymap() {
        this.keyHint.innerHTML = "";
    }
}
/// musical notes (in half steps) in the 12-note chromatic scale
PianoKey.NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
/// pixel width of white key (in SVG coords system)
PianoKey.width = 45;
/**
 * Parses an int from an object (usually a string)
 * @param d - The input value to be parsed
 * @param defaultValue - The default value to return if the parsing fails
 * @returns The parsed integer value
 */
function toInt(d, defaultValue = 0) {
    const n = parseInt(d);
    return isNaN(n) ? defaultValue : n;
}
/**
 * Parses a number from an object (usually a string)
 * @param d - The input value to be parsed
 * @param defaultValue - The default value to return if the parsing fails
 * @returns The parsed number value
 */
function toNum(d, defaultValue = 0) {
    const n = parseFloat(d);
    return isNaN(n) ? defaultValue : n;
}

export { ContextMenu, ContextMenuItem, ContextMenuStyles, Dial, DrumPad, Marimba, Piano, toInt, toNum };
//# sourceMappingURL=index.js.map
