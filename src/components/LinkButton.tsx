function LinkButton({imgSrc, link, size = 10, title=""}: {imgSrc: string, link: string, size?: number, title?: string}) {
    return (
        <a href={link} target="_blank" rel="noreferrer" title={title}>
            <img src={imgSrc} style={{height: `${size/4}rem`, width: `${size/4}rem`}} /> 
        </a>
    )
}

export default LinkButton