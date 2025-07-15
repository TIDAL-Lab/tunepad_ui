const sheet$6 = new CSSStyleSheet();sheet$6.replaceSync("#ring {\n    fill: #3e3e3c;\n    stroke: none;\n}\n.track {\n    fill: #181818;\n    stroke: black;\n    stroke-width: 1.5;\n}\n#arc {\n    stroke: #7ff;\n    stroke-width: 7;\n    fill: none;\n}\n.active #arc {\n    stroke: white;\n}\n#pointer {\n    stroke: #ddd;\n    stroke-width: 6;\n    pointer-events: none;\n}\n#container {\n    max-width: 100px;\n    user-select: none;\n}\n.tick {\n    fill: #999;\n}\n.cover {\n    fill: #fff2;\n    stroke: #fff1;\n    stroke-width: 4;\n    pointer-events: none;\n}");

var html$6 = "<div id=\"container\">\n    <svg version=\"1.1\" viewBox=\"-50 -50 100 100\">\n        <g transform=\"rotate(135, 0, 0)\">\n            <circle class=\"track\" cx=\"0\" cy=\"0\" r=\"49\"/>\n            <path id=\"arc\" d=\"\"/>\n            <circle id=\"ring\" cx=\"0\" cy=\"0\" r=\"36\"/>\n            <line id=\"pointer\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"46\"/>\n            <circle class=\"cover\" cx=\"0\" cy=\"0\" r=\"27\"/>\n            <circle class=\"tick\" cx=\"55\" cy=\"0\" r=\"4\"/>\n            <circle class=\"tick\" cx=\"0\" cy=\"-55\" r=\"4\"/>\n        </g>\n    </svg>\n</div>\n";

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
        this.root.adoptedStyleSheets.push(sheet$6);
        this.root.innerHTML = html$6;
        this.container = this.root.querySelector('#container');
        this.ring = this.root.querySelector('#ring');
        this.line = this.root.querySelector('#pointer');
        this.arc = this.root.querySelector('#arc');
        this._value = 1;
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
    disconnectedCallback() { }
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

const sheet$5 = new CSSStyleSheet();sheet$5.replaceSync(".menu-container {\n  position: relative;\n}\n\ncontext-menu {\n    position: absolute;\n    background-color: white;\n    border: 1px solid #0001;\n    border-radius: 8px;\n    padding: 8px 0;\n    z-index: 100;\n    display: flex;\n    flex-direction: column;\n    min-width: 200px;\n    box-shadow: 0px 3px 5px #0005;\n    -webkit-touch-callout: none;\n    user-select: none;\n    margin: 0;\n}\ncontext-menu.hidden { display: none; }\ncontext-menu:hover { cursor: pointer; }\ncontext-menu.terminal {\n    max-height: 70vh;\n    overflow-y: auto !important;\n}\ncontext-menu.open-up {\n  bottom: 30px;\n}\ncontext-menu-item {\n    line-height: 140%;\n    display: flex;\n    align-items: center;\n    font-size: 14px;\n    font-weight: normal;\n    color: #3C4E60;\n    outline: none;\n    border: none;\n    padding: 5px 20px 5px 10px;\n    white-space: nowrap;\n    position: relative;\n    text-align: left;\n}\ncontext-menu-item:hover { background: rgba(0, 0, 0, 0.15); }\ncontext-menu-item:active { background: rgba(0, 0, 0, 0.2); }\ncontext-menu-item.highlight { background: rgba(0, 0, 0, 0.085); }\ncontext-menu-item.disabled { color: #aaa; }\ncontext-menu-item.disabled:hover { background-color: transparent; }\ncontext-menu-item.disabled:active { background-color: transparent; }\ncontext-menu-item.disabled .icon { opacity: 0.3; }\ncontext-menu-item.hidden { display: none; }\ncontext-menu-item > context-menu { left: 98%; top: -10px; }\n\ncontext-menu-item .icon {\n    width: 1.1rem;\n    height: 1.1rem;\n    margin: 0 1rem 0 0.1rem;\n    opacity: 1.0;\n}\ncontext-menu-item .expand {\n  text-align: right;\n  position: relative;\n  left: 5px;\n  font-size: 90%;\n  width: 2em;\n  flex: 1;\n}\ncontext-menu-item .checkmark {\n  width: 1.1rem;\n  height: 1.1rem;\n  margin: 0;\n  display: none;\n}\ncontext-menu-item[checked=\"true\"] .checkmark {\n  display: block;\n}\ncontext-menu-item:has(context-menu-item[checked=\"true\"]) {\n  background-color: #0002;\n}\ncontext-menu-item .name {\n  flex: 1;\n}\ncontext-menu-item .expand::before {\n  content: \"▸\";\n  font-size: 17px;\n  color: rgba(0,0,0,0.6);\n  font-weight: 600;\n}\n.menu-separator {\n    border-top: 1px solid #0005;\n    margin: 10px;\n    height: 2px;\n}");

