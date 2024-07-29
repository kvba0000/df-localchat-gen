import { audioWaitToLoad } from "./helper.js"

const musplayer = document.querySelector("div.musplayer")

const titleEl = musplayer.querySelector("span#mus-title")

const playBtn = musplayer.querySelector("span#mus-start")
const nextBtn = musplayer.querySelector("span#mus-next")


const START_TEXT = "Play"
const STOP_TEXT = "Stop"
const LOADING_TEXT = "Loading..."


const SONGS = [
    {
        "title": "Flower Village",
        "src": "mus_flowervillage.ogg"
    },
    {
        "title": "Extras Menu",
        "src": "mus_extras.ogg"
    },
    {
        "title": "Home",
        "src": "mus_home.ogg"
    },
    {
        "title": "Mountain",
        "src": "mus_mountain.ogg"
    }
]
let currentSong = Math.floor(Math.random()*SONGS.length)

const playerElement = new Audio(`audio/mus/${SONGS[currentSong].src}`)
titleEl.innerText = SONGS[currentSong].title || "(unknown)"


let playing = false
const toggleMusic = async (start) => {
    if(start && playing) return;

    // Start
    if(start) {
        // Load if needed
        if(playerElement.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
            playBtn.classList.add("color-second")
            playBtn.innerText = LOADING_TEXT
            await audioWaitToLoad(playerElement)
            playBtn.classList.remove("color-second")
            toggleMusic(true)
            return;
        }
        playing = true;
        playBtn.innerText = STOP_TEXT
        playerElement.play()
    }
    // Stop
    else {
        playing = false;
        playBtn.innerText = START_TEXT
        playerElement.pause()
    }
}

const nextSong = () => {
    playerElement.pause()
    playing = false

    currentSong = (currentSong + 1) % SONGS.length

    playerElement.src = `audio/mus/${SONGS[currentSong].src}`
    titleEl.innerText = SONGS[currentSong].title || "(unknown)"

    playerElement.currentTime = 0
    toggleMusic(true)
}

playerElement.addEventListener("ended", () => nextSong())
playBtn.addEventListener("click", () => toggleMusic(!playing))
nextBtn.addEventListener("click", () => nextSong())