import IconSelector from "./class/icon-selector.js";
import TextSelector, {KEYS_UP, KEYS_DOWN, KEYS_SPECIAL_EXT, KEYS_SPECIAL, KEYS_NUMBERS} from "./class/text-selector.js"
import { animateAsync, audioWaitToLoad } from "./helper.js";
import { calculateNono } from "./please-stop.js";
import ImageGenerator from "./class/image-gen.js"


document.addEventListener("dragstart", (ev) => ev.preventDefault())

const someoneEl = document.querySelector("div.header > img.someone")
someoneEl.src = Math.random() < 0.1 ? "sprites/spr_cplayer_down_0.png" : "sprites/spr_player_down_0.png"

let switchedSprites = false;
const switchSprite = () => {
    if(switchedSprites) return;
    switchedSprites = true
    
    someoneEl.src = "sprites/spr_rurq.png"
}

someoneEl.addEventListener("click", async () => {
    const audio = {
        squeak: new Audio("audio/snd_squeak.wav"),
        freed: new Audio("audio/snd_freed.wav")
    }
    await Promise.all(
        Object.values(audio).map(a => audioWaitToLoad(a))
    )

    audio.squeak.play()
    await animateAsync(someoneEl, [
        {
            transform: "translateX(calc(-50% - 100px)) rotate(0deg)",
            left: "50%",
            bottom: "0px"
        },
        {
            bottom: "30px"
        },
        {
            transform: "translateX(calc(-50% - 100px)) rotate(-600deg)",
            left: "0%",
            bottom: "-80px"
        }
    ], {
        duration: 1000,
        easing: "cubic-bezier(.19,.57,.21,.39)",
        fill: "forwards"
    })
    someoneEl.style.visibility = "hidden"
    audio.freed.play()
}, { once: true })


let currentQuestion = 0
const QUESTIONS = [
    {
        question: "Name the fallen player",
        onValueChange: function(v) {
            if(this.value.length > 32) this.value = this.value.slice(0, -1)
            switch(v.toLowerCase()) {
                case "gaster":
                    location.reload()
                    return;
                
                case "kvba":
                case "kvba0000":
                case "rurq":
                    switchSprite()
                    return;
            }
            calculateNono(v)
        },
        allowedKeys: [KEYS_UP, KEYS_DOWN, KEYS_NUMBERS, KEYS_SPECIAL]
    },
    {
        question: "Enter the message",
        onValueChange: function(v) {
            if(this.value.length > 100) this.value = this.value.slice(0, -1)
            calculateNono(v)
        },
        allowedKeys: [KEYS_UP, KEYS_DOWN, KEYS_NUMBERS, KEYS_SPECIAL_EXT]
    }
]

let answers = []
const showQuestion = () => {
    const q = QUESTIONS[currentQuestion]
    if(!q) return showIconSelector();

    new TextSelector(
        q.question,
        (v) => {
            if(v.length < 1) return false;
            answers.push(v)
            
            currentQuestion++
            showQuestion()
            return true
        },
        q.onValueChange,
        q.allowedKeys
    ).show()
}

const showIconSelector = () => {
    new IconSelector(
        function(v) {
            answers.push(this.currentIconURL)
            startGenerator()
            return true
        }
    ).show()
}

const startGenerator = async () => {
    const [name, message, icon] = answers

    const imageGen = new ImageGenerator(
        name, 
        message, 
        icon,
        () => start(true)
    )
    imageGen.show(null, false)
}

const start = (restart = false) => {
    if(restart) {
        answers = []
        currentQuestion = 0
    }
    showQuestion()
}

/** Use this only for debugging image generator... */
const debugStart = () => {
    answers = ["THEONE12", "lorem ipsum sit hamet lorem ipsum sit hamet lorem ipsum sit hamet", "/sprites/faces/spr_rp_omori/spr_rp_omori_0.png"]
    startGenerator()
}

document.addEventListener("notice-gone", () => start(true), { once: true })
// debugStart()