var iconCheck = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d=\"M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z\"/></svg>";

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
const ContextMenuStyles = sheet$5;
class ContextMenu extends HTMLElement {
    constructor() {
        super();
        this.classList.add('hidden');
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
    get checked() { return this.getAttribute('checked') === 'true'; }
    get action() { return this.getAttribute('action'); }
    constructor() {
        super();
        this.disabled = false;
        this.name = document.createElement('div');
        this.name.classList.add('name');
        this.icon = document.createElement('div');
        this.icon.classList.add('icon');
        this.expand = document.createElement('div');
        this.expand.classList.add('expand');
        this.checkmark = document.createElement('div');
        this.checkmark.classList.add('checkmark');
    }
    emitEvent(name) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail: {
                origin: this,
                action: this.action,
                checked: this.checked
            }
        }));
    }
    async connectedCallback() {
        this.appendChild(this.icon);
        this.appendChild(this.name);
        const submenu = this.querySelector('context-menu');
        if (submenu) {
            this.appendChild(this.expand);
        }
        else {
            this.appendChild(this.checkmark);
            this.checkmark.innerHTML = iconCheck;
        }
        this.addEventListener('pointerdown', (e) => e.stopImmediatePropagation());
        this.addEventListener('pointerup', (e) => {
            if (submenu) {
                this.parentElement?.querySelectorAll('context-menu').forEach(menu => menu.classList.add('hidden'));
                submenu.classList.remove('hidden');
            }
            else if (!this.disabled && !submenu) {
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
    uncheckSiblings(radioGroup) {
        let ancestor = this.parentElement;
        let p = ancestor;
        while (p instanceof ContextMenu || p instanceof ContextMenuItem) {
            p = p.parentElement;
            if (p instanceof ContextMenu)
                ancestor = p;
        }
        ancestor?.querySelectorAll(`context-menu-item[radio-group=${radioGroup}]`)
            .forEach(item => {
            if (item instanceof ContextMenuItem && item !== this) {
                item.setAttribute('checked', 'false');
            }
        });
    }
    setChecked() {
        if (this.hasAttribute('radio-group')) {
            const grp = this.getAttribute('radio-group');
            this.uncheckSiblings(grp);
        }
    }
    toggleChecked() {
        if (this.hasAttribute('checked')) {
            this.setAttribute('checked', `${!this.checked}`);
        }
    }
}
ContextMenuItem.ELEMENT = "context-menu-item";
ContextMenuItem.observedAttributes = ["name", "icon", "action", "disabled", "checked"];

const sheet$4 = new CSSStyleSheet();sheet$4.replaceSync(":host {\n    width: 370px;\n    height: 370px;\n    display: block;\n}\n\n.container svg {\n    width: 100%;\n    height: auto;\n}\n\ncircle {\n    stroke-width: 3;\n    stroke: black;\n    fill: none;\n}\n\ncircle.center {\n    fill: white;\n}\n\ncircle.major {\n    fill: #eee;\n}\n\ncircle.minor {\n    fill: white;\n}\n\nline.arc {\n    stroke-width: 3;\n    stroke: black;\n}\n\ntext {\n    text-anchor: middle;\n    dominant-baseline: central;\n    font-family: sans-serif;\n    font-size: 34px;\n    font-weight: bold;\n    user-select: none;\n    pointer-events: none;\n}\n\ntext.minor {\n    font-size: 25px;\n    font-weight: bold;\n}\n\ntext.selection {\n    font-size: 34px;\n}\n\n.accidental {\n    font-size: 60%;\n}\n\npath {\n    fill: rgba(255, 255, 255, 0);\n    stroke: none;\n}\n\npath:hover {\n    fill: rgba(0, 200, 255, 0.5);\n}\n\npath:active, path.highlight {\n    fill: rgba(0, 200, 255, 1.0);\n}\n\npath.minor:hover {\n    fill: rgba(255, 165, 0, 0.5);    \n}\n\npath.minor:active, path.minor.highlight {\n    fill: orange  \n}\n\n");

var html$5 = "<div class=\"container\">\n    <svg version=\"1.1\" viewBox=\"-250 -250 500 500\" xmlns=\"http://www.w3.org/2000/svg\">\n    </svg>\n</div>\n";

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
 * Circle of fifths selection component:
 *
 * <circle-of-fifths selected="C major"></circle-of-fifths>
 */
const MAJOR_KEYS = ['C', 'F', 'B♭', 'E♭', 'A♭', 'C♯/D♭', 'F♯/G♭', 'B/C♭', 'E', 'A', 'D', 'G'];
const MINOR_KEYS = ['A', 'D', 'G', 'C', 'F', 'A♯/B♭', 'D♯/E♭', 'A♭/G♯', 'C♯', 'F♯', 'B', 'E'];
const R1 = 250 - 5;
const R2 = 175 - 5;
const R3 = 100 - 5;
class CircleOfFifths extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(sheet$4);
        this.root.innerHTML = html$5;
        this.svg = this.root.querySelector('svg');
    }
    connectedCallback() {
        this._redraw();
    }
    disconnectedCallback() { }
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name, oldValue, newValue) { }
    /**
     * Fire custom events whenever the value is changed by the user
     */
    emitEvent(name, value) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail: { origin: this, value: value
            }
        }));
    }
    _redraw() {
        this.svg.append(this.circle(0, 0, R1, 'major'));
        this.svg.append(this.circle(0, 0, R2, 'minor'));
        let current = this.getAttribute('selected') || '';
        const selection = this.text(0, 0, '', 'selection');
        const arc = Math.PI / 6;
        let theta = Math.PI / -2;
        for (let i = 0; i < 12; i++) {
            const majorKey = MAJOR_KEYS[i];
            const minorKey = MINOR_KEYS[i].split('/')[0];
            const majSelector = this.arc(theta + arc / 2, theta - arc / 2, R1, R2);
            const minSelector = this.arc(theta + arc / 2, theta - arc / 2, R2, R3, 'minor');
            this.svg.append(majSelector);
            this.svg.append(minSelector);
            majSelector.classList.add('selector');
            minSelector.classList.add('selector');
            if ((MAJOR_KEYS[i] + " major") === current)
                majSelector.classList.add('highlight');
            if ((MINOR_KEYS[i] + " minor") === current)
                minSelector.classList.add('highlight');
            majSelector.addEventListener('click', e => {
                current = MAJOR_KEYS[i] + " major";
                this.emitEvent('selected', current);
                this.setAttribute('selected', current);
                this.root.querySelectorAll('.selector').forEach(s => s.classList.remove('highlight'));
                majSelector.classList.add('highlight');
            });
            minSelector.addEventListener('click', e => {
                current = MINOR_KEYS[i] + " minor";
                this.emitEvent('selected', current);
                this.setAttribute('selected', current);
                this.root.querySelectorAll('.selector').forEach(s => s.classList.remove('highlight'));
                minSelector.classList.add('highlight');
            });
            majSelector.addEventListener('pointerenter', e => {
                selection.innerHTML = majorKey.split('/')[0] + " Major";
            });
            majSelector.addEventListener('pointerleave', e => {
                selection.innerHTML = '';
            });
            minSelector.addEventListener('pointerenter', e => {
                selection.innerHTML = minorKey + " minor";
            });
            minSelector.addEventListener('pointerleave', e => {
                selection.innerHTML = '';
            });
            this.svg.append(this.text((R1 - 40) * Math.cos(theta), (R1 - 40) * Math.sin(theta), majorKey, 'major'));
            this.svg.append(this.text((R2 - 40) * Math.cos(theta), (R2 - 40) * Math.sin(theta), minorKey, 'minor'));
            this.svg.append(this.line(0, 0, R1 * Math.cos(theta + arc / 2), R1 * Math.sin(theta + arc / 2), 'arc'));
            theta -= arc;
        }
        this.svg.append(this.circle(0, 0, R3, 'center'));
        this.svg.append(selection);
    }
    circle(cx, cy, r, className) {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        circ.setAttribute('cx', `${cx}`);
        circ.setAttribute('cy', `${cy}`);
        circ.setAttribute('r', `${r}`);
        if (className)
            circ.classList.add(className);
        return circ;
    }
    line(x1, y1, x2, y2, className) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', `${x1}`);
        line.setAttribute('y1', `${y1}`);
        line.setAttribute('x2', `${x2}`);
        line.setAttribute('y2', `${y2}`);
        if (className)
            line.classList.add(className);
        return line;
    }
    text(x, y, s, className) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', `${x}`);
        text.setAttribute('y', `${y}`);
        const lines = s.split('/');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length > 0) {
                text.append(this.tspan(0, i * 20, line.substring(0, 1)));
                text.append(this.tspan(-2, 0, line.substring(1), 'accidental'));
            }
            else {
                text.append(this.tspan(0, i * 20, line));
            }
        }
        if (className)
            text.classList.add(className);
        return text;
    }
    tspan(dx, dy, s, className) {
        const span = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        span.setAttribute('dx', `${dx}`);
        span.setAttribute('dy', `${dy}`);
        span.innerHTML = s;
        if (className)
            span.classList.add(className);
        return span;
    }
    arc(a0, a1, r0, r1, className) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        const segs = [
            'M', r0 * Math.cos(a0), r0 * Math.sin(a0),
            'A', r0, r0, (a1 - a0), 0, 0, r0 * Math.cos(a1), r0 * Math.sin(a1),
            'L', r1 * Math.cos(a1), r1 * Math.sin(a1),
            'A', r1, r1, (a0 - a1), 0, 1, r1 * Math.cos(a0), r1 * Math.sin(a0),
            'Z'
        ];
        path.setAttribute('d', segs.join(' '));
        if (className)
            path.classList.add(className);
        return path;
    }
    _describeArc(r, angle) {
        const sx = r * Math.cos(angle);
        const sy = r * Math.sin(angle);
        const ex = r * Math.cos(0);
        const ey = r * Math.sin(0);
        const large = (angle >= Math.PI) ? 1 : 0;
        return ["M", ex, ey, "A", r, r, 0, large, 1, sx, sy].join(" ");
    }
}
CircleOfFifths.ELEMENT = "circle-of-fifths";
CircleOfFifths.observedAttributes = ["selected"];

