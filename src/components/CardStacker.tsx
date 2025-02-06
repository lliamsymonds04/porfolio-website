import { useRef, useState, useLayoutEffect } from "react";
import { useScroll, motion, useTransform, MotionValue } from "motion/react";


interface CardProps {
    scrollY: MotionValue<number>, 
    index: number,
    background: MotionValue<string>, 
    frameHeight: number,
    arrayLength: number
}


function Card({scrollY, index, background, frameHeight, arrayLength}: CardProps) {
    const lowerBound = Math.trunc(frameHeight * (index )/arrayLength);
    const upperBound = Math.trunc(frameHeight * (index + 2)/arrayLength);
    const scale = useTransform(scrollY, [lowerBound, upperBound], [0.5, 1-index*0.01]);

    return (<motion.div
        className="sticky rounded-3xl drop-shadow-lg w-[40vw] h-[45vh] shadow-2xl -translate-y-1/2 "
        style={{
            backgroundColor: background,
            top: `calc(50% - ${(arrayLength - index) * 25}px)`,
            scale: scale,
        }}
    >
        <div className="relative w-full h-full">
            
            <div className="absolute top-[2%] left-[5%]"> 
                <p className="text-4xl font-mono text-white font-bold">Project Name</p>
            </div>
        </div>
    </motion.div>)
}


function CardStacker() {
    const [frameHeight, setFrameHeight] = useState(0);
    const scrollFrameRef = useRef<HTMLDivElement | null>(null);


    const test_arr = [1, 2, 3, 4, 5];

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


    const background = useTransform(scrollY, [0, frameHeight], ["#FFBB00", "#FF9400"])   //FF4D00

    return (
        <div ref={scrollFrameRef} className="relative w-screen justify-center items-center flex flex-col gap-24">
            {test_arr.map((_, index) => (
                <Card key={index} scrollY={scrollY} frameHeight={frameHeight} arrayLength={test_arr.length} background={background} index={index}/>
            ))}
        </div>
    )
}

export default CardStacker;