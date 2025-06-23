import { useEffect, useState } from "react";
import YouTube from 'react-youtube';

import MyProjectsTag from "./MyProjectsTag";
import LinkButton from "./LinkButton";

const LinkImages: { [key: string]: string } = {
    "Github": "https://img.icons8.com/ios11/512/FFFFFF/github.png",
    "Website": "https://img.icons8.com/?size=100&id=69543&format=png&color=FFFFFF"
}

type ProjectProps = {
    title: string,
    description: string,
    links: { name: string; url: string; }[],
    image?: string,
    youtube?: string,
    gif?: string,
}

type ProjectDataProps = {
    projects: ProjectProps[]
}

function MediaFrame({data}: {data: ProjectProps}) {
    let imgSrc: string | null = null
    if (data.gif) {
        imgSrc = data.gif
    } else if (data.image) {
        imgSrc = data.image
    }

    let webLink = "null"
    data.links.forEach(link => {
        if (link.name === "Website") {
            webLink = link.url
        }
    })

    return (
        <div className="flex w-full h-auto">
            {imgSrc && (
                <a href={webLink} target="_blank" rel="noreferrer" title={data.title} className="bottom-0 flex">
                    <img
                        src={imgSrc}
                        alt="example"
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "contain",
                        }}
                    />
                </a>
            )}
            
            {data.youtube && (
                <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <YouTube
                        videoId={data.youtube}
                        title={data.title}
                        className="w-full h-full"
                        opts={{
                            width: "100%",
                            height: "100%",
                            playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            },
                        }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function Dots({ count }: { count: number }) {
    return (
        <div className="flex flex-row gap-3 align-center justify-center mt-4 mb-8">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="w-3 h-3 bg-[#FFC936] rounded-full" />
            ))}
        </div>
    );
}

function ProjectCard({ data }: { data: ProjectProps }) {
    return (
        <div className="w-[85%] max-w-[40rem] mb-10">
            <h1 className="text-4xl font-bold mb-2">{data.title}</h1>
            <MediaFrame data={data} />
            <p className="text-lg mb-4">{data.description}</p>

            <div className="flex flex-row gap-2 align-center justify-center">
                {data.links.map((link, index) => (
                    <LinkButton
                        key={index}
                        title={link.name}
                        link={link.url}
                        size={12}
                        imgSrc={LinkImages[link.name] || ""}
                    />
                ))}
            </div>
            <Dots count={5} />
        </div>
    )
}

function Projects() {
    const [projectData, setProjectData] = useState<ProjectDataProps>({projects: []});

    useEffect(() => {
        fetch("/ProjectData.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((jsonData) => setProjectData(jsonData))
        .catch((error) => console.error("Error fetching the JSON:", error));
    }, []);
    return (
        <div className="flex flex-col items-center justify-center w-full h-auto">
            <MyProjectsTag />
            {projectData.projects.map((data, index) => (
                <ProjectCard key={index} data={data}/>
            ))}
        </div>
    )

}

export default Projects;