const sheet$3 = new CSSStyleSheet();sheet$3.replaceSync("dialog[is=\"pass-phrase\"]::backdrop {\n    background-color: #eee;\n}\n\ndialog[is=\"pass-phrase\"] {\n    width: fit-content;\n    height: 430px;\n    padding: 1em;\n    font-size: 30px;\n    outline: none;\n    border: none;\n    box-shadow: 3px 3px 3px 3px #0003;\n    border-radius: 8px;\n    position: relative;\n}\n\ndialog[is=\"pass-phrase\"] h1 {\n    font-family: sans-serif;\n    margin: 0.5em;\n    font-size: 22px;\n}\n\ndialog[is=\"pass-phrase\"] .digits {\n    text-align: center;\n}\n\ndialog[is=\"pass-phrase\"] .digit {\n    display: inline-block;\n    width: 80px;\n    height: 80px;\n    border-radius: 8px;\n    border: 2px solid rgb(210, 210, 210);\n    margin: 1rem;\n    box-shadow: inset 0px 3px 3px #0001;\n    background-color: #eee;\n    color: #bbb;\n    font-family: sans-serif;\n    font-weight: bold;\n    text-align: center;\n    line-height: 80px;\n    font-size: 200%;\n    user-select: none;\n}\n\ndialog[is=\"pass-phrase\"] .digit:hover {\n    background-color: #aaa;\n    animation: blinky 1s linear infinite;\n}\n\ndialog[is=\"pass-phrase\"] .digit.active {\n    border: 2px solid black;\n    background-color: white;\n    animation: blinky 1s linear infinite;\n    filter: grayscale(85%);\n}\n\ndialog[is=\"pass-phrase\"] .emojis {\n    display: flex;\n    flex-direction: column;\n    margin: 0 auto;\n    border: 1px solid #888;\n    width: fit-content;\n    border-radius: 20px;\n    padding: 10px;\n    box-sizing: border-box;\n    box-shadow: 2px 2px 4px #0003;\n    user-select: none;\n}\n\ndialog[is=\"pass-phrase\"] .row { display: flex; }\n\ndialog[is=\"pass-phrase\"] .emoji {\n    margin: 0 0.5rem 1rem 0.5rem;\n    padding: 0.4rem;\n    font-size: 150%;\n    width: 54px;\n    height: 54px;\n    box-sizing: border-box;\n    transition: font-size 100ms;\n    text-align: center;\n}\ndialog[is=\"pass-phrase\"] .emoji:hover { font-size: 200%; }\n\ndialog[is=\"pass-phrase\"] #success,\ndialog[is=\"pass-phrase\"] #fail {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    text-align: center;\n    background-color: white;\n    line-height: 300px;\n    font-size: 80px;\n    z-index: 100;\n    display: none;\n}\n\ndialog[is=\"pass-phrase\"] .container.success #success { display: block; }\ndialog[is=\"pass-phrase\"] .container.fail #fail { display: block; }\n\n@keyframes blinky {\n  0% {\n    color: transparent;\n  }\n  50% {\n    color: #bbb;\n  }\n  100% {\n    color: transparent;\n  }\n}");

var html$4 = "<h1 class=\"welcome\">Welcome! Please enter your passphrase.</h1>\n<div class=\"container\">\n    <div id=\"success\">✅</div>\n    <div id=\"fail\">❌</div>\n    <div class=\"digits\"></div>\n    <div class=\"emojis\"></div>\n</div>\n";

