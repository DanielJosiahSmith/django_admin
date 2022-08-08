async function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


docReady(async function() {
   if(document.querySelectorAll('input[type="file"]'.length > 0)){
    var enable_multi_upload = document.createElement('div')
    enable_multi_upload.style.position = 'fixed'
    enable_multi_upload.style.border = '1px solid black'
    enable_multi_upload.style.right = '0'
    enable_multi_upload.style.top = '0'
    enable_multi_upload.style.background = 'white'
    enable_multi_upload.innerText = 'Enabled'

    document.body.append(enable_multi_upload)
   }
})
