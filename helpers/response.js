const Response = (response = {}) => {
    const responseObject = {
        "status": response.status,
        "statusCode": response.statusCode,
        "message": response.message,
        "data": {},
        "pagination": {}
    };
    console.log("----------------------------",response?.data);
    if (response.type) {
        responseObject.data.type = response.type;
    }

    if (response.data) {
        responseObject.data.attributes = response.data;
    }

    if (response.token) {
        responseObject.data.token = response.token;
    }
    if(response.pagination){
        responseObject.pagination = response.pagination
    }
    return responseObject;
}

module.exports = Response;