const sheet$2 = new CSSStyleSheet();sheet$2.replaceSync("* {\n    box-sizing: border-box;\n}\n\n.instrument {\n    display: grid;\n    grid-template-columns: repeat(8, 1fr);\n}\n\n.wrapper {\n    margin: 0 3px 3px 0;\n    color: white;\n    flex: 1;\n    border-radius: 4px;\n    border: 2px solid #fff1;\n    box-shadow: 3px 3px 3px #0002;\n}\n\n.drum-pad {\n    min-width: 58px;\n    height: 72px;\n    text-align: center;\n    border-radius: 1px;\n    background-color: #fff2;\n    display: flex;\n    flex-direction: column;\n    border: 1px solid #fff5;\n    position: relative;\n}\n.drum-pad:hover { \n    background-color: #fff5;\n    border: 1px solid #fff7;\n}\n.drum-pad.pressed {\n    background-color: #fff7;\n    border: 1px solid #fff7;\n}\n.drum-name {\n    color: #fffa;\n    font-weight: bold;\n    text-transform: uppercase;\n    font-size: 10px;\n    user-select: none;\n    flex: 1;\n    align-content: center;\n}\n.drum-pad:hover .drum-name { color: white; }\n\n.pad-name, .key-hint {\n    font-size: 10px;\n    pointer-events: none;\n    user-select: none;\n    position: absolute;\n    bottom: 3px;\n    color: #fff6;\n}\n.pad-name {\n    font-weight: bold;\n    color: #fffd;\n    left: 3px;\n}\n.key-hint { \n    right: 3px;\n    display: none;\n}\n.key-hint.show {\n    display: block;\n}\n\n.wrapper:has(.drum-pad.pressed[data-note=\"0\"]) {\n    background-color: hsl(0 90 50);\n    box-shadow: 0px 0px 5px hsl(0 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"1\"]) {\n    background-color: hsl(22 90 50);\n    box-shadow: 0px 0px 5px hsl(22 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"2\"]) {\n    background-color: hsl(44 90 50);\n    box-shadow: 0px 0px 5px hsl(44 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"3\"]) {\n    background-color: hsl(66 90 50);\n    box-shadow: 0px 0px 5px hsl(66 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"4\"]) {\n    background-color: hsl(88 90 50);\n    box-shadow: 0px 0px 5px hsl(88 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"5\"]) {\n    background-color: hsl(110 90 50);\n    box-shadow: 0px 0px 5px hsl(110 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"6\"]) {\n    background-color: hsl(132 90 50);\n    box-shadow: 0px 0px 5px hsl(132 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"7\"]) {\n    background-color: hsl(154 90 50);\n    box-shadow: 0px 0px 5px hsl(154 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"8\"]) {\n    background-color: hsl(176 90 50);\n    box-shadow: 0px 0px 5px hsl(176 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"9\"]) {\n    background-color: hsl(198 90 50);\n    box-shadow: 0px 0px 5px hsl(198 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"10\"]) {\n    background-color: hsl(220 90 50);\n    box-shadow: 0px 0px 5px hsl(220 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"11\"]) {\n    background-color: hsl(242 90 50);\n    box-shadow: 0px 0px 5px hsl(242 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"12\"]) {\n    background-color: hsl(264 90 50);\n    box-shadow: 0px 0px 5px hsl(264 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"13\"]) {\n    background-color: hsl(286 90 50);\n    box-shadow: 0px 0px 5px hsl(286 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"14\"]) {\n    background-color: hsl(308 90 50);\n    box-shadow: 0px 0px 5px hsl(308 90 50);\n}\n.wrapper:has(.drum-pad.pressed[data-note=\"15\"]) {\n    background-color: hsl(330 90 50);\n    box-shadow: 0px 0px 5px hsl(330 90 50);\n}\n\n@media screen and (max-width: 650px) {\n    .instrument {\n        grid-template-columns: repeat(4, 1fr);\n    }\n}");

