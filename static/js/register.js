function registerUser() {
  let username = document.getElementById("username").value;
  let passwd = document.getElementById("passwd").value;
  let cpasswd = document.getElementById("cpasswd").value;
  console.log(username);
  console.log(passwd);
  console.log(cpasswd);
  const options = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({"username":username,"passwd":passwd,"cpasswd":cpasswd})
   };
   
   fetch('/api/user/signup', options)
   .then(resp => {
       console.log(resp);
       if (resp.status == 200) {
         alert("Account created go to login to login");
         document.getElementById("username").value="";
         document.getElementById("passwd").value="";
         document.getElementById("cpasswd").value="";
         return
       } else {
         return resp.json();
       }
   })
   .then(data => {
       if (data) {
           alert(JSON.stringify(data));
       }
   })
   .catch(error => console.error('Error:', error));
}
