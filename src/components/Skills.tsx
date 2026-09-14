import { allSkills } from "../data/skills";

/**
 * INTERIM — consumed the typed data layer in Phase 3; replaced by
 * SkillsPanel (grouped clusters) in Phase 7. Renders the flat chip list
 * exactly as before, now sourced from src/data/skills.ts instead of a
 * runtime fetch of /SkillsArray.json.
 */
function SkillTag({ skill }: { skill: string }) {
    return (
        <span className="inline-block bg-transparent text-accent border border-border rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
            {skill}
        </span>
    );
}

function Skills() {
    return (
        <div className="flex flex-col w-full items-center pb-32">
            <div className="text-3xl font-bold">
                My Skills
            </div>
            <div className="flex flex-wrap justify-center items-center gap-2 p-4 w-90% max-w-[50rem]">
                {allSkills.map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                ))}
            </div>
        </div>
    );
}

export default Skills;
