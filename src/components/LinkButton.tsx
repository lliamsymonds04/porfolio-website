function LinkButton({imgSrc, link}: {imgSrc: string, link: string}) {
    return (
        <a href={link} target="_blank" rel="noreferrer">
            <img src={imgSrc} className="h-10 w-10" /> 
        </a>
    )
}

export default LinkButton