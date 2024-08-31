window.addEventListener("pageshow",function() {
    console.log("triggered")
    if (!sessionStorage.getItem("access_token")) {
        window.location.href="/login"
    }
})

// if (!sessionStorage.getItem("access_token")) {
//     window.location.href="/login"
// }
window.onload = function() {
    let username = sessionStorage.getItem('access_token'); // Get the username from session storage
    const options = {
        method: 'GET',
        headers: {
          Authorization: 'Bearer '+username
        }
      };
      
      fetch('/api/user/info', options)
        .then(response => {
            if (response.status==404 || response.status==401) {
                alert("session expired")
                window.location.href = "/login"
            }
            else {
                return response.json()
            }
        })
        .then(response => {
            if (response.username)
                document.getElementById('username').textContent = '@' + response.username;
        })
        .catch(err => console.error(err));
         // Update the text content of the username element
}