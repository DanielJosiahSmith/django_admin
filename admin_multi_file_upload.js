/*
This file allows for the use of multiple images to be uploaded at once on django admin.
Those images are then resized, if necessary, to reduce the file size.
*/


//Global variables
let container = new DataTransfer();
var add_image_btn
var max_size = 900
var proccess_img_retries = 0


window.onload = createGalleryUpload

//document fully loaded
docReady(async function() {
    //On document ready, create new multi image input w/ "change" event listner 
    createMulitFileUpload()
})


async function createMulitFileUpload(){
    //create elements and assign properties
    var multi_file_input_container = document.createElement('div')
    multi_file_input_container.style.padding = '8px 5px'
    multi_file_input_container.style.position = 'absolute'
    multi_file_input_container.style.left = '50%'
    multi_file_input_container.style.transform = 'translateX(-50%)'
    multi_file_input_container.style.margin = '20px 0 0 0'
    multi_file_input_container.style.width = '400px'

    var multi_file_input = document.createElement('input')
    multi_file_input.style.padding = '8px 5px'
    multi_file_input.style.border = '2px solid #1484e0'
    multi_file_input.style.borderRadius = '5px'
    multi_file_input.type = 'file'
    multi_file_input.multiple = true
    multi_file_input.accept = 'image/*'
    multi_file_input.id = 'Multi-File-Upload'

    var multi_file_input_lbl = document.createElement('label')
    multi_file_input_lbl.htmlFor = 'Multi-File-Upload'
    multi_file_input_lbl.textContent = 'Add Image(s)'
    multi_file_input_lbl.style.fontWeight = '600'
    multi_file_input_lbl.style.color = 'black'
    multi_file_input_lbl.style.marginRight = '20px'
    multi_file_input_lbl.style.fontStyle = 'italic'

    multi_file_input_container.append(multi_file_input_lbl)
    multi_file_input_container.append(multi_file_input)

    var modules = document.querySelectorAll('.module')

    for(var i = 0; i < modules.length;i++){
        if(modules[i].querySelector('h2'))
        {
            //find Gallery and append new multi image input
            if(modules[i].querySelector('h2').innerText == 'GALLERY'){
                modules[i].append(multi_file_input_container)
                modules[i].append(document.createElement('br'))
                modules[i].append(document.createElement('br'))
                modules[i].append(document.createElement('br'))
                add_image_btn = modules[i].querySelector('.add-row').querySelector('a')
                add_image_btn.parentElement.style.display = 'none'
            }
        }
    }
        
    //when images added
    multi_file_input.addEventListener('change',async (e)=>{
        var selected_files = e.target.files
        let msg_field = document.getElementById('Msg-Field')

        //remove previous
        msg_field.querySelectorAll('li').forEach(li=>{
            li.remove()
        })

        msg_field.style.display = 'block'

        //
        //  REDUCE FILE SIZE
        //
        
        let files_processed = []

        let selected_files_array = Array.from(selected_files)

        //reset container
        container.clearData()

        //loop through images and proccess them one at a time
        for(var i = 0; i < selected_files_array.length;i++){
            
            await proccessImg(selected_files_array[i],container,i,selected_files_array.length,files_processed,max_size).then(done =>{
            
                //if done, move onto next image, else proccess again with smaller max_size
                if(done == true){
                    max_size = 900
                    proccess_img_retries = 0
                }
                else if(done == false && max_size >= 300)
                {
                    i -= 1
                    proccess_img_retries += 1
                    max_size -= proccess_img_retries * 200
                }
                
            })
            
        }
                        
        //
        // END REDUCE FILE SIZE 
        //
    
    })
}



async function proccessImg(file,container,index,total_files,files_processed,p_max_size){
    return new Promise((resolve, reject) => {

    // Ensure it's an image
    if(file.type.match(/image.*/)) {
        // Load the image
        var reader = new FileReader();
            reader.onload = function (readerEvent) {
                var image = new Image();
                image.onload = function (imageEvent) {
       
                    var canvas = document.createElement('canvas'),
                        //pixels
                        img_max_size = p_max_size,
                        width = image.width,
                        height = image.height;

                    // Resize the image if greater than 500kb
                    if(file.size > 500000){
                        if (width > height) {
                            if (width > img_max_size) {
                                height *= img_max_size / width;
                                width = img_max_size;
                            }
                        } else {
                            if (height > img_max_size) {
                                width *= img_max_size / height;
                                height = img_max_size;
                            }
                        }
                    }
                    else
                    {
                        //dont resize
                        container.items.add(file);
                        files_processed.push((index + 1))
                        if(files_processed.length == total_files){
                            fileReductionResults(container)
                        }
                        resolve(true)
                        return
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(image, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        let file2 = new File([blob], file.name, { type: "image/jpeg" })
                            
                        if(file2.size < 500000){
                            //Data transfer container
                            container.items.add(file2);
                            files_processed.push((index + 1))
                        
                            if(files_processed.length == total_files){
                                //all files proccessed, show results
                                fileReductionResults(container)
                            }
                            resolve(true)
                        }
                        else{
                            //file size still over 500kb d
                            //try to resize image again w/ smaller max size
                            if(max_size > 300){
                                resolve(false)
                            }
                            else{
                                //cannot be resized any further
                                //add to container 
                                container.items.add(file2);
                                files_processed.push((index + 1))
                            
                                if(files_processed.length == total_files){
                                    //all files proccessed, show results
                                    fileReductionResults(container)
                                }
                                resolve(true)
                            }
                            
                        }
                        
                    }, 'image/jpeg');                
                
                }
                image.src = readerEvent.target.result;
            }
            reader.readAsDataURL(file);
        }
        
    })
}

