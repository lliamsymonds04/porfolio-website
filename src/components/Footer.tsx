import { useEffect, useState } from "react"

import getLastSong from "../util/GetLastSong"
import LinkButton from "./LinkButton"
import useCopyToClipboard from "../hooks/useCopyToClipboard"

const footerButtons = [
    {imgSrc: "https://img.icons8.com/ios11/512/FFFFFF/github.png", link: "https://github.com/lliamsymonds04"},
    {imgSrc: "https://img.icons8.com/ios11/512/FFFFFF/linkedin.png", link: "https://www.linkedin.com/in/lliam-symonds-184885292/"},
    {imgSrc: "https://img.icons8.com/m_outlined/512/FFFFFF/instagram-new.png", link: "https://www.instagram.com/lliamsymonds04/"},
]

function Footer() {
    const [songName, setSongName] = useState("")
    const [artistName, setArtistName] = useState("")
    const [copiedEmail, copyEmailToClipboard] = useCopyToClipboard("lliamsymonds04@gmail.com")

    useEffect(() => {
        getLastSong().then((v) => {
            if (v) {
                setSongName(v.trackName)
                setArtistName(v.artist)            
            }
        })
    }, [])
    

    return (
        <div className="relative w-screen h-52 bg-[#FFBB00] flex flex-col pt-5 items-center">
            <p className="text-white text-2xl font-sans mb-2">Like what you see? Get in Touch!</p>
            {copiedEmail ? <p className="text-white txt-xl font-bold">Copied Email</p>: 
                <button onClick={copyEmailToClipboard} title="Copy to clipboard">
                    <p className="text-white txt-xl cursor-pointer">Email: <span className="underline font-bold">lliamsymonds04@gmail.com</span></p>
                </button>
            }

            <div className="flex flex-row mt-4 gap-2">
                {footerButtons.map((v) => <LinkButton imgSrc={v.imgSrc} link={v.link} key={v.imgSrc} />)}
            </div>

            {songName != "" && <p className="absolute text-lg text-white font-light text-center bottom-3 max-w-[90%]">Fun Fact, the last song I listened to is{" "}
                <span className="italic">{songName}</span>
                {" by "} 
                <span className="italic">{artistName}</span>
                <span className="ml-2">{" :)"}</span>
            </p>}
        </div>
    )
}


export default Footer