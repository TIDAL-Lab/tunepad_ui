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
import { Dial }  from '../components/dial';
import styles from './filter.module.css' with {type: 'css'};
import html from './filter.module.html';

export class FilterExample extends HTMLElement {

    static readonly ELEMENT = "filter-example";

    static observedAttributes = [ ];

    // all of the HTML elements for the instrument are contained within a shadow DOM
    private root : ShadowRoot;

    // web audio context (starts out undefined)
    private context? : AudioContext;

    // dials
    private freq : Dial;
    private reso : Dial;
    private gain : Dial;


    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.root.adoptedStyleSheets.push(styles);
        this.root.innerHTML = html;
        this.freq = this.root.querySelector('#frequency-dial') as Dial;
        this.reso = this.root.querySelector('#resonance-dial') as Dial;
        this.gain = this.root.querySelector('#gain-dial') as Dial;
    }

    connectedCallback() {
        this.context = new AudioContext();
        const srate = this.context.sampleRate; // 44.1 kHz sample rate

        // create a 2-second audio buffer
        const  noise = this.context.createBuffer(1, 2 * srate, srate);

        // fill the buffer with white noise
        const output = noise.getChannelData(0);
        for (let i = 0; i < output.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        // audio buffer source node plays the white noise
        let source : AudioBufferSourceNode | undefined;

        // filter node for our lowpass controls
        let filter : BiquadFilterNode | undefined;

        // volume nob
        let gain : GainNode | undefined;

        // play the white noise
        this.root.querySelector('#play-button')?.addEventListener('click', (e) =>  {

            // STEP 1: Create a gain node
            gain = this.context!.createGain();
            gain.gain.value = this.gain.value;
            gain.connect(this.context!.destination);

            // STEP 2: Create the lowpass filter
            filter = this.context!.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = this.freq.value;
            filter.Q.value =  this.reso.value;
            filter.connect(gain);

            // STEP 3: Create a BufferSource Node
            source = this.context!.createBufferSource();
            source.buffer = noise;
            source.loop = true;
            source.connect(filter);

            // STEP 4: Start the white noise
            source.start();   // start the audio

            // STEP 5: Toggle play/pause
            this.addClass('#play-button', 'hidden');
            this.removeClass('#pause-button', 'hidden');
        });


        // pause the white noise
        this.root.querySelector('#pause-button')?.addEventListener('click', (e) => {
            source?.stop();
            this.addClass('#pause-button', 'hidden');
            this.removeClass('#play-button', 'hidden');
        });

        // adjust the filter cutoff
        this.freq.addEventListener('adjusted', (e) => {
            if (filter) filter.frequency.value = (e as CustomEvent).detail.value;
        });

        this.reso.addEventListener('adjusted', (e) => {
            if (filter) filter.Q.value = (e as CustomEvent).detail.value;
        });

        // adjust volume
        this.gain.addEventListener('adjusted', (e) => {
            if (gain) gain.gain.value = (e as CustomEvent).detail.value;
        });
    }

    disconnectedCallback() {
    }

    /**
     * When an attribute is changed on our custom component, this gets fired...
     */
    attributeChangedCallback(name : string, oldValue : string, newValue : string) {
    }


    addClass(selector : string, className : string) {
        this.root.querySelector(selector)?.classList.add(className);
    }

    removeClass(selector : string, className : string) {
        this.root.querySelector(selector)?.classList.remove(className);
    }

}