var html$3 = "<div class=\"instrument\"></div>\n";

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
        this.root.adoptedStyleSheets.push(sheet$2);
        this.root.innerHTML = html$3;
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
        const nameEl = this.root.querySelector(`.drum-pad[data-note="${note}"] .drum-name`);
        const name = nameEl ? nameEl.innerHTML : '';
        const e = new CustomEvent('note-on', {
            bubbles: true,
            composed: true,
            detail: {
                note: note,
                source: source,
                velocity: velocity,
                drum: name
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
        this.root.querySelectorAll(".key-hint").forEach(e => { e.classList.add("show"); });
    }
    disarmKeyboard() {
        this.armed = false;
        this.setAttribute('armed', 'false');
        this.root.querySelectorAll(".key-hint").forEach(e => { e.classList.remove("show"); });
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

const sheet$1 = new CSSStyleSheet();sheet$1.replaceSync("/*\n@keyframes fade-out {\n    0% {\n        opacity: 1.0;\n    }\n\n    100% {\n        opacity: 0.0;\n    }\n}\n*/\n.instrument {\n    position: relative;\n    box-sizing: border-box;\n    display: flex;\n    background-color: #222;\n    overflow: hidden;\n    flex-direction: column;\n}\n\n.instrument.armed {\n    outline: 1px solid gold;\n}\n\n.naturals, .accidentals {\n    width: 100%;\n    display: flex;\n}\n.accidentals {\n    height: 50px;\n    position: relative;\n    top: 10px;\n    left: -20px;\n}\n.marimba-key, .spacer {\n    border: 2px solid #fff2;\n    flex: 1;\n    margin: 3px;\n    box-sizing: border-box;\n    min-width: 34px;\n}\n\n.marimba-key {\n    background-color: burlywood;\n    background-image: url('/assets/images/marimba-key.png');\n    background-position: center;\n    background-size: cover;\n    border-radius: 0.25rem;\n    display: flex;\n    flex-direction: column;\n    text-align: center;\n    height: 160px;\n    font-size: 12px;\n    padding-top: 20px;\n    color: #fff9;\n    user-select: none;\n    box-shadow: 0 0 6px #000b;\n}\n\n.spacer {\n    pointer-events: none;\n    opacity: 0;\n}\n\n.marimba-key.accidental {\n    height: 70px;\n    padding-top: 10px;\n    position: relative;\n    top: -20px;\n}\n\n.accidental .note-name { display: none; }\n\n.marimba-key:hover {\n    border: 2px solid #fff7;\n    color: white;\n}\n\n.marimba-key.pressed {\n    border: 2px solid white;\n}\n/*\n.marimba-key.white.pressed.step-0 { fill: rgb(229, 76, 78); }\n.marimba-key.white.pressed.step-2 { fill: rgb(228, 171, 81); }\n.marimba-key.white.pressed.step-4 { fill: rgb(223, 228, 78); }\n.marimba-key.white.pressed.step-5 { fill: rgb(174, 215, 71); }\n.marimba-key.white.pressed.step-7 { fill: rgb(63, 169, 180); }\n.marimba-key.white.pressed.step-9 { fill: rgb(78, 69, 179); }\n.marimba-key.white.pressed.step-11 { fill: rgb(202, 69, 147); }\n*/\n\n.note-name { flex: 1; }\n.key-hint { margin-bottom: 1rem; display: none; }\n.armed .key-hint { display: block; }\n");

var html$2 = "<div class=\"instrument\"></div>";

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
        this.root.adoptedStyleSheets.push(sheet$1);
        this.root.innerHTML = html$2;
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

const sheet = new CSSStyleSheet();sheet.replaceSync("/*\n@keyframes fade-out {\n    0% {\n        opacity: 1.0;\n    }\n\n    100% {\n        opacity: 0.0;\n    }\n}\n*/\n.wrapper {\n    display: flex;\n}\n\n.instrument {\n    flex: 1;\n    position: relative;\n    box-sizing: border-box;\n    display: flex;\n}\n.instrument:focus-within {\n    outline: 2px solid gold;\n}\n\n.backdrop {\n    fill: #30303f;\n}\n\n.container {\n    width: 100%;\n}\n\n.piano-key.black {\n    fill: #1d1e1f;\n    stroke: #222;\n    stroke-width: 1.5;\n    rx: 1.5;\n}\n\n.piano-key.black .black-top {\n    fill: #444;\n}\n\n.piano-key.black:hover .black-top {\n    fill: #777;\n}\n\n.piano-key.black.pressed .black-top {\n    fill: #222;\n}\n\n.piano-key.white {\n    fill: #ecedee;\n    stroke: #f7f7f8;\n    stroke-width: 1.5;\n    rx: 1.4;\n}\n\n.piano-key.white:hover {\n    fill: #ccc;\n}\n\n.piano-key.white.pressed {\n    fill: #aaa;\n    stroke: #777;\n}\n/*\n.piano-key.white.pressed.step-0 { fill: rgb(229, 76, 78); }\n.piano-key.white.pressed.step-2 { fill: rgb(228, 171, 81); }\n.piano-key.white.pressed.step-4 { fill: rgb(223, 228, 78); }\n.piano-key.white.pressed.step-5 { fill: rgb(174, 215, 71); }\n.piano-key.white.pressed.step-7 { fill: rgb(63, 169, 180); }\n.piano-key.white.pressed.step-9 { fill: rgb(78, 69, 179); }\n.piano-key.white.pressed.step-11 { fill: rgb(202, 69, 147); }\n*/\n.note-hint,\n.midi-hint,\n.key-hint {\n    stroke: none;\n    font: 9pt sans-serif;\n    fill: #0006;\n    text-anchor: middle;\n    opacity: 0.0;\n    pointer-events: none;\n    user-select: none;\n}\n\n.midi-hint.black, .note-hint.black, .key-hint.black {\n    fill: #ccc;\n}\n.show {\n    opacity: 1.0;\n}\n\n.note-hint.always-show {\n    opacity: 1.0;\n}\n\n.felt {\n    fill: #a00;\n    fill: #0009;\n}\n\n.animated-slide {\n    transition: transform 0.5s ease-in-out;\n}\n\n.mini-piano {\n    opacity: 0.0;\n    transition: opacity 0.25s;\n}\n\n.mini-piano.show {\n    opacity: 1.0;\n}\n\n.octave-button {\n    background-color: transparent;\n    border: none;\n    outline: none;\n    color: #fffa;\n    font-size: 20px;\n    user-select: none;\n    width: 15px;\n    padding: 0;\n    min-height: 100%;\n}\n.octave-button:hover { color: white; }\n.octave-button:active { color: rgb(121, 216, 245); }\n");

var html$1 = "<div class=\"wrapper\">\n    <button id=\"down-octave\" class=\"octave-button\" title=\"Lower Octave\" part=\"octave-down\">❮</button>\n    <div class=\"instrument\"><svg class=\"container\" version=\"1.1\"></svg></div>\n    <button id=\"up-octave\" class=\"octave-button\" title=\"Higher Octave\" part=\"octave-up\">❯</button>\n</div>";

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
            keyRange: 21,
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
        this.root.adoptedStyleSheets.push(sheet);
        //this.mini = MiniPiano(this);
    }
    connectedCallback() {
        const template = document.createElement('template');
        template.innerHTML = html$1;
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
        this._hint_offsets = [-8, 0, 0, 0, 8, -8, 0, 0, 0, 0, 0, 8];
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
 * Passphrase authenticator using emoji selections. Extends HTML dialog element
 * ```html
 * <dialog is="pass-phrase" digits="5" auth_token="fe9a3" username="blueberry"></dialog>
 * ```
 * Javascript will need to call passphrase.openModal();
 */
const EMOJIS = [
    '😀', '🦕', '🤩', '🥶', '🐷', '🐶', '🌹', '🌎',
    '😈', '🔥', '👽', '🤖', '🦊', '🐼', '🌻', '☃️'
];
class Passphrase extends HTMLDialogElement {
    constructor() {
        super();
        this.innerHTML = html$4;
        document.adoptedStyleSheets.push(sheet$3);
    }
    connectedCallback() {
        this.render();
    }
    disconnectedCallback() { }
    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name, oldValue, newValue) { }
    render() {
        const digits = toInt(this.getAttribute('digits'), 5);
        this.querySelector('h1.welcome');
        //message.innerHTML = message.innerHTML.replace('{{username}}', this.getAttribute('username') || 'back');
        const container = this.querySelector('.digits');
        container.innerHTML = '';
        for (let i = 0; i < digits; i++) {
            const digit = document.createElement('div');
            digit.classList.add('digit');
            digit.setAttribute('tabindex', `${i}`);
            digit.addEventListener('click', e => { this.setFocus(i); });
            digit.innerHTML = '?';
            container.append(digit);
            if (i === 0)
                digit.classList.add('active');
        }
        const emojis = this.querySelector('.emojis');
        let row = document.createElement('div');
        row.classList.add('row');
        for (let i = 0; i < 16; i++) {
            const emoji = document.createElement('div');
            emoji.classList.add('emoji');
            emoji.addEventListener('pointerenter', e => {
                this.setHTML('.digit.active', EMOJIS[i]);
            });
            emoji.addEventListener('pointerleave', e => {
                this.setHTML('.digit.active', '?');
            });
            emoji.addEventListener('click', e => {
                this.setHTML('.digit.active', EMOJIS[i]);
                this.advanceFocus();
            });
            emoji.innerHTML = EMOJIS[i];
            row.append(emoji);
            if (i === 7 || i === 15)
                emojis.append(row);
            if (i === 7) {
                row = document.createElement('div');
                row.classList.add('row');
            }
        }
    }
    reset() {
        this.querySelectorAll('.digit').forEach(d => d.innerHTML = '?');
        this.setFocus(0);
    }
    async advanceFocus() {
        const digits = this.querySelectorAll('.digit').length;
        const el = this.querySelector('.digit.active');
        const index = toInt(el?.getAttribute('tabindex'), 0);
        if (this.isComplete()) {
            const success = await this.success();
            if (success) {
                this.emitEvent('passed', 'true');
                this.querySelector('.container')?.classList.add('success');
            }
            else {
                this.emitEvent('passed', 'false');
                this.querySelector('.container')?.classList.add('fail');
            }
            setTimeout(() => {
                this.querySelector('.container')?.classList.remove('success', 'fail');
                this.reset();
                if (success)
                    this.close();
            }, 700);
        }
        (index + 1 >= digits) ? this.setFocus(0) : this.setFocus(index + 1);
    }
    setFocus(index) {
        this.querySelectorAll('.digit').forEach(d => { d.classList.remove('active'); });
        const el = this.querySelector(`.digit[tabindex="${index}"]`);
        el?.classList.add('active');
        if (el)
            el.innerHTML = '?';
    }
    setHTML(selector, content) {
        const el = this.querySelector(selector);
        if (el)
            el.innerHTML = content;
    }
    isComplete() {
        let complete = true;
        this.querySelectorAll('.digit').forEach(d => {
            if (d.innerHTML === '?') {
                complete = false;
                return;
            }
        });
        return complete;
    }
    async success() {
        let code = '';
        this.querySelectorAll('.digit').forEach(el => {
            const emoji = el.innerHTML;
            let digit = EMOJIS.indexOf(emoji);
            code += digit.toString(16);
        });
        return (code === this.getAttribute('auth_token'));
    }
    /**
     * Fire custom events whenever the value is changed by the user
     */
    emitEvent(name, value) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail: { origin: this, value: value }
        }));
    }
}
Passphrase.ELEMENT = "pass-phrase";
Passphrase.observedAttributes = ["auth_token", "username", "digits"];

