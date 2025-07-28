import TopIcons from '../TopIcons';

function MobileLandingPage() {
    return (
        <div className = "flex h-fit w-screen justify-center mb-20">
            <TopIcons/>

            <div className='flex flex-col justify-start items-start w-[90%] mt-20'>
                
                <div className='flex flex-col justify-center items-center w-full'>
                    <div className = 'text-[#FFBB00] text-[clamp(1rem,2vw,1.2rem)] -mb-2 ml-2'>
                        Hi, my name is
                    </div>
                    <div className='text-[#FFC936] text-[clamp(3rem,2vw,5rem)] mb-4'>
                        Lliam Symonds
                    </div>
                    <img src={'/PhotoOfMe.jpg'} alt="Photo of me" className="w-[60%] h-auto rounded-4xl shadow-inner drop-shadow-lg" />
                </div>
                <div className = 'text-[#FFBB00] text-[clamp(3rem,1vw,6rem)] leading-tight pb-6'>
                    Fullstack and Machine Learning Engineer
                </div> 
                <div className='text-[clamp(1.5rem,1vw,3rem)]' style={{color:'rgba(255,255,255,0.85'}}>
                    Im a computer science student at UQ graduating in 2025 majoring in Machine Learning
                </div>

            </div>
            
        </div>
    );
}

export default MobileLandingPage;