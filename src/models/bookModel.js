var mongoose = require('mongoose');
var constants = require('../library/utils/constants')

var allBookSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    category_id: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    back_image: {
        type: String,
        require: true,
    },
    front_image: {
        type: String,
        require: true,
    },
    status: {
        type: Number,
        default: constants.book_status.pending
    },
    review_id: Array,
    contributor_id: String,
    on_request_id: String,
    average_point: String,
    created_at: {
        type: Number,
    },
    updated_at: {
        type: Number,
    }
});

allBookSchema.methods.toJSON = function () {
    let book = this.toObject();
    book.contributor_id = undefined
    book.on_request_id = undefined
    return book;
}

var AllBooks = module.exports= mongoose.model('books', allBookSchema)

module.exports.get = function (callback, limit) {
    AllBooks.find(callback).limit(limit);
}