async function getFileUrl() {
    const params = new URLSearchParams(window.location.search)
    let title = params.get('photo')
    let apiurl = `http://${window.location.host}/screenshots?title=${title}`
    let pageURL = `http://${window.location.host}/view?photo=${title}`

        if(title) {
            try{
    const { response } = await fetch(apiurl).then(response => response.json());
    console.log(response)
    let date = response.date;
    let photourl = response.directurl;
    var dateStr = new Date();

    document.querySelector('meta[name="img"]').setAttribute("content", photourl)
    document.querySelector('meta[name="title"]').setAttribute("content", `Awex's screenshot from ${dateStr}`)
    document.querySelector('meta[name="url"]').setAttribute("content", pageURL)        

    document.getElementById("title").innerHTML = (`Screenshot from ${date}`)
    document.getElementById("date").innerHTML = (`<h3>Screenshot from:<br> ${date}</h3>`)
    document.getElementById("jumbo-internal").innerHTML = "<img src=" + photourl + ">"
            }
            catch(error) {
                console.log('There was an error! ', error)
                const body = document.getElementById("body")
                body.style.display = "none";
                const err = document.getElementById("fourohfour");
                err.style.display = "block";
            }
        } else if (!title) {
            const body = document.getElementById("body")
            body.style.display = "none";
            const err = document.getElementById("fourohfour");
            err.style.display = "block";
        }
    }
    async function deleteSS() {
        const params = new URLSearchParams(window.location.search)
        let title = params.get('photo')
        var secret = document.querySelector("#secret").value
        const delfile = await fetch(`http://${window.location.host}/delete/${title}`, {
            method: "DELETE",
            headers: { "secret": `${secret}`}
        })
        .then(function(response) {
            console.log(response.status); // Will show you the status
            if(response.status === 200) {
                var error = document.getElementById("err");
                error.style.display = "none";
                var success = document.getElementById("success");
                success.style.display = "block";
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
