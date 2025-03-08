function MeCard() {
    return (
        <div className="relative h-full w-[95%] flex flex-col top-3 left-5">
            <h1 className="text-5xl text-white font-bold">This is me:</h1>
            <div className="w-full h-[85%] flex flex-col justify-center items-center">

                <img src={'/PhotoOfMe.jpg'} alt="Photo of me" className="w-auto h-[90%] rounded-lg shadow-inner drop-shadow-lg" />
            </div>
        </div>
    )
}

export default MeCard;