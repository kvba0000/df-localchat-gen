const noticeEl = document.querySelector("div.notice")
const noticeContent = noticeEl.querySelector("div.notice > div.notice-content")
const noticeText = noticeContent.querySelector("span#noticetext")
const noticeContinue = noticeContent.querySelector("span#noticecontinue")

const NOTICE_TEXT = "Before you continue, anything here is not official, any content here (sprite/audio/etc.) is not mine and is owned by it's original creators (credits in footer)."
let noticeMode = 0;

const noticeGoneEvent = new Event("notice-gone")

const showContinueBtn = () => {
    noticeMode = 2
    noticeContinue.classList.add("opacity-100")
}

const startNotice = async () => {
    document.body.classList.add("no-overflow")
    noticeContent.classList.add("opacity-100")
    setTimeout(async () => {
        noticeMode = 1

        let text = noticeText.innerText;
        for(let l of NOTICE_TEXT.split("")) {
            if(noticeMode === 2) return;

            text += l;
            noticeText.innerText = text;
            await new Promise(r => setTimeout(r, 30))
        }
        setTimeout(showContinueBtn, 500);
    }, 2300);
}

const handleNoticeClick = () => {
    switch (noticeMode) {
        // No notice, other
        default:
        case 0:
            return;

        // Showing notice
        case 1:
            noticeText.innerText = NOTICE_TEXT;
            showContinueBtn();
            break;

        case 2:
            noticeContent.classList.remove("opacity-100")
            setTimeout(() => {
                noticeEl.remove()
                document.dispatchEvent(noticeGoneEvent)
                document.body.classList.remove("no-overflow")
            }, 2300);
            break;

    }
}

document.addEventListener("click", handleNoticeClick)
document.addEventListener("DOMContentLoaded", startNotice, { once: true })