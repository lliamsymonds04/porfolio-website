import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useScroll, useTransform, motion } from "motion/react";

import useCheckMobile from "./hooks/useCheckMobile"
import HomepageCard from "./components/desktop/HomepageCard"
import CardStacker from "./components/CardStacker"
import TopIcons from "./components/desktop/TopIcons";

import Footer from "./components/Footer";

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

  const skills = ["Python", "SQL", "Typescript", "React + Tailwind", "Git Tooling"]

  return (
    <div className="h-auto w-screen bg-[#17141C]">
      {isMobile ? (
        <div>mobile</div>
      ) : (
        <div className="">
          <div ref={landingPageRef} className="relative h-screen w-screen" >
            <TopIcons />

            <motion.div className="absolute z-10 bottom-[55%] right-1/2" style={{x: left_card_x, width: `39vmin`, height: `35vmin`}}>
              <HomepageCard className="bg-[#FFBB00] h-full w-full" style={{}}>
                <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
                  <h1 className="text-5xl text-white mb-3 font-bold ">I have skills in<span className="animate-cursor">...</span></h1>
                  {skills.map((v) => <div className="flex flex-row gap-2 ml-4">
                    <div className="rounded-full h-3 w-3 bg-white mt-4"/>
                    <p className="text-3xl text-white text-left mb-5 font-serif">{v}</p>
                  </div>)}
                </div>
              </HomepageCard>
            </motion.div>

            <HomepageCard className="z-10 -translate-x-1/2 -translate-y-1/2 bg-[#FFC936]" style={{top: "45%", left: "50%"}}>
              <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
                  <h1 className="text-5xl text-white font-bold">Hey I'm Lliam<span className="animate-cursor">!</span></h1>
                  <p className="text-white italic text-lg ml-4 mb-10">yes with two L's</p>
                  <p className="text-2xl text-white text-lef mb-5">I'm a third year <span className="font-bold">Computer Science</span> student at <span className="underline">UQ graduating 2025.</span></p>
                  <p className="text-2xl text-white text-lef mb-5 w-[80%]">I major in <span className="font-bold">Machine Learning</span> and have an interest in <span className="underline">data science</span></p>
                  <p className="text-2xl text-white text-lef mb-5 w-[80%]">I am looking for a position in <span className="font-bold">Data Analytics</span> or <span className="font-bold">Software Engineering</span></p>
                </div>
            </HomepageCard>
            
            <motion.div className="absolute z-10 top-[45%] left-1/2" style={{x: right_card_x, width: `39vmin`, height: `35vmin`}}>
              <HomepageCard className="z-10 bg-[#FFBB00]" style={{}}>
                <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
                  <h1 className="text-5xl text-white  font-bold">This is me:</h1>
                </div>
              </HomepageCard>
            </motion.div>
          </div>

          <div className="w-screen h-[50vh]"/>
          <CardStacker />
          <div className="w-screen h-56"/>
          <Footer/>
        </div>
      )}
      
    </div>
  )
}

export default App