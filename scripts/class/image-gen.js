import { imageWaitToLoad, CONTENT_ELEMENT, playAudioNoDelay, SELECT_AUDIO, BLIP_AUDIO } from "../helper.js";

/** @type {HTMLDivElement} */
const IMAGEGEN_TEMPLATE = document.querySelector("div#imagegen-template").children[0]
const SOUND_EQUIP = new Audio("audio/snd_equip.wav")

const DEFAULT_NAME = "(unknown)"
const DEFAULT_MESSAGE = "If you see this message, I most likely broke something... Oopsie! :3"
const UNKNOWN_ICON = "/sprites/faces/spr_rp_unknown/spr_rp_unknown_0.png"

// Loading fonts
const fonts = {
    "Trouble Benath The Dome": 'url("styles/fonts/TroubleBenathTheDome.ttf")'
}
for(let [fontFamily, fontSource] of Object.entries(fonts)) new FontFace(fontFamily, fontSource).load()
    .then(f => document.fonts.add(f))
    .catch(e => {
        console.error(e)
        alert("There was an error in generating image! Check console for more info")
    })

/**
 * DF Image Generator, please don't use in malicious purposes.
 */
export default class ImageGenerator {
    /** @private @type {string} */
    name = "";
    /** @private @type {string} */
    message = "";
    /** @private @type {string} */
    icon = "";
    /** @type {string} */
    dataURL = null;
    /** @type {HTMLDivElement} */
    element;
    /** @private @type {null | (this: ImageGenerator) => void} */
    onNew = null;
    /** @type {number} */
    imageRatio = 4
    /** @type {boolean} */
    messageCalculated = false

    /**
     * 
     * @param {string} name Player name
     * @param {string} message Message
     * @param {string} icon Player icon URL
     * @param {null | (this: ImageGenerator) => void} onNew Callback on new generation
     */
    constructor(name = DEFAULT_NAME, message = DEFAULT_MESSAGE, icon = UNKNOWN_ICON, onNew = null) {
        this.name = name;
        this.message = message;
        this.icon = icon;

        this.onNew = onNew

        this.element = IMAGEGEN_TEMPLATE.cloneNode(true)
    }

    /**
     * Calculates text width and fits it to the content
     * @param {CanvasRenderingContext2D} ctx Canvas Context in which text should be calculated
     */
    fitMessage = (ctx)=> {
        if(this.messageCalculated) return;
        while (ctx.measureText(this.message).width > 275 * this.imageRatio) this.message = this.message.slice(0, -1)
        this.messageCalculated = true;
    }

    /**
     * Generate image
     * @returns {Promise<ImageData>}
     */
    generate = async () => {
        // Loading images
        const bg = new Image()
        bg.src = "sprites/spr_rp_localmsg_0.png"

        const icon = new Image()
        icon.src = this.icon
        await imageWaitToLoad(bg, icon)

        const canvas = document.createElement("canvas")
        canvas.height = bg.naturalHeight * this.imageRatio
        canvas.width = bg.naturalWidth * this.imageRatio

        const ctx = canvas.getContext("2d")
        ctx.imageSmoothingEnabled = false

        //bg
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

        //icon
        let imgRatio = icon.width / icon.height
        let iconWidth = 25, iconHeight = 24, iconRatio = iconWidth / iconHeight
        let width, height;
        if (imgRatio > iconRatio) {
          width = iconWidth;
          height = iconWidth / imgRatio;
        } else {
          width = iconHeight * imgRatio;
          height = iconHeight;
        }
        let x = 5 + (iconWidth / 2)- (icon.width / 2),
            y = 5 + (iconHeight / 2) - (icon.height / 2)
        ctx.drawImage(
            icon,
            x * this.imageRatio,
            y * this.imageRatio,
            width * this.imageRatio,
            height * this.imageRatio
        )

        // name
        ctx.fillStyle = "white"
        ctx.textBaseline = "top"
        let fontSize = 7 * this.imageRatio
        ctx.font = `${fontSize}px "Trouble Benath The Dome"`
        ctx.fillText(
            `[${this.name}]:`,
            38 * this.imageRatio,
            7 * this.imageRatio
        )

        // msg
        fontSize = 60
        ctx.font = `${fontSize}px "Determination Mono"`
        this.fitMessage(ctx)
        ctx.fillText(
            this.message,
            38 * this.imageRatio,
            13 * this.imageRatio
        )

        
        this.dataURL = canvas.toDataURL("image/png")
        return this.dataURL;
    }

    /**
     * Shows image in DOM
     * @param {Node} putBefore Before which element will this be shown? 
     */
    async show(putBefore) {
        if(!this.dataURL) throw new Error("Image has not been generated yet!")

        const imgOptions = this.element.querySelector("div.imagegen-options")
        const downloadEl = imgOptions.querySelector("span.imagegen-download")
        const newEl = imgOptions.querySelector("span.imagegen-new")

        downloadEl.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            
            const a = document.createElement("a")
            a.href = this.dataURL
            a.download = "not a real chat message.png"
            a.click()
        })

        downloadEl.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

        newEl.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            this.element.remove()
            if (this.onNew) this.onNew.bind(this)()
        })

        newEl.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

        const imgEl = this.element.querySelector("img.imagegen-result")
        imgEl.src = this.dataURL
        await imageWaitToLoad(imgEl)

        playAudioNoDelay(SOUND_EQUIP)
        CONTENT_ELEMENT.insertBefore(this.element, putBefore || null)
    }
}