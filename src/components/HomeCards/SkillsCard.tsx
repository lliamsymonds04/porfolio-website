import { useCheckMobile } from "../../hooks/ScalingHooks"

const skills = ["Python & Backend", "SQL", "Typescript", "React + Tailwind", "Git Tooling"]



function SkillsCard() {
    const isMobile = useCheckMobile();

    return (
        <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
            <h1 className={`${isMobile ? "text-4xl" : "text-5xl"} text-white mb-3 font-bold `}>I have skills in<span className="animate-cursor">...</span></h1>
            {skills.map((v, index) => 
                <div className="flex flex-row ml-4 items-center" key={index}>
                    <div className="flex rounded-full h-2 w-2 bg-white mr-3"/>
                    <p className={`${isMobile ? "text-xl" : "text-3xl"} text-white text-left mb-5 font-bold`}>{v}</p>
                </div>)
            }
        </div>
    )
}


export default SkillsCard