var html = "<div class=\"icon\"></div>";

var iconAutocompile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M95.87,199.35c8.17-23.14,21.44-44.9,40.13-63.48,66.35-66.35,173.88-66.35,240.23,0l18.15,18.26h-36.41c-18.79,0-33.97,15.18-33.97,33.97s15.18,33.97,33.97,33.97h118.79c18.79,0,33.97-15.18,33.97-33.97v-118.89c0-18.79-15.18-33.97-33.97-33.97s-33.97,15.18-33.97,33.97v37.37l-18.58-18.68C331.32-4.99,180.79-4.99,87.91,87.89c-25.9,25.9-44.58,56.37-56.05,88.96-6.26,17.73,3.08,37.05,20.7,43.31,17.62,6.26,37.05-3.08,43.31-20.7v-.11ZM25.7,291.39c-5.31,1.59-10.4,4.46-14.54,8.7-4.25,4.25-7.11,9.34-8.6,14.86-.32,1.27-.64,2.65-.85,4.03-.32,1.8-.42,3.61-.42,5.41v118.47c0,18.79,15.18,33.97,33.97,33.97s33.97-15.18,33.97-33.97v-37.26l18.68,18.58h0c92.88,92.78,243.41,92.78,336.19,0,25.9-25.9,44.69-56.37,56.16-88.85,6.26-17.73-3.08-37.05-20.7-43.31-17.62-6.26-37.05,3.08-43.31,20.7-8.17,23.14-21.44,44.9-40.13,63.48-66.35,66.35-173.88,66.35-240.23,0l-.11-.11-18.15-18.15h36.52c18.79,0,33.97-15.18,33.97-33.97s-15.18-33.97-33.97-33.97H35.68c-1.7,0-3.4.11-5.1.32s-3.29.53-4.88,1.06Z\"/>\n  <circle cx=\"256\" cy=\"256\" r=\"68.18\"/>\n</svg>";

var iconCopy = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <path d=\"M409.86,329.93h-177.43c-8.13,0-14.79-6.65-14.79-14.79V78.57c0-8.13,6.65-14.79,14.79-14.79h129.47l62.75,62.75v188.61c0,8.13-6.65,14.79-14.79,14.79ZM232.43,374.29h177.43c32.62,0,59.14-26.52,59.14-59.14V126.53c0-11.74-4.71-23.01-13.03-31.33l-62.65-62.75c-8.32-8.32-19.59-13.03-31.33-13.03h-129.56c-32.62,0-59.14,26.52-59.14,59.14v236.57c0,32.62,26.52,59.14,59.14,59.14ZM114.14,137.71c-32.62,0-59.14,26.52-59.14,59.14v236.57c0,32.62,26.52,59.14,59.14,59.14h177.43c32.62,0,59.14-26.52,59.14-59.14v-29.57h-44.36v29.57c0,8.13-6.65,14.79-14.79,14.79H114.14c-8.13,0-14.79-6.65-14.79-14.79v-236.57c0-8.13,6.65-14.79,14.79-14.79h29.57v-44.36h-29.57Z\"/>\n</svg>";

var iconCrossCircle = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->\n    <path d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z\"/>\n</svg>";

var iconError = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n    <circle cx=\"256\" cy=\"256\" r=\"250\" fill=\"white\"/>\n    <path d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z\"/>\n</svg>";

var iconGear = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n    <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->\n    <path d=\"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z\"/>\n</svg>";

