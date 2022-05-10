import React, { useState, useRef } from "react"
import { useOnClickOutside } from "../app/hooks"
import geoportailService from "../services/geoportail"

/**
 * Form Address Autocomplete
 * @param {{
 *      address?: string, 
 *      setAddress?: React.Dispatch<string>,
 *      setError?: (error: 'api-error'|'geolocation-disabled'|'geolocation-unavailable'|'geolocation-permission-denied'|'geolocation-api-error') => {},
 *      placeholder?: string,
 *      name?: string,
 *      activeGeolocation?: boolean,
 * }} props
 * @returns {JSX.Element}
 */
const FormAddressAutocomplete = ({ address = '', setAddress = () => {}, setError = () => {}, placeholder = '', name = 'form-address-autocomplete', activeGeolocation = false }) => {

    /**
     * Field
     */
    const [ fieldValue, setFieldValue ] = useState(address)
    const fieldRef = useRef(null)
    const fieldChange = async ({ target }) => {
        setFieldValue(target.value)
        updateValue([], '')
        setGeolocation('off')
        setDropdown(true)
        try {
            const results = await geoportailService.prefillAddress(target.value, 20)
            setOptions(results)
            const option = results.find(option => option.value === target.value)
            if (option) updateValue(option.coordinates, option.value)
        } catch (error) {
            setError('api-error')
        }
    }

    const updateValue = (coordinates, address) => {
        setAddress({ coordinates, address })
    }

    /**
     * Options
     */
    const optionsRef = useRef([])
    const [ options, setOptions ] = useState([])
    const selectOption = (option) => {
        setFieldValue(option.label)
        updateValue(option.coordinates, option.value)
        fieldRef?.current?.focus()
        setHoveredOption(-1)
        setDropdown(false)
    }

    /**
     * Dropdown
     */
    const [ dropdown, setDropdown ] = useState(false)
    const blurRef = useRef(null)
    const dropdownRef = useRef(null)
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
        scrollTo(Math.max(0, index))
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
     * Geolocation
     */
    const [ geolocation, setGeolocation ] = useState('off') 
    const geolocationError = (error) => {
        setGeolocation(error)
        setError('geolocation-' + error)
    }
    const onClickGeolocation = () => {
        setGeolocation('pending')
        if (!('geolocation' in navigator)) return geolocationError('disabled')
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                const location = await geoportailService.coordsAddress(coords)
                if (!location) return geolocationError('unavailable')
                setGeolocation('on')
                setFieldValue(location.address)
                updateValue(location.coordinates, location.address)
            } catch (error) {
                geolocationError('api-error')
            }
        }, (error) => geolocationError(error.code === 1 ? 'permission-denied' : 'unavailable'))
    }

    /**
     * Render
     */
    return (
        <div 
            className="relative flex w-full h-16" 
            ref={blurRef}
        >
            <label 
                htmlFor={name}
                className="absolute inset-y-0 left-0 flex justify-center items-center aspect-square" 
            >
                <svg className="h-6 w-6 fill-current text-neutral-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path d="M433.938 46.082C424.768 36.893 412.471 31.998 399.973 32C393.86 32 387.696 33.172 381.83 35.584L29.832 179.576C8.598 188.264 -3.527 210.762 0.91 233.262C5.332 255.791 25.067 272.01 48.004 272.01H208.002V432.002C208.002 456.002 227.178 480 256.018 480C275.19 480 292.94 468.469 300.424 450.189L444.422 98.205C451.75 80.301 447.61 59.738 433.938 46.082ZM414.805 86.09L270.811 438.064C268.338 444.1 262.534 448 256.018 448C245.092 448 240.002 438.453 240.002 432.002V240.01H48.004C40.379 240.01 33.78 234.58 32.305 227.07C30.832 219.6 34.887 212.082 41.948 209.193L394 65.18C395.903 64.396 397.914 64 399.977 64C404.194 64 408.315 65.707 411.325 68.723C415.889 73.283 417.256 80.1 414.805 86.09Z"/>
                </svg>
                <span className="sr-only">{placeholder}</span>
            </label>
            <input 
                type="text" 
                id={name}
                name={name}
                className={`grow h-full pl-16 leading-4 bg-white shadow placeholder:text-neutral-500 text-lg ${activeGeolocation ? 'pr-16' : 'pr-4'}`}
                placeholder={placeholder}
                autoComplete="off"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={dropdown ? 'true' : 'false'}
                aria-owns={name + '-listbox'}
                aria-controls={name + '-listbox'}
                aria-autocomplete="list"
                ref={fieldRef}
                onKeyDown={manageKeyboard}
                onBlur={({ relatedTarget }) => !blurRef?.current?.contains(relatedTarget) && setDropdown(false)}
                value={fieldValue}
                onChange={fieldChange}
                onFocus={() => setDropdown(true)}
            />
            {activeGeolocation && (
                <button 
                    className={`absolute inset-y-0 right-0 flex justify-center items-center aspect-square`}
                    type="button"
                    onClick={onClickGeolocation}
                    onFocus={() => setDropdown(false)}
                >
                    <span 
                        className={`${(geolocation === 'pending') ? 'text-sky-500 animate-pulse' : (geolocation === 'off') ? 'text-neutral-500' : (geolocation === 'on') ? 'text-lime-500' : 'text-red-500'}`} 
                        aria-hidden="true"
                    >
                        {(geolocation === 'disabled' || geolocation === 'permission-denied') ? (
                            <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                                <path d="M303.769 161.637L415.369 249.746C412.086 199.717 370.857 160 320 160C314.441 160 309.07 160.729 303.769 161.637ZM320 96C408.25 96 480 167.75 480 256C480 269.979 477.631 283.301 474.25 296.232L501.117 317.443C506.057 302.902 509.93 287.877 511.25 272H560C568.801 272 576 264.799 576 256C576 247.199 568.801 240 560 240H511.25C503.5 146.75 429.25 72.5 336 64.75V16C336 7.199 328.801 0 320 0C311.201 0 304 7.199 304 16V64.75C272.494 67.369 243.494 78.078 218.158 94.047L245.217 115.41C267.639 103.43 292.842 96 320 96ZM320 416C231.75 416 160 344.25 160 256C160 242.018 162.371 228.689 165.754 215.754L138.889 194.545C133.945 209.088 130.07 224.119 128.75 240H80C71.201 240 64 247.199 64 256C64 264.799 71.201 272 80 272H128.75C136.5 365.25 210.75 439.5 304 447.25V496C304 504.799 311.201 512 320 512C328.801 512 336 504.799 336 496V447.25C367.51 444.631 396.517 433.918 421.855 417.945L394.797 396.582C372.371 408.566 347.164 416 320 416ZM336.25 350.361L224.629 262.236C227.904 312.275 269.137 352 320 352C325.566 352 330.943 351.271 336.25 350.361ZM633.908 483.438L25.904 3.42C18.998 -2.033 8.935 -0.83 3.435 6.061C-2.033 12.998 -0.846 23.062 6.092 28.547L614.096 508.563C617.033 510.875 620.533 512 624.002 512C628.721 512 633.408 509.906 636.564 505.922C642.033 498.984 640.846 488.922 633.908 483.438Z"/>
                            </svg>
                        ) : (
                            <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path d="M256 160C203 160 160 203 160 256S203 352 256 352S352 309 352 256S309 160 256 160ZM256 320C220.75 320 192 291.25 192 256S220.75 192 256 192S320 220.75 320 256S291.25 320 256 320ZM496 240H447.25C439.5 146.75 365.25 72.5 272 64.75V16C272 7.199 264.801 0 256 0C247.201 0 240 7.199 240 16V64.75C146.75 72.5 72.5 146.75 64.75 240H16C7.201 240 0 247.199 0 256C0 264.799 7.201 272 16 272H64.75C72.5 365.25 146.75 439.5 240 447.25V496C240 504.799 247.201 512 256 512C264.801 512 272 504.799 272 496V447.25C365.25 439.5 439.5 365.25 447.25 272H496C504.801 272 512 264.799 512 256C512 247.199 504.801 240 496 240ZM256 416C167.75 416 96 344.25 96 256S167.75 96 256 96S416 167.75 416 256S344.25 416 256 416Z"/>
                            </svg>
                        )}
                    </span>
                    <span className="sr-only">geolocation</span>
                </button>
            )}
            {dropdown && (
                <ul 
                    className="absolute z-20 top-full inset-x-0 max-h-48 overflow-y-auto scrollbar bg-white shadow-md"
                    role="listbox"
                    id={name + '-listbox'}
                    ref={dropdownRef}
                >
                    {options.map(( option, index ) => (
                        <li 
                            key={`${name}-${index}`}
                            role="option"
                            aria-selected={option.label === fieldValue ? 'true' : 'false'}
                            className={`relative flex items-center w-full h-16 cursor-pointer ${index === hoveredOption ? 'bg-sky-50' : '' }`}
                            tabIndex="-1"
                            ref={(el) => optionsRef.current[index] = el}
                            onClick={() => selectOption(option)}
                            onMouseEnter={() => setHoveredOption(index)}
                            onMouseLeave={() => setHoveredOption(-1)}
                        >
                            <span className="flex justify-center items-center h-full aspect-square text-neutral-600" aria-hidden="true">
                                <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                    <path d="M192 0C85.969 0 0 85.969 0 192C0 269.41 26.969 291.035 172.281 501.676C177.047 508.559 184.523 512 192 512S206.953 508.559 211.719 501.676C357.031 291.035 384 269.41 384 192C384 85.969 298.031 0 192 0ZM192 473.918C51.932 271.379 32 255.969 32 192C32 103.777 103.775 32 192 32S352 103.777 352 192C352 255.879 332.566 270.674 192 473.918ZM192 112C147.818 112 112 147.816 112 192S147.818 272 192 272C236.184 272 272 236.184 272 192S236.184 112 192 112ZM192 240C165.533 240 144 218.467 144 192S165.533 144 192 144S240 165.533 240 192S218.467 240 192 240Z"/>
                                </svg>
                            </span>
                            <span className="grow overflow-hidden pr-4 truncate text-ellipsis text-neutral-600 leading-8 text-left text-lg">
                                {option.label}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default FormAddressAutocomplete