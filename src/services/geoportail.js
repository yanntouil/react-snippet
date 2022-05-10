




const api = 'https://apiv3.geoportail.lu/'

/**
 * getFeatureCoordinates
 * @param {{ 
 *      geometry: { 
 *          type: 'Point'|'Polygon'|string, 
 *          coordinates: [number, number]|[number, number][] 
 *      } 
 * }} feature 
 * @returns 
 */
const getFeatureCoordinates = ({ geometry }) => {
    if (geometry.type === 'Point') return geometry.coordinates
    if (geometry.type === 'Polygon') return geometry.coordinates[0][0]
    return []
}

/**
 * prefillAddress
 * @async
 * @param {string} query 
 * @param {number} [limit=5] 
 * @returns {Promise<{
 *      label: string, 
 *      value: string, 
 *      coordinates: number[] 
 * }[]>}
 */
const prefillAddress = async (query, limit = 5) => {
    const queryString = encodeURIComponent(query)
    return fetch(`${api}fulltextsearch?limit=${limit}&layer=Adresse&query=${queryString}`)
        .then(response => response.json())
        .then(data => data.features.map(feature => ({
                label: feature.properties.label,
                value: feature.properties.label,
                coordinates: getFeatureCoordinates(feature)
            }))
        )
}

/**
 * postcodeCoord
 * @async
 * @param {string} postcode 
 * @returns {Promise<{
 *      location: string, 
 *      coordinates: [number, number] 
 * }|null>}
 */
const postcodeCoord = async (postcode) => {
    const queryString = encodeURIComponent(postcode)
    return fetch(`${api}geocode/search?zip=${queryString}`)
        .then(response => response.json())
        .then(({ results }) => !!results[0].geom ? {
                coordinates: results[0].geomlonlat.coordinates,
                location: 'L-'+ results[0].address.split(',')[0], 
            } : null
        )
}

/**
 * prefillCity
 * @async
 * @param {string} postcode 
 * @returns {Promise<{
 *      address: string, 
 *      coordinates: [number, number] 
 * }|null>}
 */
const prefillCity = async (query, limit = 5) => {
    const queryString = encodeURIComponent(query)
    return fetch(`${api}fulltextsearch?limit=${limit}&query=${queryString}`)
        .then(response => response.json())
        .then(({ features }) => features
            .filter(feature => feature.properties.layer_name === 'Localité')
            .map(feature => ({
                label: feature.properties.label,
                value: feature.properties.label,
                coordinates: getFeatureCoordinates(feature)
            }))
        )
}

/**
 * coordsAddress
 * @async
 * @param {[number, number]} coordinates 
 * @returns {Promise<{
 *      coordinates: [number, number];
 *      address: string;
 * }>}
 */
const coordsAddress = async (coordinates) => {
    return fetch(`${api}geocode/reverse?lon=${coordinates.longitude}&lat=${coordinates.latitude}`)
        .then(response => response.json())
        .then(({ results }) => (results.length === 0) ? null : {
            coordinates: results[0].geomlonlat.coordinates,
            address: getAddressFromLocation(results[0])
        })
}

/**
 * getAddressFromLocation
 * @param {{ number: number, street: string, postal_code: string, locality: string }} location 
 * @returns {string}
 */
const getAddressFromLocation = (location) => `${location.number}, ${location.street}, L-${location.postal_code} ${location.locality}`

/**
 * Geoportail Service
 */
const geoportail = {
    get api() { return api },
    prefillAddress,
    prefillCity,
    coordsAddress,
    postcodeCoord,
    getAddressFromLocation,
}
export default geoportail