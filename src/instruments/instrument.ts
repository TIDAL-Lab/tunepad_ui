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
 * Shared functionality across all instruments
 */
export default interface Instrument {
    noteOn(note : number, velocity : number) : void;

    noteOff(note : number) : void;

    allNotesOff() : void;

    isNoteOn(note : number) : boolean;

    armKeyboard() : void;

    disarmKeyboard() : void;

    get isKeyboardArmed() : boolean;
}
