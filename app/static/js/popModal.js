async function openTitleModal() {
        var modal = document.getElementById("modal");
        var btn = document.querySelector('.btn')
        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";
        
        span.onclick = function() {
            modal.style.display = "none";
        }
        
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

async function openDeleteModal(id) {

    var modal = document.getElementById("modal");
    var btn = document.querySelector('.btn')
    var span = document.getElementsByClassName("close")[0];

    document.getElementById('delLink').innerHTML = this.objJson[id].title

    modal.style.display = "block";
    
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}