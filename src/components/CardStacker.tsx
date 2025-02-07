import { useRef, useState, useLayoutEffect } from "react";
import { useScroll, motion, useTransform, MotionValue } from "motion/react";
import useCheckMobile from "../hooks/useCheckMobile";

import ProjectData from "../assets/ProjectData.json";
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

    return <div className="absolute top-[15%] right-[5%] w-[40%] h-[50%]">
        {imgSrc && <img
            src={imgSrc}
            alt="example"
            style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
            }}
        />}
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
    </div>
}


function Card({scrollY, index, background, frameHeight, arrayLength, data}: CardProps) {
    const isMobile = useCheckMobile();

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
            
            <div className="absolute top-[2%] left-[5%]"> 
                <p className="text-5xl font-mono text-white font-bold">{data.title}</p>
            </div>
            {isMobile ? 
                <div>

                </div>:
                <div className="relative h-full w-full">
                    <div className="absolute top-[15%] left-[5%] w-[45%]">
                        <p className="text-2xl font-mono text-white font-light text-left">{data.description}</p>
                    </div>
                    <CardMediaFrame data={data}/>
                </div>
            }
            <div className="absolute bottom-[5%] left-[5%] flex flex-row">
  
                {data.links.map((link, index) => (
                    <LinkButton key={index} imgSrc={LinkImages[link.name]} link={link.url} size={20}/>
                ))}
            </div>
        </div>
    </motion.div>)
}


function CardStacker() {
    const [frameHeight, setFrameHeight] = useState(0);
    const scrollFrameRef = useRef<HTMLDivElement | null>(null);

    const { scrollY } = useScroll({
        target: scrollFrameRef,
        offset: ["start end", "end end"]
    });


    // Get frame size
    useLayoutEffect(() => {
        if (scrollFrameRef.current) {
            setFrameHeight(scrollFrameRef.current.offsetHeight);
        }
    }, []);


    const background = useTransform(scrollY, [0, frameHeight], ["#FFBB00", "#FF9400"])

    return (
        <div ref={scrollFrameRef} className="relative w-screen justify-center items-center flex flex-col gap-52">
            {ProjectData.projects.map((projectData, index) => (
                <Card key={index} scrollY={scrollY} frameHeight={frameHeight} arrayLength={ProjectData.projects.length} background={background} index={index} data={projectData}/>
            ))}
        </div>
    )
}

export default CardStacker;