var iconHistory = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 24 24\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M10.5,17c-.7,0-1.29-.24-1.78-.73s-.73-1.08-.73-1.78.24-1.29.73-1.78,1.08-.73,1.78-.73c.28,0,.55.04.8.13s.48.21.7.38v-5.5h4v2h-3v5.5c0,.7-.24,1.29-.73,1.78s-1.08.73-1.78.73ZM12,22c-1.38,0-2.68-.26-3.9-.79s-2.28-1.24-3.18-2.14-1.61-1.96-2.14-3.18-.79-2.52-.79-3.9h2c0,1.1.21,2.14.63,3.11s.99,1.83,1.71,2.55,1.58,1.3,2.55,1.73,2.01.64,3.11.64c2.23,0,4.13-.78,5.68-2.33s2.33-3.44,2.33-5.68-.78-4.13-2.33-5.68-3.44-2.33-5.68-2.33c-1.48,0-2.83.36-4.04,1.09s-2.16,1.69-2.86,2.89h2.9v2H2V4h2v2c.92-1.22,2.07-2.19,3.45-2.91,1.38-.73,2.9-1.09,4.55-1.09,1.38,0,2.68.26,3.9.79s2.28,1.24,3.18,2.14,1.61,1.96,2.14,3.18.79,2.52.79,3.9-.26,2.68-.79,3.9-1.24,2.28-2.14,3.18-1.96,1.61-3.18,2.14-2.52.79-3.9.79Z\"/>\n</svg>";

var iconInsert = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d=\"M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z\"/></svg>";

var iconLock = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <path d=\"M180.11,149.75v45.54h151.79v-45.54c0-41.93-33.96-75.89-75.89-75.89s-75.89,33.96-75.89,75.89ZM119.39,195.29v-45.54c0-75.42,61.19-136.61,136.61-136.61s136.61,61.19,136.61,136.61v45.54h15.18c33.49,0,60.71,27.23,60.71,60.71v182.14c0,33.49-27.23,60.71-60.71,60.71H104.21c-33.49,0-60.71-27.23-60.71-60.71v-182.14c0-33.49,27.23-60.71,60.71-60.71h15.18Z\"/>\n</svg>";

var iconMidiRoll = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <path d=\"M412,223\"/>\n  <rect y=\"8\" width=\"510.85\" height=\"68.04\"/>\n  <rect y=\"150.42\" width=\"398.17\" height=\"68.04\"/>\n  <rect x=\"212.7\" y=\"292.84\" width=\"298.15\" height=\"68.04\"/>\n  <rect y=\"435.26\" width=\"510.85\" height=\"68.04\"/>\n</svg>";

var iconMinus = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M502,256c0,21.06-17.02,38.08-38.08,38.08H45.08c-21.06,0-38.08-17.02-38.08-38.08s17.02-38.08,38.08-38.08h418.85c21.06,0,38.08,17.02,38.08,38.08Z\"/>\n</svg>";

var iconMusic = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->\n    <path d=\"M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7v72V368c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V147L192 223.8V432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6V200 128c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z\"/>\n</svg>";

var iconPause = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M106.67,0C71.33,0,42.67,28.67,42.67,64v384c0,35.33,28.67,64,64,64h42.67c35.33,0,64-28.67,64-64V64C213.33,28.67,184.67,0,149.33,0h-42.67ZM362.67,0c-35.33,0-64,28.67-64,64v384c0,35.33,28.67,64,64,64h42.67c35.33,0,64-28.67,64-64V64c0-35.33-28.67-64-64-64h-42.67Z\"/>\n</svg>";

var iconPiano = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"svg2\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:cc=\"http://creativecommons.org/ns#\" version=\"1.1\" viewBox=\"0 0 100 100\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <defs>\n    <style>\n      .st0 {\n        fill: #fff;\n      }\n\n      .st1 {\n        display: none;\n      }\n    </style>\n  </defs>\n  <sodipodi:namedview id=\"namedview12\" bordercolor=\"#666666\" borderopacity=\"1\" gridtolerance=\"10\" guidetolerance=\"10\" inkscape:current-layer=\"svg2\" inkscape:cx=\"57.141381\" inkscape:cy=\"50\" inkscape:pageopacity=\"0\" inkscape:pageshadow=\"2\" inkscape:window-height=\"480\" inkscape:window-maximized=\"0\" inkscape:window-width=\"770\" inkscape:window-x=\"43\" inkscape:window-y=\"1\" inkscape:zoom=\"2.6457812\" objecttolerance=\"10\" pagecolor=\"#ffffff\" showgrid=\"false\"/>\n  <g id=\"g4\" class=\"st1\">\n    <rect id=\"rect6\" x=\"-728\" y=\"-227\" width=\"1158\" height=\"397\"/>\n  </g>\n  <path id=\"path4506\" class=\"st0\" d=\"M93.4,94h0V5.55h-18.43v52.87h-7.16v35.59h25.59ZM64.64,94v-35.59h-8.29V5.55h-11.23v52.87h-7.2v35.59h26.73ZM34.78,94h0v-35.59h-8.29V5.55H8.06v88.45h26.72Z\" inkscape:connector-curvature=\"0\" sodipodi:nodetypes=\"ccccccccccccccccccccccccc\"/>\n</svg>";

var iconPlay = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M120.02,8.06c-16.91-10.4-38.16-10.74-55.42-1.03-17.25,9.71-28,28-28,47.88v402.21c0,19.88,10.74,38.16,28,47.88s38.51,9.26,55.42-1.03l329.08-201.11c16.34-9.94,26.28-27.65,26.28-46.85s-9.94-36.79-26.28-46.85L120.02,8.06Z\"/>\n</svg>";

var iconPlus = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M463.92,217.92h-175.85V46.58c0-21.06-17.02-38.08-38.08-38.08s-38.08,17.02-38.08,38.08v171.35H45.08c-21.06,0-38.08,17.02-38.08,38.08s17.02,38.08,38.08,38.08h166.85v171.35c0,21.06,17.02,38.08,38.08,38.08s38.08-17.02,38.08-38.08v-171.35h175.85c21.06,0,38.08-17.02,38.08-38.08s-17.02-38.08-38.08-38.08Z\"/>\n</svg>";

