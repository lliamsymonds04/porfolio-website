import React from "react";


function HomepageCard({children, className, style}: {children: React.ReactNode, className: string, style: React.CSSProperties}) {
    const size = 35;

    return (
        <div className={`${className} absolute rounded-3xl drop-shadow-2xl overflow-hidden`} style={{...style, ...{width: `${size + 4}vmin`, height: `${size}vmin`}}}>
            {children}
        </div>
    );
}


export default HomepageCard;