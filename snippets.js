const getRouteFn = (route, schema) => {
    router.get(`/${route}`, (req, res) => {
        schema
            .find({})
            .sort('-date')
            .exec((err, users) => {
                if (err) 
                    throw err;
                res.json(`admin/${route}`, {users: users})
            })
    })
}
const getUserFn = (route, Schema) => {
    router.get(`/${route}/:id`, (req, res, next) => {
        Schema.find({
            _id: req.params.id
        }, (err, user) => {
            if (err) {
                throw err
            }
            // console.log(service)
            res.json(`admin/${route}`, {user: user})
        })
    })
}
const activateUser = (route, Schema) => {
    router.get(`/${route}/activate/:id`, (req, res, next) => {
        Schema.findByIdAndUpdate({
            _id: req.params.id
        }, {activated: true}).then((user) => {
            Schema
                .find({_id: req.params.id})
                .then((user) => {
                    res.json(`admin/${route}`, {user: user})
                })
        })
    })
}
const deactivateUser = (route, Schema) => {
    router.get(`/${route}/deactivate/:id`, (req, res, next) => {
        Schema.findByIdAndUpdate({
            _id: req.params.id
        }, {activated: false}).then((user) => {
            Schema
                .find({_id: req.params.id})
                .then((user) => {
                    res.json(`admin/${route}`, {user: user})
                })
        })
    })
}