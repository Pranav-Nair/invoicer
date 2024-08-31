window.onload = function() {
    sessionStorage.clear()
}
window.onpageshow = function() {
    sessionStorage.clear()
}
function loginUser() {
    let username = document.getElementById("username").value;
    let passwd = document.getElementById("passwd").value;
    console.log(username);
    console.log(passwd);
    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"username":username,"passwd":passwd})
    };
      
    fetch('/api/user/login', options)
        .then(response => {
            if (response.status == 400 || response.status==404) {
                return response.json().then(errors => alert(errors.error));
            } else {
                return response.json().then(response => {
                    sessionStorage.setItem("access_token", response.access_token);
                    window.location.href="/home"
                });
            }
        })
        .catch(err => alert(err));
    document.getElementById("username").value="";
    document.getElementById("passwd").value="";
    
}
