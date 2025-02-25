import { useEffect, useState } from "react";
import AboutMeCard from "../HomeCards/AboutMeCard";
import MeCard from "../HomeCards/MeCard";
import SkillsCard from "../HomeCards/SkillsCard";
import TopIcons from "../TopIcons";

function Card({children, colour, index}: {children: React.ReactNode, colour: string, index: number}) {
    return (
        <div className={`sticky h-[90vmin] w-[90vmin] flex flex-col top-3 rounded-4xl bg-[${colour}] drop-shadow-2xl`} style={{top: `${index * 40 + 96}px`}}>
            {children}
        </div>
    )
}

function MobileLandingPage() {
    const cards = [AboutMeCard, MeCard, SkillsCard]

    const [dots, setDots] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((dots + 1) % 4)
        }, 300);
        return () => clearInterval(interval);
    }, [dots]);

    return (
            <div className="relative w-full flex flex-col items-center gap-14 h-fit mb-20">
                <div className="sticky top-0 w-[90%] h-20">
                    <TopIcons/>
                </div>
                {cards.map((card, index) => (
                    <Card key={index} colour={index % 2 === 0 ? "#FFBB00" : "#FFC936"} index={index}>
                        {card()}
                    </Card>
                ))}
            </div>
        
    );
}



export default MobileLandingPage;