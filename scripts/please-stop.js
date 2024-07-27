import { imageWaitToLoad, audioWaitToLoad } from "./helper.js"


const iWarnedYou = async () => {
    const img = new Image()
    img.src = "sprites/spr_ultimateattack.gif"
    await imageWaitToLoad(img)

    ;[
        ["position", "fixed"],
        ["left", "0"],
        ["top", "0"],
        ["height", "100vh"],
        ["width", "100vw"]
    ].forEach(([k, v]) => img.style[k] = v)

    const audio = new Audio("audio/mus_chinchin.ogg")
    await audioWaitToLoad(audio)

    audio.loop = true
    audio.volume = 1

    document.write("<html></html>")
    document.documentElement.appendChild(img)

    img.requestFullscreen()
    audio.play()

    setTimeout(() => {
        location.href = "https://google.com"
    }, 5000);
}

const heyaJustWannaSayThatIfYouSeeThisYouShouldntHaveDoneThoseNonoWords = {
    regex: new RegExp("(?:^|-|_|\\s)(" + [
        "bmlnZXI=",
        "bmlnYQ==",
        "bmlnZ2Vy",
        "bmlnZ2E=",
        "cmV0YXJk",
        "c2V4",
        "Y3Vt",
        "Y3VtbWluZw==",
        "cnVsZTM0",
        "aGl0bGVy"
    ].map(b => 
        atob(b)
            .replace(/a/g, "(?:a|4)")
            .replace(/b/g, "(?:b|8)")
            .replace(/e/g, "(?:e|3)")
            .replace(/g/g, "(?:g|6)")
            .replace(/i/g, "(?:i|1|!)")
            .replace(/o/g, "(?:o|0|\(\))")
            .replace(/t/g, "(?:t|7)")
            .replace(/s|z/g, "(?:z|s|2|5)")
        )
        .map(r => `(?:${r})`)
        .join("|") 
        + ")(?:$|-|_|\\s)", "gm"),
    chance: localStorage.getItem("nono") === "nono" ? 1 : 0,
    ok: false
}

/**
 * 
 * @param {string} v 
 */
export const calculateNono = (v) => {
    const o = heyaJustWannaSayThatIfYouSeeThisYouShouldntHaveDoneThoseNonoWords
    if(o.ok) return;

    if(v.toLowerCase().match(o.regex)) {
        if(Math.random() < o.chance) {
            localStorage.setItem("nono", "nono")
            o.ok = true;
            iWarnedYou()
        }
        else o.chance += 0.05
    }
}