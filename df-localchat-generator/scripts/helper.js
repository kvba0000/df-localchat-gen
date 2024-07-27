export const SELECT_AUDIO = new Audio("audio/snd_select.wav")
export const BLIP_AUDIO = new Audio("audio/snd_blip.wav")


/**
 * Plays audio with no delay.
 * @param {HTMLAudioElement} audio Audio element
 */
export const playAudioNoDelay = (audio) => {
    audio.currentTime = 0
    audio.play()
}

/**
 * Waits for image to load
 * @param {HTMLImageElement[]} images
 */
export const imageWaitToLoad = async (...images) => {
    /** 
     * @param {HTMLImageElement} image
     * @return {Promise<boolean>}
     */
    const waitToLoad = async (image) => {
        if(image.complete) return true;
        return new Promise(r => {
            image.addEventListener("load", () => r(true), { once: true })
        })
    }
    
    return await Promise.all(
        images.map(i => waitToLoad(i))
    )
}

/**
 * Waits for audio to load
 * @param {HTMLAudioElement} audio Audio element
 */
export const audioWaitToLoad = async (audio) => {
    if(audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) return true;
    return new Promise(r => {
        const interv = setInterval(() => {
            if(audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
                clearInterval(interv)
                r(true)
            }
        }, 100);
    })
}

/**
 * Imports JSON file and returns it's data.
 * @param {string} path Path of JSON file
 * @returns 
 */
export const importJSON = async (path) => {
    if(!path) return null;

    try {
        return await fetch(path)
            .then(r => r.json())
    }catch(e) {
        console.error(`Could not fetch ${path}...\n`, e)
        return null
    }
}


/**
 * Animatable.animate in async
 * @param {Animatable} element 
 * @param {Keyframe[] | PropertyIndexedKeyframes | null} keyframes 
 * @param {number | KeyframeAnimationOptions} options
 */
export const animateAsync = async (element, keyframes, options = {}) => new Promise(r => {
    element.animate(keyframes, options).addEventListener("finish", r, { once: true })
})

/** 
 * Main element where items should be added
 * @type {HTMLDivElement}
 */
export const CONTENT_ELEMENT = document.querySelector("div.content")