var iconRecompile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <path d=\"M95.87,199.35c8.17-23.14,21.44-44.9,40.13-63.48,66.35-66.35,173.88-66.35,240.23,0l18.15,18.26h-36.41c-18.79,0-33.97,15.18-33.97,33.97s15.18,33.97,33.97,33.97h118.79c18.79,0,33.97-15.18,33.97-33.97v-118.89c0-18.79-15.18-33.97-33.97-33.97s-33.97,15.18-33.97,33.97v37.37l-18.58-18.68C331.32-4.99,180.79-4.99,87.91,87.89c-25.9,25.9-44.58,56.37-56.05,88.96-6.26,17.73,3.08,37.05,20.7,43.31,17.62,6.26,37.05-3.08,43.31-20.7v-.11ZM25.7,291.39c-5.31,1.59-10.4,4.46-14.54,8.7-4.25,4.25-7.11,9.34-8.6,14.86-.32,1.27-.64,2.65-.85,4.03-.32,1.8-.42,3.61-.42,5.41v118.47c0,18.79,15.18,33.97,33.97,33.97s33.97-15.18,33.97-33.97v-37.26l18.68,18.58h0c92.88,92.78,243.41,92.78,336.19,0,25.9-25.9,44.69-56.37,56.16-88.85,6.26-17.73-3.08-37.05-20.7-43.31-17.62-6.26-37.05,3.08-43.31,20.7-8.17,23.14-21.44,44.9-40.13,63.48-66.35,66.35-173.88,66.35-240.23,0l-.11-.11-18.15-18.15h36.52c18.79,0,33.97-15.18,33.97-33.97s-15.18-33.97-33.97-33.97H35.68c-1.7,0-3.4.11-5.1.32s-3.29.53-4.88,1.06Z\"/>\n</svg>";

var iconStop = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.6.1, SVG Export Plug-In . SVG Version: 2.1.1 Build 9)  -->\n  <rect x=\"13.82\" y=\"13.82\" width=\"484.36\" height=\"484.36\" rx=\"29.9\" ry=\"29.9\"/>\n</svg>";

var iconTrash = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <path d=\"M174.93,38.44l-6.57,13.06h-87.64c-16.16,0-29.21,13.06-29.21,29.21s13.06,29.21,29.21,29.21h350.57c16.16,0,29.21-13.06,29.21-29.21s-13.06-29.21-29.21-29.21h-87.64l-6.57-13.06c-4.93-9.95-15.06-16.16-26.11-16.16h-109.92c-11.05,0-21.18,6.21-26.11,16.16ZM431.29,139.14H80.71l19.35,309.49c1.46,23.1,20.63,41.08,43.73,41.08h224.4c23.1,0,42.27-17.99,43.73-41.08l19.35-309.49Z\"/>\n</svg>";

var iconWaveform = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0 0 512 512\">\n  <!-- Generator: Adobe Illustrator 29.5.1, SVG Export Plug-In . SVG Version: 2.1.0 Build 141)  -->\n  <path d=\"M412,219\"/>\n  <path d=\"M496.28,249.3h-97.77l-23-73.41c-2.2-8.17-10-13.78-18.55-13.46-8.64.29-15.93,6.4-17.54,14.7l-37.82,194.58L261.7,16.11c-1.02-9.07-8.79-15.97-18.14-16.11h-.28c-9.22,0-17.06,6.64-18.33,15.59l-37.32,261.48-17.26-149.22c-1.02-8.82-8.43-15.61-17.5-16.04-9.08-.35-17.13,5.63-19,14.3l-23.72,109-4.56-25.33c-1.4-7.84-7.91-13.87-16-14.82-8.06-.92-15.88,3.37-19.17,10.65l-21.12,46.71h-30.78c-10.22,0-18.51,8.1-18.51,18.08s8.29,18.08,18.51,18.08h42.83c7.34,0,13.97-4.23,16.94-10.78l1.37-3.04,10.53,58.48c1.54,8.53,9.05,14.8,17.91,14.95,8.79.36,16.6-5.84,18.44-14.31l19.84-91.16,20.93,180.97c1.04,9.06,8.84,15.93,18.15,16.05,9.24.12,17.29-6.56,18.58-15.59l37.06-259.57,37.17,331.43c1,8.9,8.52,15.76,17.68,16.11h.74c8.85,0,16.51-6.15,18.18-14.72l44.69-229.88v.86c0,8.5,7.05,15.37,15.74,15.37h120.98c8.7,0,15.74-6.89,15.74-15.37v-3.6c0-8.5-7.05-15.37-15.74-15.37h.02Z\"/>\n</svg>";

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
class TunePadIcon extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = html;
        this.div = this.querySelector('div.icon');
    }
    connectedCallback() { }
    disconnectedCallback() { }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'icon' && newValue != oldValue) {
            switch (newValue) {
                case 'autocompile':
                    this.div.innerHTML = iconAutocompile;
                    break;
                case 'checkmark':
                    this.div.innerHTML = iconCheck;
                    break;
                case 'copy':
                    this.div.innerHTML = iconCopy;
                    break;
                case 'cross-circle':
                    this.div.innerHTML = iconCrossCircle;
                    break;
                case 'error':
                    this.div.innerHTML = iconError;
                    break;
                case 'gear':
                    this.div.innerHTML = iconGear;
                    break;
                case 'history':
                    this.div.innerHTML = iconHistory;
                    break;
                case 'insert':
                    this.div.innerHTML = iconInsert;
                    break;
                case 'lock':
                    this.div.innerHTML = iconLock;
                    break;
                case 'midi':
                    this.div.innerHTML = iconMidiRoll;
                    break;
                case 'midiroll':
                    this.div.innerHTML = iconMidiRoll;
                    break;
                case 'minus':
                    this.div.innerHTML = iconMinus;
                    break;
                case 'music':
                    this.div.innerHTML = iconMusic;
                    break;
                case 'pause':
                    this.div.innerHTML = iconPause;
                    break;
                case 'piano':
                    this.div.innerHTML = iconPiano;
                    break;
                case 'play':
                    this.div.innerHTML = iconPlay;
                    break;
                case 'plus':
                    this.div.innerHTML = iconPlus;
                    break;
                case 'recompile':
                    this.div.innerHTML = iconRecompile;
                    break;
                case 'score':
                    this.div.innerHTML = iconMusic;
                    break;
                case 'stop':
                    this.div.innerHTML = iconStop;
                    break;
                case 'trash':
                    this.div.innerHTML = iconTrash;
                    break;
                case 'waveform':
                    this.div.innerHTML = iconWaveform;
                    break;
                default: this.div.innerHTML = '';
            }
            const svg = this.div.querySelector('svg');
            if (svg)
                svg.style.width = '100%';
        }
    }
}
TunePadIcon.observedAttributes = ["icon"];
TunePadIcon.ELEMENT = "tunepad-icon";

customElements.define(Dial.ELEMENT, Dial);

export { CircleOfFifths, ContextMenu, ContextMenuItem, ContextMenuStyles, Dial, DrumPad, Marimba, Passphrase, Piano, TunePadIcon, toInt, toNum };
//# sourceMappingURL=index.js.map
