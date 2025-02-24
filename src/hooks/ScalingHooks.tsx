import { useState, useEffect } from 'react';

function useCheckSize({size}: {size: number}) {
    const [width, setWidth] = useState(window.innerWidth);
    const handleWindowSizeChange = () => {
            setWidth(window.innerWidth);
    }

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);

    return (width <= size);
}

export function useCheckMobile() {
    return useCheckSize({size: 768});
}

export function useSmallerText() {
    return useCheckSize({size: 2500});
}