import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useScroll, motion, useTransform, MotionValue } from "motion/react";
import { useSmallerText, useCheckMobile } from "../hooks/ScalingHooks";

import LinkButton from "./LinkButton";

interface CardDataProps {
    title: string,
    description: string,
    links: { name: string; url: string; }[],
    image?: string,
    youtube?: string,
    gif?: string,
}

interface CardProps {
    scrollY: MotionValue<number>, 
    index: number,
    background: MotionValue<string>, 
    frameHeight: number,
    arrayLength: number,
    data: CardDataProps,
}

const LinkImages: { [key: string]: string } = {
    "Github": "https://img.icons8.com/ios11/512/FFFFFF/github.png",
    "Website": "https://img.icons8.com/?size=100&id=69543&format=png&color=FFFFFF"
}

function CardMediaFrame({data}: {data: CardDataProps}) {
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

    return (<div className="w-full h-full">
        {imgSrc && <a href={webLink} target="_blank" rel="noreferrer" title={data.title}>
            <img
                src={imgSrc}
                alt="example"
                style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                }}
            />
        </a>}
        {data.youtube && <iframe
            src={`https://www.youtube.com/embed/${data.youtube}`}
            title={data.title}
            allowFullScreen
            style={{
                width: "100%",
                height: "100%",
                border: "none",
            }}
        />}
    </div>)
}


function Card({scrollY, index, background, frameHeight, arrayLength, data}: CardProps) {
    const isMobile = useCheckMobile();
    const isSmallerText = useSmallerText();

    const lowerBound = Math.trunc(frameHeight * (index )/arrayLength);
    const upperBound = Math.trunc(frameHeight * (index + 2)/arrayLength);
    const scale = useTransform(scrollY, [lowerBound, upperBound], [0.5, 1-index*0.01]);

    return (<motion.div
        className="sticky rounded-3xl drop-shadow-lg shadow-2xl -translate-y-1/2 "
        style={{
            backgroundColor: background,
            top: `calc(50% - ${(arrayLength - index) * 25}px)`,
            scale: scale,
            width: isMobile ? "90vw": "40vw",
            height: isMobile ? "70vh": "45vh",
        }}
    >
        <div className="relative w-full h-full">
            {isMobile ? 
                <div className="absolute h-full flex flex-col items-center gap-8 w-[90%] left-1/2 top-[2%] -translate-x-1/2">
                    <p className="text-5xl font-mono text-white font-bold text-center">{data.title}</p>
                    <p className="text-xl font-mono text-white font-light text-center">{data.description}</p>
                    <div className="w-[80vmin] h-[45vmin]">
                        <CardMediaFrame data={data}/>                
                    </div>
                </div>:
                <div className="relative h-full w-full">
                    <div className="absolute top-[2%] left-[5%]"> 
                        <p className="text-5xl font-mono text-white font-bold">{data.title}</p>
                    </div>
                    <div className="absolute top-[15%] left-[5%] w-[45%]">
                        <p className={`font-mono text-white font-light text-left ${isSmallerText ? "text-xl" : "text-2xl"}`}>
                            {data.description}
                        </p>
                    </div>
                    <div className="absolute top-[15%] right-[5%] w-[40%] h-[50%]" >
                        <CardMediaFrame data={data}/>
                    </div>
                </div>
            }
            <div className="absolute bottom-[5%] left-[5%] flex flex-row">
                {data.links.map((link, index) => (
                    <LinkButton key={index} imgSrc={LinkImages[link.name]} link={link.url} size={isSmallerText ? 15 : 20}/>
                ))}
            </div>
        </div>
    </motion.div>)
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

function CardStacker() {
    const [frameHeight, setFrameHeight] = useState(0);
    const scrollFrameRef = useRef<HTMLDivElement | null>(null);

    const { scrollY } = useScroll({
        target: scrollFrameRef,
        offset: ["start end", "end end"]
    });

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

    // Get frame size
    useLayoutEffect(() => {
        function updateHeight() {
            if (scrollFrameRef.current) {
                setFrameHeight(scrollFrameRef.current.offsetHeight);
            }
        }

        updateHeight(); // Initial height set

        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);


    const background = useTransform(scrollY, [0, frameHeight], ["#FFBB00", "#FF9400"])

    return (
        <div ref={scrollFrameRef} className="relative w-screen justify-center items-center flex flex-col gap-52">
            {projectData.projects.map((data, index) => (
                <Card key={index} scrollY={scrollY} frameHeight={frameHeight} arrayLength={projectData.projects.length} background={background} index={index} data={data}/>
            ))}
        </div>
    )
}

export default CardStacker;