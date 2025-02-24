import { useState, useRef, useLayoutEffect } from 'react';
import { useScroll, useTransform, motion } from "motion/react";

import AboutMeCard from '../HomeCards/AboutMeCard';
import SkillsCard from '../HomeCards/SkillsCard';
import MeCard from '../HomeCards/MeCard';

function DesktopLandingPage() {
    const [landingPageHeight, setLandingPageHeight] = useState(0);
    const landingPageRef = useRef<HTMLDivElement | null>(null)

    const { scrollY } = useScroll({
        target: landingPageRef,
        offset: ["start end", "end end"]
    })
    
    useLayoutEffect(() => {
        if (landingPageRef.current) {
        setLandingPageHeight(landingPageRef.current.offsetHeight );
        }
    }, []);

    const left_card_x = useTransform(scrollY, [0, landingPageHeight], ["0vmin","-250vmin"])
    const right_card_x = useTransform(scrollY, [0, landingPageHeight], ["0vmin","250vmin"])//["12vmin","150vmin"]

    const size = 40;

    return (
        <div ref={landingPageRef} className = "h-screen w-screen flex">
            <motion.div
                className='bg-[#FFC936] absolute rounded-3xl drop-shadow-2xl overflow-hidden top-[25%] left-[43%] -translate-x-full -translate-y-1/2'
                style={{x: left_card_x, width: `${size + 4}vmin`, height: `${size}vmin`}}
            >
                <SkillsCard/>
            </motion.div>
            <div 
                className="bg-[#FFC936] absolute rounded-3xl drop-shadow-2xl overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{width: `${size + 4}vmin`, height: `${size}vmin`}}
            >
                <AboutMeCard/>
            </div>
            <motion.div
                className='bg-[#FFC936] absolute rounded-3xl drop-shadow-2xl overflow-hidden top-[75%] left-[57%] -translate-y-1/2'
                style={{x: right_card_x, width: `${size + 4}vmin`, height: `${size}vmin`}}
            >
                <MeCard/>
            </motion.div>
        </div>
    );
}

export default DesktopLandingPage;