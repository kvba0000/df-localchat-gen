import { BLIP_AUDIO, playAudioNoDelay, SELECT_AUDIO, CONTENT_ELEMENT } from "../helper.js";

const SHAKE_POWER = 2;

/** @type {HTMLDivElement} */
const TEXTSELECTOR_TEMPLATE = document.querySelector("div#textselector-template").children[0]

export const KEYS_UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
export const KEYS_DOWN = "abcdefghijklmnopqrstuvwxyz"
export const KEYS_NUMBERS = "0123456789"
export const KEYS_SPECIAL = "_-"
export const KEYS_SPECIAL_EXT = "?!@$%^&*():\"'{}[]|<>/+= _-"

/**
 * Undertale-like text selector
 */
export default class TextSelector {
    /** @private @type {string} */
    prompt = "Name the fallen player.";
    /** @private @type {null | (this: TextSelector, val: string) => boolean} */
    onDone = null
    /** @private @type {null | (val: string) => void} */
    onValueChange = null
    /** @private @type {string[]} */
    allowedKeys = [KEYS_UP, KEYS_DOWN]
    /** @type {HTMLDivElement} */
    element;
    /** @type {boolean} */
    exists = false;
    /** @private @type {number | null} */
    keysShakeInteral = null;
    /** @type {string} */
    value = ""

    /**
     * Sets new value and runs callback
     * @param {string} newValue Value to be written 
     * @private
     */
    setValue(newValue) {
        const textSelectorPrompt = this.element.querySelector("div.textselector-prompt")
        const textSelectorValueEl = textSelectorPrompt.querySelector("span.textselector-val")

        this.value = newValue
        textSelectorValueEl.innerText = this.value
        if (this.onValueChange) this.onValueChange.bind(this)(this.value)
    }

    /**
     * Sets prompt as done and runs callback
     * @private
     */
    setDone() {
        const onDone = this.onDone || (() => false)
        const shouldRemove = onDone.bind(this)(this.value) || false
        if(shouldRemove) {
            this.element.remove();
            this.exists = false;

            clearInterval(this.keysShakeInteral)
            this.keysShakeInteral = null
        }
    }

    /**
     * 
     * @param {string} prompt Prompt shown to user
     * @param {string[]} allowedKeys Which keys can user use
     * @param {(this: TextSelector, val: string) => boolean} onDone Callback on clicking [Enter]/Done
     * @param {(val: string) => void} onValueChange Callback on value change
     */
    constructor(prompt, onDone, onValueChange, allowedKeys) {
        if (prompt) this.prompt = prompt
        if (onDone) this.onDone = onDone
        if (onValueChange) this.onValueChange = onValueChange
        if (allowedKeys) this.allowedKeys = allowedKeys

        this.element = TEXTSELECTOR_TEMPLATE.cloneNode(true)
        this.prepareElements()
    }

    /**
     * Prepares all variables and elements to contain needed events/text
     * @private
     */
    prepareElements() {
        const textSelectorPrompt = this.element.querySelector("div.textselector-prompt")
        const textSelectorValueEl = textSelectorPrompt.querySelector("span.textselector-val")
        const textSelectorQuestion = textSelectorPrompt.querySelector("span.textselprompt")

        const textSelectorOptions = this.element.querySelector("div.textselector-options")
        const optionsBackspace = textSelectorOptions.querySelector("span.textselector-back")
        const optionsDone = textSelectorOptions.querySelector("span.textselector-done")

        /** @type {{[key: string]: HTMLSpanElement}} */
        const keyElements = {}

        //Setting question
        textSelectorQuestion.innerText = this.prompt;
          
        // Backspace Option
        optionsBackspace.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            this.setValue(textSelectorValueEl.innerText.slice(0, -1))
        })
        optionsBackspace.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

        // Done Option
        optionsDone.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            document.removeEventListener("keydown", handleKeyboardInput)
            this.setDone()
        })
        optionsDone.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))
    
        // Generating keys
        for(let keys of this.allowedKeys) {
            const keysEl = document.createElement("div")
            keysEl.classList.add("text-keys")
        
            for(let i = 0; i < keys.length; i++) {
                let key = keys[i]
                const keyEl = document.createElement("span")
                keyEl.classList.add("text-key", "selectable")
                keyEl.innerText = key === " " ? "[SPACE]" : key;

                keyEl.addEventListener("click", () => {
                    playAudioNoDelay(SELECT_AUDIO)
                    this.setValue(this.value + key)
                    if (this.onValueChange) this.onValueChange(textSelectorValueEl.innerText)
                })

    
                if(i % 7 === 0) {
                    const brEl = document.createElement("br")
                    keysEl.appendChild(brEl)
                }
    
                keyElements[key] = keyEl
                keysEl.appendChild(keyEl)
            }
            
            this.element.insertBefore(keysEl, textSelectorOptions)
        }

        const handleKeyboardInput = (ev) => {
            const key = ev.shiftKey ? ev.key.toUpperCase() : ev.key
            const elPos = textSelectorValueEl.getBoundingClientRect()
            if(!(
                elPos.y < 400 && elPos.y > 50
            )) return;

            if(this.allowedKeys.flat().join("").split("").includes(key)) {
                ev.preventDefault()
                playAudioNoDelay(SELECT_AUDIO)
                keyElements[key].animate([
                    {"color": "var(--color-link)"},
                    {"color": "var(--color-link)"}
                ], 500)
                return this.setValue(this.value + key)
            }
            if(key === "Backspace") {
                ev.preventDefault()
                return this.setValue(textSelectorValueEl.innerText.slice(0, -1))
            }
            if(key === "Enter") {
                ev.preventDefault()
                document.removeEventListener("keydown", handleKeyboardInput)
                return this.setDone()
            }
            
        }
        document.addEventListener("keydown", handleKeyboardInput)

        const keyElementsArr = Object.values(keyElements)
        this.keysShakeInteral = setInterval(() => {
            if(!(this.exists && this.element.isConnected)) return; // Update only if appended to DOM

            for(let keyEl of keyElementsArr) {
                let keyPos = new Array(2)
                    .fill(null)
                    .map(() => Math.random() * (SHAKE_POWER - -SHAKE_POWER) + -SHAKE_POWER)
                
                keyEl.style.left = `${keyPos[0]}px`;
                keyEl.style.top = `${keyPos[1]}px`
            }
        }, 50);
    }

    /**
     * Shows prompt in DOM
     * @param {Node} putBefore Before which element will this be shown? 
     */
    show(putBefore) {
        CONTENT_ELEMENT.insertBefore(this.element, putBefore || null)
        this.exists = true;
    }
}