import { importJSON, SELECT_AUDIO, playAudioNoDelay, BLIP_AUDIO, CONTENT_ELEMENT } from "../helper.js";

/** @type {HTMLDivElement} */
const ICONSELECTOR_TEMPLATE = document.querySelector("div#iconselector-template").children[0]

/**
 * RPG characters icon selector
 */
export default class IconSelector {
    /** @type {{[spriteName: string]: number}} */
    metadata = {}
    /** @type {[string, number]} */
    currentIcon = ["spr_rp_harlow", 0]
    /** @type {HTMLDivElement} */
    element;
    /** @type {boolean} */
    exists = false;
    /** @private @type {(this: IconSelector, val: [string, number]) => boolean} */
    onDone = null

    /**
     * Returns formatted URL for icon image. DOES NOT VALIDATE DATA
     * @param {string} id 
     * @param {number} face 
     * @returns {string} URL of icon image
     */
    getIconURL(id, face) {
        return `sprites/faces/${id}/${id}_${face}.png`
    }

    get currentIconURL() {
        const [id, face] = this.currentIcon
        return this.getIconURL(id, face)
    }

    /**
     * 
     * @param {null | (this: IconSelector, val: [string, number]) => boolean} onDone Callback on selecting icon
     */
    constructor(onDone) {
        if(onDone) this.onDone = onDone;

        this.element = ICONSELECTOR_TEMPLATE.cloneNode(true)
    }

    /**
     * Set face to given value
     * @private
     * @param {number} faceNum 
     */
    setFace(faceNum) {
        const maxNum = this.metadata[this.currentIcon[0]] - 1
        if(maxNum === 0) return;
        
        if(maxNum < faceNum) faceNum = faceNum % maxNum
        if(faceNum < 0) faceNum = maxNum

        const currIcon = this.element.querySelector("div.iconselector-curricon")
        const currFace = currIcon.querySelector("div.iconselector-face > img")

        this.currentIcon[1] = faceNum;
        currFace.src = this.currentIconURL
    }

    /**
     * Set character id to given value
     * @private
     * @param {string} id 
     */
    setChar(id) {
        const chars = Object.keys(this.metadata)
        if(!chars.includes(id)) id = "spr_rp_unknown"
        
        const currIcon = this.element.querySelector("div.iconselector-curricon")
        const currFace = currIcon.querySelector("div.iconselector-face > img")

        this.currentIcon = [id, 0]
        currFace.src = this.currentIconURL
    }

    /**
     * Sets prompt as done and runs callback
     * @private
     */
    setDone() {
        const onDone = this.onDone || (() => false)
        const shouldRemove = onDone.bind(this)(this.value) || false
        if(shouldRemove) {
            this.element.remove()
            this.exists = false;
        }
    }

    /**
     * Shows prompt in DOM
     * @param {Node} putBefore Before which element will this be shown? 
     */
    async show(putBefore) {
        this.metadata = await importJSON("sprites/faces/metadata.json")

        const currIcon = this.element.querySelector("div.iconselector-curricon")

        const currFaceDiv = currIcon.querySelector("div.iconselector-face")
        const currFace = currFaceDiv.querySelector("img")

        const nextFace = currIcon.querySelector("img.iconselector-face-next")
        const prevFace = currIcon.querySelector("img.iconselector-face-prev")

        const icons = this.element.querySelector("div.iconselector-icons")

        currFace.src = this.currentIconURL

        // Next face
        nextFace.addEventListener("click", () => {
            playAudioNoDelay(BLIP_AUDIO)
            this.setFace(this.currentIcon[1] + 1)
        })
        // Previous face
        prevFace.addEventListener("click", () => {
            playAudioNoDelay(BLIP_AUDIO)
            this.setFace(this.currentIcon[1] - 1)
        })

        // On done
        currFaceDiv.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            this.setDone()
        })

        // Setting icons
        for(let [id, _] of Object.entries(this.metadata)) {
            const div = document.createElement("div")
            div.classList.add("selectable-border", "iconselector-face")

            div.addEventListener("click", () => {
                playAudioNoDelay(SELECT_AUDIO)
                currIcon.scrollIntoView({behavior: "smooth"})
                this.setChar(id)
            })
            div.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

            const img = document.createElement("img")
            img.src = this.getIconURL(id, 0)

            div.appendChild(img)
            icons.appendChild(div)
        }

        CONTENT_ELEMENT.insertBefore(this.element, putBefore || null)
        this.exists = true;
    }
}