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
import styles from './fifths.module.css' with {type: 'css'};
import html from './fifths.module.html';

/**
 * Circle of fifths selection component:
 * 
 * <circle-of-fifths selected="C major"></circle-of-fifths>
 */

const MAJOR_KEYS = [ 'C', 'F', 'B♭', 'E♭', 'A♭', 'C♯/D♭', 'F♯/G♭', 'B/C♭',  'E',  'A',  'D', 'G' ];
const MINOR_KEYS = [ 'A', 'D', 'G',  'C',  'F',  'A♯/B♭', 'D♯/E♭', 'A♭/G♯', 'C♯', 'F♯', 'B', 'E' ];

const R1 = 250 - 5;
const R2 = 175 - 5;
const R3 = 100 - 5;

export class CircleOfFifths extends HTMLElement {

    static readonly ELEMENT = "circle-of-fifths";

    static observedAttributes = [ "selected" ];

    // all of the HTML elements for the instrument are contained within a shadow DOM
    private root : ShadowRoot;

    private svg : SVGSVGElement;


    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
        this.svg = this.root.querySelector('svg') as SVGSVGElement;
    }

    connectedCallback() {
        this._redraw();
    }

    disconnectedCallback() { }

    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name : string, oldValue : string, newValue : string) { }

    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent(name : string, value : string) {
        this.dispatchEvent(
            new CustomEvent(name, { 
                bubbles: true,
                composed: true,
                detail: { origin : this,value : value
                }
            })
        );
    }

    _redraw() {
        this.svg.append(this.circle(0, 0, R1, 'major'));
        this.svg.append(this.circle(0, 0, R2, 'minor'));
        let current = this.getAttribute('selected') || '';
        const selection = this.text(0, 0, '', 'selection');
        const arc = Math.PI / 6;
        let theta = Math.PI / -2;
        for (let i=0; i<12; i++) {
            const majorKey = MAJOR_KEYS[i];
            const minorKey = MINOR_KEYS[i].split('/')[0];

            const majSelector = this.arc(theta + arc/2, theta - arc/2, R1, R2);
            const minSelector = this.arc(theta + arc/2, theta - arc/2, R2, R3, 'minor');
            this.svg.append(majSelector);
            this.svg.append(minSelector);
            majSelector.classList.add('selector');
            minSelector.classList.add('selector');
            if ((MAJOR_KEYS[i] + " major") === current) majSelector.classList.add('highlight');
            if ((MINOR_KEYS[i] + " minor") === current) minSelector.classList.add('highlight');

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

            this.svg.append(
                this.text(
                    (R1 - 40) * Math.cos(theta),
                    (R1 - 40) * Math.sin(theta),
                    majorKey, 'major'));
            this.svg.append(
                this.text(
                    (R2 - 40) * Math.cos(theta),
                    (R2 - 40) * Math.sin(theta),
                    minorKey, 'minor'));
            this.svg.append(this.line(0, 0, R1 * Math.cos(theta + arc/2), R1 * Math.sin(theta + arc/2), 'arc'));
            theta -= arc;
        }
        this.svg.append(this.circle(0, 0, R3, 'center'));
        this.svg.append(selection);
    }

    circle(cx : number, cy : number, r : number, className? : string) : SVGCircleElement {
        const circ = document.createElementNS("http://www.w3.org/2000/svg", 'circle')
        circ.setAttribute('cx', `${cx}`);
        circ.setAttribute('cy', `${cy}`);
        circ.setAttribute('r', `${r}`);
        if (className) circ.classList.add(className);
        return circ;
    }

    line(x1 : number, y1 : number, x2 : number, y2 : number, className? : string) : SVGLineElement {
        const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', `${x1}`);
        line.setAttribute('y1', `${y1}`);
        line.setAttribute('x2', `${x2}`);
        line.setAttribute('y2', `${y2}`);
        if (className) line.classList.add(className);
        return line;
    }

    text(x : number, y : number, s : string, className? : string) : SVGTextElement {
        const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', `${x}`);
        text.setAttribute('y', `${y}`);
        const lines = s.split('/');
        for (let i=0; i<lines.length; i++) {
            const line = lines[i];
            if (line.length > 0) {
                text.append(this.tspan(0, i * 20, line.substring(0, 1)));
                text.append(this.tspan(-2, 0, line.substring(1), 'accidental'));
            } else {
                text.append(this.tspan(0, i * 20, line));
            }
        }
        if (className) text.classList.add(className);
        return text;
    }

    tspan(dx : number, dy : number, s : string, className ? : string) : SVGTSpanElement {
        const span = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
        span.setAttribute('dx', `${dx}`);
        span.setAttribute('dy', `${dy}`);
        span.innerHTML = s;
        if (className) span.classList.add(className);
        return span;
    }

    arc(a0 : number, a1 : number, r0 : number, r1 : number, className ? : string) : SVGPathElement {
        const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        const segs = [
            'M', r0 * Math.cos(a0), r0 * Math.sin(a0),
            'A', r0, r0, (a1 - a0), 0, 0, r0 * Math.cos(a1), r0 * Math.sin(a1),
            'L', r1 * Math.cos(a1), r1 * Math.sin(a1),
            'A', r1, r1, (a0 - a1), 0, 1, r1 * Math.cos(a0), r1 * Math.sin(a0),
            'Z'
        ];
        path.setAttribute('d', segs.join(' '));
        if (className) path.classList.add(className);
        return path;
    }

    _describeArc(r : number, angle : number) {
        const sx = r * Math.cos(angle);
        const sy = r * Math.sin(angle);
        const ex = r * Math.cos(0);
        const ey = r * Math.sin(0);
        const large = (angle >= Math.PI) ? 1 : 0;
    
        return ["M", ex, ey, "A", r, r, 0, large, 1, sx, sy].join(" ");
      }
}
