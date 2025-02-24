import { AnimatePresence, motion } from "motion/react";

import LinkButton from "./LinkButton";
import useCopyToClipboard from "./../hooks/useCopyToClipboard";

const icons = [
    {imgSrc: "https://img.icons8.com/ios11/512/FFFFFF/linkedin.png", link: "https://www.linkedin.com/in/lliam-symonds-184885292/", title: "LinkedIn"},
    {imgSrc: "https://img.icons8.com/ios11/512/FFFFFF/github.png", link: "https://github.com/lliamsymonds04", title: "Github"},
]

const myEmail = "lliamsymonds04@gmail.com";

function TopIcons () {
    const [copiedEmail, copyEmailToClipboard] = useCopyToClipboard(myEmail);


    return (
        <div className="absolute flex flex-row-reverse right-5 top-5 gap-2 items-center">
            {icons.map((v) => <LinkButton key={v.link} imgSrc={v.imgSrc} link={v.link} />)}
            <button
                type="button"
                onClick={copyEmailToClipboard}
                title="Copy Email"
            >
                <img src="https://img.icons8.com/?size=100&id=86875&format=png&color=FFFFFF" className="h-10 w-10" style={{ cursor: 'pointer' }}/>
            </button>
            <AnimatePresence>
                {copiedEmail && <div className="overflow-hidden">
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3 }}
                        >
                        <h1 className="text-lg text-white font-bold font-sans">Email Copied!</h1>
                    </motion.div>
                </div>}
            </AnimatePresence>
            
        </div>
    )
}


export default TopIcons