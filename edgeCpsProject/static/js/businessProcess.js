function extractReq() {
	var xmlString =window.localStorage.getItem(projectName+'_requirementsProcessXml');
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

	var objects = xmlDoc.getElementsByTagName('object');
	var extractedValues = [];

	for (var i = 0; i < objects.length; i++) {
		var object = objects[i];
		var label = object.getAttribute('label');

		if (label.includes('<<functional requirement>>')) {
		var match = label.match(/<<functional requirement>>\n(.*)/);

		if (match && match[1]) {
			var value = match[1].replace(/[\[\]]/g, ''); // [와 ]를 제거
			extractedValues.push(value);
		}
		}
	}

  return extractedValues;
  }

function previous(){
	var xmlData = localStorage.getItem(projectName+'_requirementsProcessXml')
    var container = document.getElementById('previous');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
	graph.refresh();
}

