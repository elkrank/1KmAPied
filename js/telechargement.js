$('#downloadLink').click(function() {
	var img = map.getCanvas().toDataURL('image/png')
	this.href = img
})
function itineraire(){
	var element = document.getElementById('instruction');
	html2pdf(element);
}