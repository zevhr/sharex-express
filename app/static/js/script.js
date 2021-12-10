async function deleteSS() {
    const params = new URLSearchParams(window.location.search)
    let title = params.get('photo')
    var secret = document.querySelector("#secret").value
    await fetch(`/delete/${title}`, {
        method: "DELETE",
        headers: { "secret": `${secret}`}
    })
    .then(function(response) {
        // console.log(response.status); // Will show you the status
        if(response.status === 200) {
            var error = document.getElementById("err");
            error.style.display = "none";
            var success = document.getElementById("success");
            success.style.display = "block";
            location.reload();
        } else if (response.status === 403 || response.status === 404) {
            var success = document.getElementById("success");
            success.style.display = "none";
            var error = document.getElementById("err");
            error.style.display = "block";
            var code = document.getElementById("code").innerHTML = response.status
        }
      })
}

function showForm() {
var form = document.getElementById("form")
form.style.display = "block";

var button = document.getElementById("del")
button.style.display = "none";
}

function darkMode() {
document.getElementById('body').style.backgroundColor = `#121212`
document.querySelector('.jumbotron').style.backgroundColor = `#4a4a4a`
document.getElementById('date').style.color = `#919191`
document.getElementById('fork').style.color = `#919191`
document.querySelector('.header').style.color = `#919191`
}