const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const mongoose = require('mongoose')

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3001/products/' + doc._id
                        }
                    }
                })

            }
            // if (docs.length >= 0) {
            res.status(200).json(response)
            // } else {
            //     res.status(404).json({
            //         message: 'No entries found'
            //     })
            // }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                message: err
            })
        })
})

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    product.save().then(result => {

        console.log(result)
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: `http://localhost:3001/products/${result._id}`

                }
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })

    })
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id).exec()
        .then(doc => {
            console.log("From database", doc)

            if (doc) {
                res.status(200).json({product:doc,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3001/products/${doc._id}`    
                    }
                })
            } else {
                res.status(400).json({ message: 'No valid entry found for provide ID' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ error: err })

        })

})


router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Product.update({ _id: id }, { $set: updateOps }).exec()
        .then(result => {
            
            res.status(200).json({
                message:'Product updateded!',
                request: {
                    type: 'GET',
                    url: `http://localhost:3001/products/${id}`

                }

            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.deleteOne({ _id: id }).exec()
        .then(result => {
            res.status(200).json({
                message:'Product Deleted',
                request:{
                    type:'DELETE',
                    url: `http://localhost:3001/products`,
                    data:{name: 'String', price:'Number'}

                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})



module.exports = router