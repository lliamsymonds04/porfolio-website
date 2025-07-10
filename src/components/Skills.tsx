import { useEffect, useState } from "react";

type SkillsData = {
    skills: string[];
}

function SkillTag({ skill }: { skill: string }) {
    return (
        <span className="inline-block bg-amber-400 text-gray-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
            {skill}
        </span>
    );
}

function Skills() {
    const [skillData, setSkillData] = useState<SkillsData>({skills: []});

    useEffect(() => {
        const fetchSkills = async () => {
            const response = await fetch('/SkillsArray.json');

            const data = await response.json();
            setSkillData(data);
            console.log("Skills fetched:", data);
        };
        fetchSkills();
    }, [])

    return (
        <div className="flex flex-col w-full items-center pb-32">
            <div className="text-3xl font-bold">
                My Skills
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 p-4 w-90% max-w-[50rem]">
                {skillData.skills.map((skill: string, index: number) => (
                    <SkillTag key={index} skill={skill} />
                ))}
            </div>
        </div>
        
    )
}

export default Skills;