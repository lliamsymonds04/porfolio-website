import { useState, useRef, useLayoutEffect } from 'react';
import { useScroll, useTransform, motion } from "motion/react";

// function HomepageCard({children, className, style}: {children: React.ReactNode, className: string, style: React.CSSProperties}) {
//     const size = 35;

//     return (
//         <div className={`${className} absolute rounded-3xl drop-shadow-2xl overflow-hidden`} style={{...style, ...{width: `${size + 4}vmin`, height: `${size}vmin`}}}>
//             {children}
//         </div>
//     );
// }

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

    const left_card_x = useTransform(scrollY, [0, landingPageHeight], ["-12vmin","-150vmin"])
    const right_card_x = useTransform(scrollY, [0, landingPageHeight], ["12vmin","150vmin"])

    return (
        <div className = "h-screen w-screen flex">
            <h1>Desktop Landing Page</h1>
        </div>
    );
}

{/* <div className="">
          <div ref={landingPageRef} className="relative h-screen w-screen" >
            <TopIcons />

            <motion.div className="absolute z-10 bottom-[55%] right-1/2" style={{x: left_card_x, width: `39vmin`, height: `35vmin`}}>
              <HomepageCard className="bg-[#FFBB00] h-full w-full" style={{}}>
                <SkillsCard/>
              </HomepageCard>
            </motion.div>

            <HomepageCard className="z-10 -translate-x-1/2 -translate-y-1/2 bg-[#FFC936]" style={{top: "45%", left: "50%"}}>
              <AboutMeCard/>
            </HomepageCard>
            
            <motion.div className="absolute z-10 top-[45%] left-1/2" style={{x: right_card_x, width: `39vmin`, height: `35vmin`}}>
              <HomepageCard className="z-10 bg-[#FFBB00]" style={{}}>
                <MeCard/>
              </HomepageCard>
            </motion.div>
          </div>          
        </div> */}

export default DesktopLandingPage;