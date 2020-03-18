const errors = {
    NO_RECIPE_DATA : {
        message : "No recipe data found.",
        code : 422
    },
    FAILED_TO_FETCH : {
        message : "The URL you entered could not be resolved.",
        code : 404
    },
    UNKNOWN_ERROR : {
        message : "An unknown error occurred.",
        code : 400
    },
    NOT_FOUND : {
        message : "No recipe was found matching that URL.",
        code : 404
    },
    EMAIL_IN_USE : {
        message : "The email address you entered is already in use.",
        code : 400
    }
}

module.exports = errors