async function createGalleryUpload(){

    //create new button for multi file upload
    var multi_file_input_hidden = document.createElement('input')
    multi_file_input_hidden.id = 'Multi-File-Upload-Hidden'
    multi_file_input_hidden.type = 'file'
    multi_file_input_hidden.multiple = true
    multi_file_input_hidden.style.visibility = 'hidden'
    document.body.append(multi_file_input_hidden)

    var msg_field = document.createElement('div')
    msg_field.id = 'Msg-Field'
    msg_field.style.position = 'fixed'
    msg_field.style.left = '50%'
    msg_field.style.top = '50%'
    msg_field.style.transform = 'translate(-50%,-50%)'
    msg_field.style.border = '2px solid black'
    msg_field.style.borderRadius = '5px'
    msg_field.style.padding = '35px 10px 10px 10px'
    msg_field.style.maxwidth = '600px'
    msg_field.style.maxHeight = '400px'
    msg_field.style.overflowY = 'auto'
    msg_field.style.overflowX = 'hidden'
    msg_field.style.display = 'none'
    msg_field.style.background = 'white'
    msg_field.style.boxShadow = '0 0 0 200vw rgba(0,0,0,.6)'

    //Progress Bar 
    var progress_bar_container = document.createElement('div')
    progress_bar_container.id = 'Progress-Bar-Container'
    progress_bar_container.style.display = 'none'
    progress_bar_container.style.width = '100%'
    progress_bar_container.style.backgroundColor = '#ddd'
    progress_bar_container.style.margin = '20px auto 30px auto'
    progress_bar_container.style.borderRadius = '15px'
    progress_bar_container.style.border = '4px outset'
    progress_bar_container.style.marginLeft = '-4px'

    var progress_bar = document.createElement('div')
    progress_bar.id = "Progress-Bar"
    progress_bar.style.width = '0%'
    progress_bar.style.height = '25px'
    progress_bar.style.backgroundColor = '#1484e0'
    progress_bar.style.lineHeight = '32px'
    progress_bar.style.color = 'white'
    progress_bar.style.transition = 'width .75s'
    progress_bar.style.borderRadius = '15px'

    var progress_bar_txt = document.createElement('span')
    progress_bar_txt.id = 'Progress-Bar-Txt'
    progress_bar_txt.innerText = '0%'
    progress_bar_txt.style.position = 'absolute'
    progress_bar_txt.style.left = '50%'
    progress_bar_txt.style.transform = 'translateX(-50%)'
    progress_bar_txt.style.color = 'white'
    progress_bar_txt.style.marginTop = '-5px'


    progress_bar.append(progress_bar_txt)
    progress_bar_container.append(progress_bar)
    msg_field.append(progress_bar_container)

    //Complete Message
    var msg_field_complete = document.createElement('div')
    msg_field_complete.id = 'Msg-Field-Complete'
    msg_field_complete.innerText = 'Complete'
    msg_field_complete.style.textAlign = 'center'
    msg_field_complete.style.margin = '20px'
    msg_field_complete.style.fontSize = '20px'
    msg_field_complete.style.display = 'none'
    msg_field.append(msg_field_complete)

    var msg_field_title = document.createElement('div')
    msg_field_title.style.background = '#1484e0'
    msg_field_title.style.color = 'white'
    msg_field_title.style.padding = '1px 4px'
    msg_field_title.style.position = 'absolute'
    msg_field_title.style.width = '100%'
    msg_field_title.style.top = '0'
    msg_field_title.style.left = '0'

    var msg_field_span = document.createElement('span')
    msg_field_span.innerText = 'Gallery Upload'
    msg_field_span.style.fontSize = '16px'
    msg_field_span.style.fontWeight = 800
    msg_field_span.style.marginBottom = '10px'
    var msg_field_span_span = document.createElement('span')
    msg_field_span_span.innerHTML = '&#10005;'
    msg_field_span_span.style.float = 'right'
    msg_field_span_span.style.cursor = 'pointer'
    msg_field_span_span.style.marginRight = '10px'

    msg_field_span.append(msg_field_span_span)
    msg_field_title.append(msg_field_span)
    
    msg_field.append(msg_field_title)

    var msg_field_ul = document.createElement('ul')
    msg_field_ul.id = 'Msg-Field-Ul'
    msg_field_ul.style.paddingLeft = '20px'
    msg_field.append(msg_field_ul)

    var upload_button = document.createElement('div')
    upload_button.innerText = 'Upload'
    upload_button.style.padding = '3px 12px'
    upload_button.style.background = 'white'
    upload_button.style.borderRadius = '5px'
    upload_button.style.border = '1px solid #1484e0'
    upload_button.style.color = '#1484e0'
    upload_button.style.textAlign = 'center'
    upload_button.style.width = '200px'
    upload_button.style.float = 'right'
    upload_button.style.cursor = 'pointer'

    msg_field.append(upload_button)

    upload_button.addEventListener('click',()=>{
        setImgs()
    })
    

    msg_field_span_span.addEventListener('click',()=>{
        document.getElementById('Msg-Field').style.display = 'none'
    })

    document.body.append(msg_field)
}




