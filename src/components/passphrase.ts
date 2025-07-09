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
import styles from './passphrase.module.css' with {type: 'css'};
import html from './passphrase.module.html';

import { toInt } from '../instruments';

/**
 * Passphrase authenticator using emoji selections. Extends HTML dialog element
 * ```html
 * <pass-phrase hash="xyz" digits="5"></pass-phrase>
 * ```
 * Javascript will need to call passphrase.openModal();
 */
const EMOJIS = [ 
    '😀','🦕','🤩','🥶','🐷','🐶','🌹','🌎',
    '😈','🔥','👽','🤖','🦊','🐼','🌻','☃️'
];

const OTHERS = [
    '😂','😇','😉','🤪','🥸',,'☹️','😡','🤯',
    '😱','🙄','😵‍💫','🤠','😺',
    '🧠','👋','✌️','🕶','🐨','🐯','🦁',
    ,'🐔','🐴','🦄','🐝','🦋','🐢','🧐','🐙',
    '🦀','🐋','🦓','🦧','🐓','🪐',
    '🌈','☁️','👍','👊','🙃','😍','😛','🥹','😅',
    '😫','🥺',
];

export class Passphrase extends HTMLDialogElement {

    static readonly ELEMENT = "pass-phrase";

    static observedAttributes = [ "phrase", "digits" ];

    private readonly ROWS = 5;
    private readonly COLS = 5;

    private digits = 5;


    constructor() {
        super();
        this.innerHTML = html;
        document.adoptedStyleSheets.push(styles);
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() { }

    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
        if (name === 'digits') {
            this.digits = toInt(newValue, this.digits);
        }
    }


    private render() {
        const container = this.querySelector('.digits')!;
        container.innerHTML = '';
        for (let i=0; i<this.digits; i++) {
            const digit = document.createElement('div');
            digit.classList.add('digit');
            digit.setAttribute('tabindex', `${i}`);
            digit.addEventListener('click', e => { this.setFocus(i) });
            digit.innerHTML = '?';
            container.append(digit);
            if (i === 0) digit.classList.add('active');
        }

        const emojis = this.querySelector('.emojis')!;
        let row = document.createElement('div');
        row.classList.add('row');
        for (let i=0; i<16; i++) {
            const emoji = document.createElement('div');
            emoji.classList.add('emoji');
            emoji.addEventListener('pointerenter', e => {
                this.setHTML('.digit.active', EMOJIS[i]);
            });
            emoji.addEventListener('pointerleave', e => { 
                this.setHTML('.digit.active', '?')
            });
            emoji.addEventListener('click', e => {
                this.setHTML('.digit.active', EMOJIS[i]);
                this.advanceFocus();
            });
            emoji.innerHTML = EMOJIS[i];
            row.append(emoji);
            if (i === 7 || i === 15) emojis.append(row);
            if (i === 7) {
                row = document.createElement('div');
                row.classList.add('row');
            }
        }
    }

    private reset() {
        this.querySelectorAll('.digit').forEach(d => d.innerHTML = '?');
        this.setFocus(0);
    }

    private async advanceFocus() {
        const el = this.querySelector('.digit.active');
        const index = toInt(el?.getAttribute('tabindex'), 0);
        if (this.isComplete()) {
            const success = await this.success();
            if (success) {
                this.emitEvent('passed', 'true');
                this.querySelector('.container')?.classList.add('success');
            } else {
                this.emitEvent('passed', 'false');
                this.querySelector('.container')?.classList.add('fail');
            }
            setTimeout(() => {
                this.querySelector('.container')?.classList.remove('success', 'fail');
                this.reset();
                if (success) this.close();
            }, 700);
        }
        (index + 1 >= this.digits) ? this.setFocus(0) : this.setFocus(index + 1);
    }

    private setFocus(index : number) {
        this.querySelectorAll('.digit').forEach(d => { d.classList.remove('active'); });
        const el = this.querySelector(`.digit[tabindex="${index}"]`);
        el?.classList.add('active');
        if (el) el.innerHTML = '?';
    }

    private setHTML(selector : string, content : string) {
        const el = this.querySelector(selector);
        if (el) el.innerHTML = content;
    }

    private isComplete() : boolean {
        let complete = true;
        this.querySelectorAll('.digit').forEach(d => {
            if (d.innerHTML === '?') {
                complete = false;
                return;
            }
        });
        return complete;
    }

    private async success() : Promise<boolean> {
        let digits = [];
        for (let i=0; i<this.digits; i++) {
            const el = this.querySelector(`.digit[tabindex="${i}"]`);
            if (el) {
                const emoji = el.innerHTML;
                let digit = EMOJIS.indexOf(emoji);
                digits.push(digit);
            }
        }
        const hash = await this.hash(digits.join('-'));
        //console.log(hash);
        return (hash === this.getAttribute('hash'));
    }

    private async hash(key : string) : Promise<string> {
        /*
        const encoded = new TextEncoder().encode(key);
        const buffer = await crypto.subtle.digest("SHA-384", encoded);
        const array = Array.from(new Uint8Array(buffer));
        const hash = array.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hash;
        */
       return key;
    }


    /**
     * Fire custom events whenever the value is changed by the user
     */
    private emitEvent(name : string, value : string) {
        this.dispatchEvent(
            new CustomEvent(name, {
                bubbles: true,
                composed: true,
                detail: { origin : this,value : value }
            })
        );
    }
}
