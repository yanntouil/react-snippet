import React from 'react'
import useEventListener from './useEventListener'

/**
 * React hook for listening for clicks outside of a specified element (see useRef).
 * This can be useful for closing a modal, a dropdown menu etc.
 * @param {React.RefObject<HTMLElement>} ref 
 * @param {(event: MouseEvent) => void} handler 
 * @param {'mousedown' | 'mouseup'} [mouseEvent='mousedown'] 
 */
export default function useOnClickOutside(ref, handler, mouseEvent = 'mousedown') {
    useEventListener(mouseEvent, event => {
        const el = ref?.current
        if (!el || el.contains(event.target)) return
        handler(event)
    })
}