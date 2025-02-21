import AboutMeCard from "../HomeCards/AboutMeCard";
import MeCard from "../HomeCards/MeCard";
import SkillsCard from "../HomeCards/SkillsCard";

function Card({children, colour, index}: {children: React.ReactNode, colour: string, index: number}) {
    return (
        <div className={`sticky h-[90vmin] w-[90vmin] flex flex-col top-3 rounded-4xl bg-[${colour}] drop-shadow-2xl`} style={{top: `${index * 40 + 96}px`}}>
            {children}
        </div>
    )
}

function LandingPage() {
    const cards = [AboutMeCard, MeCard, SkillsCard]
    return (
        <div className="relative w-full flex flex-col items-center bg-[#17141C] gap-18 h-fit mb-20">
            {cards.map((card, index) => (
                <Card key={index} colour={index % 2 === 0 ? "#FFBB00" : "#FFC936"} index={index}>
                    {card()}
                </Card>
            ))}
        </div>
    );
}



export default LandingPage;