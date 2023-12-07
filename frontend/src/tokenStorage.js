exports.storeToken = function (tok) {
    try {
        localStorage.setItem('token_data', tok.accessToken);
    } catch(e) {
        console.log("Token store error:", e.message);
    }
}

exports.retrieveToken = function () {
    var ud;
    try {
        ud = localStorage.getItem('token_data');
    } catch(e) {
        console.log("Token retrieve error:", e.message);
    }
    return ud;
}