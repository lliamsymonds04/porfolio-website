import { useCheckMobile } from "../../hooks/ScalingHooks";

function AboutMeCard() {
    const isMobile = useCheckMobile();

    return (
        <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
            <h1 className="text-5xl text-white font-bold">Hey I'm Lliam!</h1>
            <p className="text-white italic text-lg ml-4 mb-5">
                yes with two L's
            </p>
            <p className={`text-[clamp(1rem,2vw,2rem)] text-white mb-5`}>
                I'm a third year <span className="font-bold">Computer Science</span> student at <span className="underline">UQ graduating 2025.</span>
            </p>
            <p className={`${isMobile ? "text-lg" : "text-2xl"} text-white mb-5 w-[80%]`}>
                I major in <span className="font-bold">Machine Learning</span> and have an interest in <span className="underline">data science</span>
            </p>
            <p className={`${isMobile ? "text-lg" : "text-2xl"} text-2xl text-white mb-5 w-[80%]`}>
                I am looking for a position in <span className="font-bold">Data Analytics</span> or <span className="font-bold">Software Engineering</span>
            </p>
        </div>
    )
}

export default AboutMeCard