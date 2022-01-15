async function deleteSS(title, secret) {

    await fetch(`/api/delete/${title}`, {
        method: 'DELETE',
        headers: { 'ShareX-Secret': secret }
    }).then(function(response) {
        if (response.status === 200) {
            console.log(`${title} successfully deleted.`)
            location.reload();
        } else if (response.status === 401) {
            document.getElementById('err').innerHTML = `<p style="color:black;"><br>Sorry, your token is incorrect.</p>`
        }
    }).catch(function(err) {
        console.error(`Something went wrong!`, err)
        document.getElementById(`err`).innerHTML = `<p style="color:black;">Sorry, something went wrong when deleting ${title}.`
    })
}

function showForm() {
    var form = document.getElementById("form")
    form.style.display = "block";

    var button = document.getElementById("del")
    button.style.display = "none";
}

async function changeTitle(fromTitle) {
    const newTitle = document.getElementById('title').value;
    const secret = document.getElementById('titleSecret').value;
    const extension = fromTitle.split('.').pop();

    const errDiv = document.getElementById('noti');

    if(!newTitle || !secret) {
        errDiv.innerHTML = '<p>No title or secret was provided!</p>'
        errDiv.color = 'red'
    } else {
        fetch(`/api/metadata/${fromTitle}?title=${newTitle}`, {
            method: 'PATCH',
            headers: { 'ShareX-Secret': secret }
        }).then(function(response) {
            if(response.status === 200) {
                errDiv.innerHTML = '<p>Success!</p>'
                errDiv.color = 'green'

                location = `/viewer?file=${newTitle}.${extension}`
            } else {
                errDiv.innerHTML = '<p>Sorry, something went wrong. Error code ' + response.status + '.'
                errDiv.color = 'red'
            }
        })
    }
}