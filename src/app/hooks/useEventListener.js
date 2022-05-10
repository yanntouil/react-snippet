import React, { useEffect, useRef } from 'react'

/**
 * Use EventListener with simplicity by React Hook. It takes as parameters a eventName, 
 * a call-back functions (handler) and optionally a reference element. 
 * You can see above two examples using useRef and window based event.
 * @param {keyof WindowEventMap | keyof HTMLElementEventMap} eventName 
 * @param {(WindowEventMap | HTMLElementEventMap | Event)=>void} handler 
 * @param {React.RefObject<HTMLElement | void>} [element=void]
 */
export default function useEventListener(eventName, handler, element) {
    const savedHandler = useRef()
    useEffect(() => {
        const targetElement = element?.current || window
        if (!(targetElement && targetElement.addEventListener)) return
        if (savedHandler.current !== handler) savedHandler.current = handler
        const eventListener = event => {
            // eslint-disable-next-line no-extra-boolean-cast
            if (!!savedHandler?.current) savedHandler.current(event)
        }
        targetElement.addEventListener(eventName, eventListener)
        return () => {
            targetElement.removeEventListener(eventName, eventListener)
        }
    }, [eventName, element, handler])
}