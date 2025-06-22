import { useState, useRef } from 'react';

import TopIcons from '../TopIcons';

function DesktopLandingPage() {
    return (
        <div className = "h-screen w-screen flex">
            <TopIcons/>

            <div className='flex flex-row justify-center items-center absolute top-1/4 px-96 left-1/2 -translate-x-1/2 w-max'>
                <div className='flex flex-col justify-start items-start w-[50%] pr-32'>
                    <div className = 'text-[#FFBB00] text-[clamp(0.6rem,1vw,1.2rem)] -mb-6 ml-2'>
                        Hi, my name is
                    </div>
                    <div className='text-[#FFC936] text-[clamp(6.5rem,1vw,10rem)]'>
                        Lliam Symonds
                    </div>
                    <div className = 'text-[#FFBB00] text-[clamp(3rem,1vw,6rem)] leading-tight pb-6'>
                        Machine Learning and Software Engineer
                    </div> 
                    <div className='text-[clamp(1.5rem,1vw,3rem)]' style={{color:'rgba(255,255,255,0.85'}}>
                        Im a computer science student at UQ graduating in 2025 majoring in Machine Learning
                    </div>
                </div>

                <img src={'/PhotoOfMe.jpg'} alt="Photo of me" className="w-[30%] h-auto rounded-full shadow-inner drop-shadow-lg" />
            </div>
            
        </div>
    );
}

export default DesktopLandingPage;