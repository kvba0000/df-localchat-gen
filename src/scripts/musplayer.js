import { audioWaitToLoad } from "./helper.js"

const musplayer = document.querySelector("div.musplayer")
const playBtn = musplayer.querySelector("span#mus-start")

const START_TEXT = "Play"
const STOP_TEXT = "Stop"
const LOADING_TEXT = "Loading..."

let currentSong = 0
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

const playerElement = new Audio(
    `audio/mus/${SONGS[Math.floor(Math.random()*SONGS.length)].src}`
)

let playing = false
const toggleMusic = async (start) => {
    if(start && playing) return;

    if(start) {
        if(playerElement.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
            playBtn.innerText = LOADING_TEXT
            await audioWaitToLoad(playerElement)
            toggleMusic(true)
            return;
        }
        playing = true;
        playBtn.innerText = STOP_TEXT
        playerElement.play()
    }
    else {
        playing = false;
        playBtn.innerText = START_TEXT
        playerElement.pause()
    }
}

const nextSong = () => {
    currentSong = (currentSong + 1) % SONGS.length
    playerElement.src = `audio/mus/${SONGS[currentSong].src}`
    playerElement.currentTime = 0
    toggleMusic(true)
}

playerElement.addEventListener("ended", () => {
    playing = false;
    nextSong()
})

playBtn.addEventListener("click", () => {
    toggleMusic(!playing)
})