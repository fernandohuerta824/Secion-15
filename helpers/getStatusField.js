/**
 * 
 * @param {string|null} field 
 * @param {ValidationError[]} errors
 * @returns {{error: {msg: string}|null, class: string}}
 */
module.exports = (field = '', errors = null) => {
    if(!errors || !field) return {error: null, class: ''}
    let msg = '';
    return errors.some(e => {
        if(e.path === field) {
            msg = e.msg;
            return true;
        }
    }) ? {error: {msg}, class: 'form-control--error'} : {error: null, class: 'form-control--valid'}
    
    
}