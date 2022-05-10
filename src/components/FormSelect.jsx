import React, { useState, useRef, useEffect } from "react"
import { useOnClickOutside } from "../app/hooks"

/**
 * Form Address Autocomplete
 * @param {{
 *      value: string, 
 *      setValue: React.Dispatch<string>,
 *      options: { label: string, value: string|number, icon?: JSX.Element }[],
 *      placeholder?: string,
 *      name?: string,
 *      label?: boolean,
 *      clear?: boolean,
 * }} props
 * @returns {JSX.Element}
 */
const FormSelect = ({ value, setValue, options, placeholder = '', name = 'form-select', label, clear = false}) => {

    /**
     * Button
     */
    const buttonRef = useRef(null)
    const [ buttonLabel, setButtonLabel ] = useState('')
    const [ buttonHover, setButtonHover ] = useState(false)
    useEffect(() => {
        const option = options.find(option => option.value === value)
        setButtonLabel(option ? option.label : '')
    }, [options, value])

    /**
     * Options
     */
    const optionsRef = useRef([])
    const selectOption = (option) => {
        setValue(option.value)
        buttonRef?.current?.focus()
        setHoveredOption(-1)
        setDropdown(false)
        setButtonHover(false)
    }

    /**
     * Dropdown
     */
    const [ dropdown, setDropdown ] = useState(false)
    const blurRef = useRef(null)
    const dropdownRef = useRef(null)
    useEffect(() => {
        const index = options.findIndex(option => option.value === value)
        setHoveredOption(index)
        scrollTo(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ dropdown ])
    useOnClickOutside(blurRef, () => setDropdown(false))
 
    /**
     * Keyboard
     */
    const [ hoveredOption, setHoveredOption ] = useState(-1)
    const manageKeyboard = (e) => {
        if (!['Escape', 'Enter', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
        if (e.key === 'Escape') return setDropdown(false)
        if (e.key === 'Enter') {
            if (options[hoveredOption]) {
                e.preventDefault()
                return selectOption(options[hoveredOption])
            } else return
        }
        setDropdown(true)
        // Navigation
        e.preventDefault()
        let index = hoveredOption
        if (e.key === "ArrowDown") index = (index + 1 === options.length) ? 0 : index + 1
        else if (e.key === "ArrowUp") index = (index - 1 < 0) ? options.length -1 : index - 1
        setHoveredOption(Math.max(0, index))
        scrollTo(index)
    }

    /**
     * Scroll
     */
    const scrollTo = (index) => {
        const refD = dropdownRef.current
        const refO = optionsRef.current[index]
        if (refO?.offsetTop < refD?.scrollTop) refD.scrollTop = refO.offsetTop
        else if ((refO?.offsetTop + refO?.offsetHeight) > (refD?.scrollTop + refD?.offsetHeight)) refD.scrollTop = refO.offsetTop + refO.offsetHeight - refD.offsetHeight
    }

    /**
     * Render
     */
    return (
        <div 
            className="relative flex w-full h-16" 
            ref={blurRef}
            onMouseOver={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
        >
            <button 
                className={`flex items-stretch grow h-16 leading-4 bg-white shadow text-lg text-left ${label ? '' : 'pl-4'}`}
                type="button"
                aria-haspopup="true"
                aria-expanded={dropdown ? 'true' : 'false'}
                aria-controls={name}
                ref={buttonRef}
                onKeyUp={manageKeyboard}
                onClick={() => setDropdown(!dropdown)}
            >
                {!!label && (
                    <span className="flex justify-center items-center aspect-square text-neutral-500" aria-hidden="true">
                        {label}
                    </span>
                )}
                <span className={`flex items-center grow truncate text-ellipsis ${value ? '' : 'text-neutral-500'  }`}>
                    {value ? buttonLabel : placeholder  }
                </span>
                <span className={`flex justify-center items-center aspect-square`} aria-hidden="true">
                    <svg className={`w-4 h-4 fill-current transition-transform duration-300 ease-in-out ${dropdown ? 'rotate-180' : 'rotate-0'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M362.71 203.889L202.719 347.898C196.594 353.367 187.407 353.367 181.282 347.898L21.292 203.889C14.729 197.982 14.198 187.857 20.104 181.295C26.376 174.377 36.499 174.512 42.729 180.107L192.001 314.475L341.272 180.107C347.866 174.23 357.96 174.746 363.897 181.295C369.803 187.857 369.272 197.982 362.71 203.889Z"/>
                    </svg>
                </span>
            </button>
            { !!value && clear && (buttonHover || dropdown) && (
                <button 
                    className={`absolute inset-y-0 right-16 flex justify-center items-center w-16 h-16`}
                    type="button"
                    onClick={() => setValue('')}
                >
                    <svg className="w-4 h-4 fill-current" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M315.31 411.31C309.056 417.563 298.936 417.563 292.682 411.31L160 278.627L27.318 411.31C21.064 417.563 10.944 417.563 4.69 411.31C-1.563 405.056 -1.563 394.936 4.69 388.682L137.373 256L4.69 123.318C-1.563 117.064 -1.563 106.944 4.69 100.69C10.944 94.437 21.064 94.437 27.318 100.69L160 233.373L292.682 100.69C298.936 94.437 309.056 94.437 315.31 100.69C321.563 106.944 321.563 117.064 315.31 123.318L182.627 256L315.31 388.682C321.563 394.936 321.563 405.056 315.31 411.31Z"/>
                    </svg>
                    <span className="sr-only">remove selected option</span>
                </button>
            )}
            {dropdown && (
                <ul 
                    className="absolute z-20 top-full inset-x-0 max-h-48 overflow-y-auto scrollbar bg-white shadow-md" 
                    role="listbox"
                    id={name}
                    ref={dropdownRef}
                >
                    {options.map(( option, index ) => (
                        <li 
                            key={`${name}-${index}`} 
                            role="option" 
                            aria-selected={option.value === value ? 'true' : 'false'}
                            className={`relative flex items-center w-full h-16 cursor-pointer ${
                                option.value === value ? 'font-medium' : ''
                            } ${
                                index === hoveredOption && option.value === value ? 'bg-sky-50 text-sky-700' : 
                                option.value === value ? 'text-sky-600' : 
                                index === hoveredOption ? 'bg-sky-50 text-neutral-700' : 
                                'text-neutral-600'
                            }`}
                            tabIndex="-1"
                            ref={(el) => optionsRef.current[index] = el}
                            onClick={() => selectOption(option)}
                            onMouseEnter={() => setHoveredOption(index)}
                            onMouseLeave={() => setHoveredOption(-1)}
                        >
                            {!!option.icon ? (
                                <span className="inset-y-0 left-0 flex justify-center items-center w-16" aria-hidden="true">
                                    {option.icon}
                                </span>
                            ) : (
                                <span className="inset-y-0 left-0 flex justify-center items-center w-16" aria-hidden="true">
                                    {option.value === value && (
                                        <svg className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path d="M475.312 123.312L203.312 395.312C200.188 398.438 196.094 400 192 400S183.812 398.438 180.688 395.312L36.688 251.312C30.438 245.062 30.438 234.937 36.688 228.688S53.063 222.438 59.312 228.688L192 361.375L452.687 100.688C458.937 94.438 469.063 94.438 475.312 100.688S481.562 117.062 475.312 123.312Z"/>
                                        </svg>
                                    )}
                                </span>
                            )}
                            <span className={`grow overflow-hidden pr-4 truncate text-ellipsis leading-8 text-left text-lg`}>
                                {option.label}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default FormSelect