function fileReductionResults(container){
    //show results in msg_field
    let reduced_files = document.getElementById('Multi-File-Upload-Hidden').files
        reduced_files = container.files

        let selected_files_array = Array.from(document.getElementById('Multi-File-Upload').files)
        let reduced_files_array = Array.from(reduced_files)

        for(var i = 0; i < selected_files_array.length; i++){
            var original_file = selected_files_array.find(selected_file=>selected_file.name == reduced_files_array[i].name)
            var msg = document.createElement('li')
            msg.style.listStyleImage = "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktaW1hZ2UtZmlsbCIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNLjAwMiAzYTIgMiAwIDAgMSAyLTJoMTJhMiAyIDAgMCAxIDIgMnYxMGEyIDIgMCAwIDEtMiAyaC0xMmEyIDIgMCAwIDEtMi0yVjN6bTEgOXYxYTEgMSAwIDAgMCAxIDFoMTJhMSAxIDAgMCAwIDEtMVY5LjVsLTMuNzc3LTEuOTQ3YS41LjUgMCAwIDAtLjU3Ny4wOTNsLTMuNzEgMy43MS0yLjY2LTEuNzcyYS41LjUgMCAwIDAtLjYzLjA2MkwxLjAwMiAxMnptNS02LjVhMS41IDEuNSAwIDEgMC0zIDAgMS41IDEuNSAwIDAgMCAzIDB6Ii8+Cjwvc3ZnPg==)"
            var file_reduction = '<span style="font-size:10px;color:grey;padding-right:20px;" >' + bytesToSize(original_file.size) + '-->' + bytesToSize(reduced_files_array[i].size) + '</span>'
            if(reduced_files_array[i].size > 500000){
                msg.innerHTML = original_file.name + ' ' + file_reduction + '<div style="position:absolute;right:5px;color:red;padding-right:5px;margin-top:-20px;">&#10060;</div>'
                document.getElementById('Msg-Field-Ul').append(msg)
            
            }
            else{
                msg.innerHTML = original_file.name + ' ' + file_reduction + '<div style="position:absolute;right:5px;color:green;padding-right:5px;margin-top:-20px;">&#10004;</div>'
                document.getElementById('Msg-Field-Ul').append(msg)
            }
        }
}


async function setImgs(){
    
        let reduced_files_upload = document.getElementById('Multi-File-Upload-Hidden').files
    
        reduced_files_upload = container.files
        
        let reduced_files_upload_array = Array.from(reduced_files_upload)

        //hide file list
        let msg_field = document.getElementById('Msg-Field')
        msg_field.querySelector('ul').style.display = 'none'

        //progress bar
        let progress_bar_container = document.getElementById('Progress-Bar-Container')
        progress_bar_container.style.display = 'block'
        let progress_bar = document.getElementById('Progress-Bar')

        
        for(var i = 0;i < reduced_files_upload_array.length;i++){
            //skip images that over 500kb
            if(reduced_files_upload_array[i].size > 500000){
                continue
            }
            
            add_image_btn.click()

            var previous_sibling = document.getElementById('contents-content-content_type-object_id-empty').previousElementSibling

            //document.getElementById(previous_sibling.id)
            var file_upload = previous_sibling.querySelector('.field-display_image').querySelector('input')
            var file_img = previous_sibling.querySelector('.field-image_tag').querySelector('img')

            progress_bar.style.width = (100/reduced_files_upload_array.length) * (i + 1) + '%'
            progress_bar.querySelector('span').innerText = Math.round((100/reduced_files_upload_array.length) * (i + 1)) + '%'
            await sleep(1000)
            
            
            var temp_container = new DataTransfer();
            var temp_file = new File([reduced_files_upload_array[i]], reduced_files_upload_array[i].name, { type: "image/jpeg" })
            
            temp_container.items.add(temp_file)

        
            file_upload.files = temp_container.files
            var fr = new FileReader();
            fr.onload = function () {
                file_img.src = fr.result;
            }
            fr.readAsDataURL(temp_file);

            while(fr.result==null){
                await sleep(10)
            }
           
            //all files uploaded
            if(i == reduced_files_upload_array.length -1){
                progress_bar_container.style.display = 'none'

                //display complete message
                document.getElementById('Msg-Field-Complete').style.display = 'block'
                await sleep(400)
                //hide complete message
                document.getElementById('Msg-Field-Complete').style.display = 'none'
                //display ul for more uploads
                msg_field.querySelector('ul').style.display = 'block'
                //close msg_field
                msg_field.style.display = 'none'

            }

        }

}


//utility functions
function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


  