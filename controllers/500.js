module.exports.handler505 = (req, res) => {
    res.status(500).render('500', {docTitle: 'Error 500', path: null, })
}  