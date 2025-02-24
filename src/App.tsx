import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useScroll, useTransform, motion } from "motion/react";

import useCheckMobile from "./hooks/useCheckMobile"
import HomepageCard from "./components/desktop/HomepageCard"
import CardStacker from "./components/CardStacker"
import TopIcons from "./components/TopIcons";

import Footer from "./components/Footer";
import SkillsCard from "./components/HomeCards/SkillsCard";
import MeCard from "./components/HomeCards/MeCard";
import AboutMeCard from "./components/HomeCards/AboutMeCard";
import LandingPage from "./components/mobile/LandingPage";

const App = () => {

  const isMobile = useCheckMobile()
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

  useEffect(() => {
    document.body.classList.add("overflow-x-hidden");
    return () => document.body.classList.remove("overflow-x-hidden");
  }, []);

  const left_card_x = useTransform(scrollY, [0, landingPageHeight], ["-12vmin","-150vmin"])
  const right_card_x = useTransform(scrollY, [0, landingPageHeight], ["12vmin","150vmin"])


  return (
    <div className="h-auto w-screen min-height-screen">
      {isMobile ? (
        <div ref={landingPageRef} className="relative  w-screen">
          <TopIcons />
          <div className="w-screen h-32"/>
          <LandingPage />

        </div>
      ) : (
        <div className="">
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
        </div>
      )}
      <div className="w-screen h-[50vh]"/>
      <CardStacker />
      <Footer/>
    </div>
  )
}

export default App