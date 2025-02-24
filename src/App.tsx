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
import DesktopLandingPage from "./components/desktop/DesktopLandingPage";

const App = () => {
  const isMobile = useCheckMobile()

  useEffect(() => {
    document.body.classList.add("overflow-x-hidden");
    return () => document.body.classList.remove("overflow-x-hidden");
  }, []);


  return (
    <div className="h-auto w-screen min-height-screen">
      <TopIcons />
      {isMobile ? (
        <div className="relative  w-screen">
          <div className="w-screen h-32"/>
          <LandingPage />

        </div>
      ) : <DesktopLandingPage/>}
      <div className="w-screen h-[50vh]"/>
      <CardStacker />
      <Footer/>
    </div>
  )
}

export default App