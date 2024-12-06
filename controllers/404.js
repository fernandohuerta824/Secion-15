
module.exports.handler404 = (req, res) => {
    res.status(404).render('404', {docTitle: 'Error 404', path: null, })
}  