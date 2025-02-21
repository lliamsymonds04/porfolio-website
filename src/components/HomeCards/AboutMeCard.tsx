function AboutMeCard() {
    return (
        <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
            <h1 className="text-5xl text-white font-bold">Hey I'm Lliam!</h1>
            <p className="text-white italic text-lg ml-4 mb-10">yes with two L's</p>
            <p className="text-2xl text-white text-lef mb-5">I'm a third year <span className="font-bold">Computer Science</span> student at <span className="underline">UQ graduating 2025.</span></p>
            <p className="text-2xl text-white text-lef mb-5 w-[80%]">I major in <span className="font-bold">Machine Learning</span> and have an interest in <span className="underline">data science</span></p>
            <p className="text-2xl text-white text-lef mb-5 w-[80%]">I am looking for a position in <span className="font-bold">Data Analytics</span> or <span className="font-bold">Software Engineering</span></p>
        </div>
    )
}

export default AboutMeCard