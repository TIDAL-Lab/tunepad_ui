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
import styles from './dial.module.css' with {type: 'css'};
import html from './dial.module.html';

export class Dial extends HTMLElement {

    static readonly ELEMENT = "range-dial";

    static observedAttributes = [
        'min',
        'max',
        'value'
    ];

    // all of the HTML elements for the instrument are contained within a shadow DOM
    private root : ShadowRoot;

    // minimum angle of the dial
    private readonly minAngle = 0.0;

    // maximum angle of the dial
    private readonly maxAngle = Math.PI * 1.5;

    // minimum possible value of the dial
    private minValue = 0.0;

    // maximum possible value of the dial
    private maxValue = 1.0;

    // current value between [ 0.0, 1.0 ]
    private _value = 0.0;

    /** current value between [ min, max ] */
    public get value() {
        const range = this.maxValue - this.minValue;
        return this.minValue + this._value * range;
    }

    /** set the value of the dial (clamped between min and max) */
    public set value(v : number) {
        const range = this.maxValue - this.minValue;
        v = Math.min(this.maxValue, Math.max(this.minValue, v));
        this._value = (v - this.minValue) / range;
        this._redraw();
    }

    // SVG elements that we need access to
    private ring : SVGCircleElement;
    private line : SVGLineElement;
    private arc : SVGPathElement;
    private container : HTMLElement;

    // which direction is the dial pointing (radians)?
    private get angle() {
        const sweep = this.maxAngle - this.minAngle;
        return this._value * sweep + this.minAngle;
    }


    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
        this.container = this.root.querySelector('#container') as HTMLElement;
        this.ring = this.root.querySelector('#ring') as SVGCircleElement;
        this.line = this.root.querySelector('#pointer') as SVGLineElement;
        this.arc = this.root.querySelector('#arc') as SVGPathElement;
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
    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        if (name === 'min') {
            this.minValue = parseFloat(newValue);
        } else if (name === 'max') {
            this.maxValue = parseFloat(newValue);
        } else if (name === 'value') {
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
    private _startVal = 0.0;


    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent(name : string) {
        this.dispatchEvent(
            new CustomEvent(name, { 
                bubbles: true,
                composed: true,
                detail: {
                    origin : this,
                    value : this.value
                }
            })
        );
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

    _describeArc(r : number) {
        const sx = r * Math.cos(this.angle);
        const sy = r * Math.sin(this.angle);
        const ex = r * Math.cos(0);
        const ey = r * Math.sin(0);
        const large = (this.angle >= Math.PI) ? 1 : 0;
    
        return ["M", ex, ey, "A", r, r, 0, large, 1, sx, sy].join(" ");
      }
}
