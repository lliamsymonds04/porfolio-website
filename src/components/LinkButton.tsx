function LinkButton({imgSrc, link, size = 10}: {imgSrc: string, link: string, size?: number}) {
    return (
        <a href={link} target="_blank" rel="noreferrer">
            <img src={imgSrc} style={{height: `${size/4}rem`, width: `${size/4}rem`}} /> 
        </a>
    )
}

export default LinkButton