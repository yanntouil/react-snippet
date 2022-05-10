
/**
 * Normalize Search term
 * @param {string} string 
 * @returns {string}
 */
const normalizeSearch = (string) => string
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    
export default normalizeSearch