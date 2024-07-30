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
    /** @type {HTMLDivElement} */
    element;
    /** @private @type {null | (this: ImageGenerator) => void} */
    onNew = null;
    /** @type {number} */
    imageRatio = 4
    /** @type {boolean} */
    messageCalculated = false
    /** @type {string | null} */
    dataURL = null
    /** @type {string | null} */
    dataGifURL = null
    /** @private @type {boolean} */
    isAnimated = false;
    /** @type {string} */
    nameColor = "#FFFFFF"
    /** @type {string} */
    messageColor = "#FFFFFF"

    resetImage() {
        this.dataURL = null
        this.dataGifURL = null
    }

    /**
     * Sets name color and resets image cache
     * @param {string} color 
     */
    setNameColor(color) {
        this.nameColor = color
        this.resetImage()
    }

    /**
     * Sets message color and resets image cache
     * @param {string} color 
     */
    setMessageColor(color) {
        this.messageColor = color
        this.resetImage()
    }

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
        this.prepareElements()
    }

    /**
     * Prepares element to work
     * @private
     */
    prepareElements() {
        const options = this.element.querySelector("div.imagegen-options")

        const downloadEl = options.querySelector("span.imagegen-download")
        const newEl = options.querySelector("span.imagegen-new")

        const imgOptions = options.querySelector("div.imagegen-imgoptions")
        const animatedEl = imgOptions.querySelector("input.imagegen-animated")
        const nameColorEl = imgOptions.querySelector("input.imagegen-namecolor")
        const messageColorEl = imgOptions.querySelector("input.imagegen-messagecolor")

        newEl.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

        downloadEl.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            
            const a = document.createElement("a")
            a.href = this.isAnimated ? this.dataGifURL : this.dataURL
            a.download = `not a real chat message.${this.isAnimated ? "gif" : "png"}`
            a.click()
        })

        downloadEl.addEventListener("mouseover", () => playAudioNoDelay(BLIP_AUDIO))

        newEl.addEventListener("click", () => {
            playAudioNoDelay(SELECT_AUDIO)
            this.element.remove()
            if (this.onNew) this.onNew.bind(this)()
        })

        animatedEl.addEventListener("click", () => {
            this.isAnimated = animatedEl.checked
            this.show(null, animatedEl.checked)
        })

        nameColorEl.addEventListener("change", () => {
            this.setNameColor(nameColorEl.value)
            this.show(null, this.isAnimated)
        })

        messageColorEl.addEventListener("change", () => {
            this.setMessageColor(messageColorEl.value)
            this.show(null, this.isAnimated)
        })
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
     * @private
     * @param {boolean} returnImageData Should return image data instead of image url
     * @param {string | undefined} text Custom text for message, MESSAGE FITTING DOES NOT APPLY
     * @returns {Promise<string | ImageData>}
     */
    generate = async (returnImageData = false, text) => {
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
        
        let x = 5 + (iconWidth - width) / 2;
        let y = 5 + iconHeight - height;
        ctx.drawImage(
            icon,
            x * this.imageRatio,
            y * this.imageRatio,
            width * this.imageRatio,
            height * this.imageRatio
        )

        // name
        ctx.fillStyle = this.nameColor
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
        ctx.fillStyle = this.messageColor
        ctx.font = `${fontSize}px "Determination Mono"`
        this.fitMessage(ctx)
        ctx.fillText(
            text || this.message,
            38 * this.imageRatio,
            13 * this.imageRatio
        )

        return returnImageData ? ctx.getImageData(0, 0, canvas.width, canvas.height) : canvas.toDataURL("image/png")
    }

    /**
     * Generate GIF
     * @private
     * @returns {Promise<string>}
     */
    async generateGIF() {
        // Calculating message
        const bg = new Image()
        bg.src = "sprites/spr_rp_localmsg_0.png"
        await imageWaitToLoad(bg)

        const canvas = document.createElement("canvas")
        canvas.height = bg.naturalHeight * this.imageRatio
        canvas.width = bg.naturalWidth * this.imageRatio

        const ctx = canvas.getContext("2d")
        const fontSize = 60
        ctx.font = `${fontSize}px "Determination Mono"`
        this.fitMessage(ctx)

        return new Promise(async r => {
            const gif = new GIF({
                workerScript: "scripts/gif.js/gif.worker.js"
            })
            gif.once("finished", (blob) => {
                console.log(URL.createObjectURL(blob))
                r(URL.createObjectURL(blob))
            })

            let text = ""
            for(let i = 0; i < this.message.length; i++) {
                text += this.message[i]
                console.log(text)
                gif.addFrame(
                    await this.generate(true, text),
                    {
                        delay: i === this.message.length - 1 ? 10_000 : 33
                    }
                )
            }

            gif.render()
        })
    }

    /**
     * Shows image in DOM
     * @param {Node | null} putBefore Before which element will this be shown? 
     * @param {boolean} gif Should show GIF?
     */
    async show(putBefore, gif) {
        if(this.element.isConnected) this.element.style.display = "none"

        const imgEl = this.element.querySelector("img.imagegen-result")

        const src = !gif ? 
            (this.dataURL ? this.dataURL : await this.generate()) : 
            (this.dataGifURL ? this.dataGifURL : await this.generateGIF())

        if(gif && !this.dataGifURL) this.dataGifURL = src
        if(!gif && !this.dataURL) this.dataURL = src

        imgEl.src = src
        await imageWaitToLoad(imgEl)

        playAudioNoDelay(SOUND_EQUIP)

        if(this.element.isConnected) this.element.style.display = ""
        else CONTENT_ELEMENT.insertBefore(this.element, putBefore || null)
    }
}