window.onload=init;

function ImgData(id, src, name, size, lat, lng){
    this.id = id;
    this.src = src;
    this.name = name;
    this.size= size;
    this.lat = lat;
    this.lng = lng;
}

var imgDataArr = [];
var markers = [];
var count = 1;
var mymap;

function init() {
	mymap = L.map('mapid').setView([51.505, -0.09], 13);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
    }).addTo(mymap);

    document.getElementById("file-upload").onchange = function() {
        var file = this.files[0];
        if (checkFileType(file.name) && checkSize(file.size)) {
            EXIF.getData(file, function() {
                var allMetaData = EXIF.getAllTags(this);
                if (allMetaData) {
                    if(checkGPS(allMetaData))
                    storeImg(file,allMetaData);
                } else {
                    alert("No EXIF data found in image '" + file.name + "'!");

                }
            });
        }
		this.value='';
    }
}

checkSize = function (fileSize) {
    if(fileSize > 1000000){
        alert("File is too big!");
        return false;
     };
     return true;
}
checkGPS = function (allMetaData) {
    if(allMetaData.GPSLongitude && allMetaData.GPSLatitude && allMetaData.GPSLongitudeRef && allMetaData.GPSLatitudeRef){
        return true; 
    }
	alert("No GPS data found!");
    return false;
}
checkFileType = function (fileName){
    var idxDot = fileName.lastIndexOf(".") + 1;
    var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
    if (extFile=="JPG" || extFile=="jpg"){
        return true;
    }
	alert("This file is not a JPG image!");
    return false;
}

calculateCoord = function(CoordData, CoordChar){
    var coord = CoordData[0].valueOf() + CoordData[1].valueOf()/60 + CoordData[2].valueOf()/3600;
    if(CoordChar.localeCompare("S") == 0 || CoordChar.localeCompare("W") == 0){
        coord = (-1)*coord;   
    }
    return coord;
}


storeImg = function(file, allMetaData) {
    var imgStore = new ImgData(
        count, 
        URL.createObjectURL(file), 
        file.name,
        file.size,
        calculateCoord(allMetaData.GPSLatitude, allMetaData.GPSLatitudeRef),
        calculateCoord(allMetaData.GPSLongitude, allMetaData.GPSLongitudeRef)
        );
        imgDataArr.push(imgStore);
        createRow(imgStore);
        var marker = L.marker([imgStore.lat, imgStore.lng]).addTo(mymap);
        markers.push({id:count,marker:marker});
        centerLeafletMapOnMarker(mymap, marker);
        count++;

}

centerLeafletMapOnMarker = function(map, marker) {
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
}

createRow = function(imgStore) {
    var table = document.getElementById("images");
    var row = table.insertRow(-1);
    row.id = imgStore.id;
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    cell1.innerHTML = createThumbnail(imgStore.src);
    cell2.innerHTML = imgStore.name;
    cell3.innerHTML = imgStore.size;
    cell4.innerHTML = imgStore.lat + ", " + imgStore.lng;
    cell5.innerHTML = createButton(imgStore.id);
}

createButton = function(id){
	return "<button id=" + id + " class='btn btn-secondary' onclick='deleteElement(" + id + ");'>delete</button>";
}

deleteElement = function(id){
	deleteRow(id);
	remove(imgDataArr, id);
	for(markerData of markers){
		if(markerData.id  == id)
		mymap.removeLayer(markerData.marker);
	}
}
createThumbnail = function(src) {
	return '<img src="'+ src +'" height="100" alt="Image preview..."></img>';  
}

remove = function(array, element) {    
	const index = array.indexOf(element);
	array.splice(index, 1);
}

deleteRow = function(rowid) {   
    var row = document.getElementById(rowid);
    row.parentNode.removeChild(row);
}

