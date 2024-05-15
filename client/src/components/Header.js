function authHeader() {
    const authToken = window.localStorage.getItem('authToken');
    if(authToken){
        return {'Authorization': `Bearer ${authToken}`};
    }else{
        return {"Authorization" : {}}
    }
}

export default authHeader;