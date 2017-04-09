var class_arr = new Array();
var xmlhttp;

function addClass(){
    var class_name = document.getElementById("class_name").value
    var class_id = document.getElementById("class_input").value;
    //TODO: Verify class id
    
    //Create xml link
    var xml = "http://classfind.stonybrook.edu/vufind/AJAX/JSON?method=getItemVUStatuses";
    var semester = 1178;
    var link = xml + "&itemid=" + class_id + "&strm=" + semester;
    
    //Create class and put them into arr and back into an object for storage
    var class_obj = new Object();
    class_obj.class_name = class_name;
    class_obj.class_id = class_id;
    class_obj.link = link;
    
    //Add any previous classes to class_arr
    chrome.storage.sync.get('classes', function(items){
        var classes = items.classes;
        for(var i = 0; i < classes.length; i++){
            var curr_class = classes[i];
            console.log("Readding: " + curr_class.class_name);
            class_arr.push(curr_class);
        }
    });
    
    //Add new class
    class_arr.push(class_obj);
    
    console.log("Class arr: " + class_arr);
    var classes = {};
    classes['classes'] = class_arr;
    
    //Save it to chrome storage
    chrome.storage.sync.set(classes, function(){
        console.log("Saved: " + classes);
    });
    
    //Clear input
    document.getElementById("class_name").value = "";
    document.getElementById("class_input").value = "";
    
    updateStatus();
}

function getJson(link){
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", link, false);
    xmlhttp.onreadystatechange=function(){
        if(this.readyState == 4 && this.status == 200){ //completed and successful
            //console.log("response text: " + xmlhttp.responseText);
        }
    }
    xmlhttp.send();
    return xmlhttp.responseText;
}

function getSeats(classObject){
    var link = classObject.link;
    console.log("link : " + link);
    
    //Get json from link
    var text = getJson(link);
    
    //Get seats from text
    var tag = "<SU_ENRL_AVAL>";
    var closeTag = "<\\/SU_ENRL_AVAL>";
    console.log("Close tag: " + closeTag);
    var seats = text.substring(text.indexOf(tag) + tag.length, text.indexOf(closeTag));
    //console.log("Seats : " + seats);
    return seats;
}
function updateStatus(){
    var class_list = document.getElementById("class_list");
    
    //Clear class list
    class_list.innerHTML = "";
    
    //Get data
    chrome.storage.sync.get('classes', function(items){
        console.log("Classes: " + items.classes);
        var classes = items.classes;
        if(classes == null){
            return;
        }
        for(var i = 0; i < classes.length; i++){
            var curr_class = classes[i];
            class_list.innerHTML += "<li>" + curr_class.class_name + " : " + + 
            getSeats(curr_class) + "</li>";
        }
    });
}

function removeAllClasses(){
    chrome.storage.sync.clear(function(){
        console.log("Removed all classes");
    });
}
document.addEventListener('DOMContentLoaded', function() {
    //Add previous classes
    
    
    //Add onclicks
    var submit = document.getElementById("submit_class");
    submit.onclick = function(){
        addClass();
    };
    updateStatus();
    //Update every minute
    setInterval(function(){
        updateStatus();
    }, 3000)
});