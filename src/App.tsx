import { useEffect } from "react";

import { useCheckMobile } from "./hooks/ScalingHooks"
import CardStacker from "./components/CardStacker"

import Footer from "./components/Footer";
import MobileLandingPage from "./components/mobile/MobileLandingPage";
import DesktopLandingPage from "./components/desktop/DesktopLandingPage";

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
      <div className="w-screen h-[50vh]"/>
      <CardStacker />
      <div className={`${isMobile ? "h-18" : "h-72"}`}/>
      <Footer/>
    </div>
  )
}

export default App