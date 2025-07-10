import { useEffect } from "react";

import { useCheckMobile } from "./hooks/ScalingHooks"

import Footer from "./components/Footer";
import MobileLandingPage from "./components/mobile/MobileLandingPage";
import DesktopLandingPage from "./components/desktop/DesktopLandingPage";
import Projects from "./components/Projects";
import Skills from "./components/Skills";

const App = () => {
  const isMobile = useCheckMobile()

  useEffect(() => {
    document.body.classList.add("overflow-x-hidden");
    return () => document.body.classList.remove("overflow-x-hidden");
  }, []);


  return (
    <div className="h-auto w-screen min-height-screen">
      {isMobile ? (
        <MobileLandingPage />
      ) : <DesktopLandingPage/>}
      <Skills/>
      <Projects/>
      <Footer/>
    </div>
  )
}

export default App