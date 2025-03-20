exports.notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

exports.errorHandler = (err, req, res, next) => {
    //jika status tidak dimasukan
    let statusCode = req.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Something went wrong";

    if(err.errors || err.name =='sequelizeValidationError'){
        const errorList = err.errors.map((err) => {
            let obj = {};
            obj[err.path] = err.message;
            return obj;
        });
        message = errorList;
        statusCode = 400;
    }
    //kondisi jika terdapat error
    res.status(statusCode).json({
        message,
        stack: err.stack
    });

}