// This is not where the script is grabbed from, but it is the source code.
// It's also available to fetch from https://awexxx.xyz/assets/js/screenshot.js.


// let url = window.location.hostname
// async function getFileUrl() {
//     const params = new URLSearchParams(window.location.search)
//     let title = params.get('photo')
//     let apiurl = `http://${window.location.hostname}/screenshots?title=${title}`

//         if(title) {
//             try{
//     const { response } = await fetch(apiurl).then(response => response.json());
//     let date = response.date;
//     let photourl = response.directurl;
//     var dateStr = new Date();

//     document.querySelector('meta[name="img"]').setAttribute("content", photourl)
//     document.querySelector('meta[name="title"]').setAttribute("content", `Awex's screenshot from ${dateStr}`)
//     document.querySelector('meta[name="url"]').setAttribute("content", url)        

//     document.getElementById("title").innerHTML = (`Screenshot from ${date}`)
//     document.getElementById("date").innerHTML = (`<h3>Screenshot from:<br> ${date}</h3>`)
//     document.getElementById("jumbo-internal").innerHTML = "<img src=" + photourl + ">"
//             }
//             catch(error) {
//                 console.log('There was an error! ', error)
//                 const body = document.getElementById("body")
//                 body.style.display = "none";
//                 const err = document.getElementById("fourohfour");
//                 err.style.display = "block";
//             }
//         } else if (!title) {
//             const body = document.getElementById("body")
//             body.style.display = "none";
//             const err = document.getElementById("fourohfour");
//             err.style.display = "block";
//         }
//     }

//     async function deleteSS() {
//         var secret = document.querySelector("#secret").value
//         const delfile = await fetch(url, {
//             method: "DELETE",
//             headers: { "secret": `${secret}`}
//         })
//         .then(function(response) {
//             console.log(response.status); // Will show you the status
//             if(response.status === 200) {
//                 var error = document.getElementById("err");
//                 error.style.display = "none";
//                 var success = document.getElementById("success");
//                 success.style.display = "block";
//             } else if (response.status === 403 || response.status === 404) {
//                 var success = document.getElementById("success");
//                 success.style.display = "none";
//                 var error = document.getElementById("err");
//                 error.style.display = "block";
//                 var code = document.getElementById("code").innerHTML = response.status
//             }
//           })
//     }
    
//     function showForm() {
//         var form = document.getElementById("form")
//         form.style.display = "block";
    
//         var button = document.getElementById("del")
//         button.style.display = "none";
//         }