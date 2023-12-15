// function extractReq() {
// 	var xmlString =window.localStorage.getItem(projectName+'_requirementsProcessXml');
// 	var parser = new DOMParser();
// 	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
//
// 	var objects = xmlDoc.getElementsByTagName('object');
// 	var extractedValues = [];
//
// 	for (var i = 0; i < objects.length; i++) {
// 		var object = objects[i];
// 		var label = object.getAttribute('label');
//
// 		if (label.includes('&lt;&lt;function req.&gt;&gt;')) {
// 		var match = label.match(/&lt;&lt;function req.&gt;&gt;\n(.*)/);
//
// 		if (match && match[1]) {
// 			var value = match[1].replace(/[\[\]]/g, ''); // [와 ]를 제거
// 			extractedValues.push(value);
// 		}
// 		}
// 	}
//   return extractedValues;
//   }


function previous(){
	var xmlData = localStorage.getItem(projectName+'_requirementsProcessXml')
    var container = document.getElementById('previous');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
	graph.refresh();
}




function extractReq() {
	if(process_name =='workflowProcess'){
		var reqNameValues = window.localStorage.getItem(window.localStorage.getItem(projectName + '_nowWorkflow')+'_requirement');
		var arr = reqNameValues.split(',');
		return arr
	}else{
		var xmlString = window.localStorage.getItem(projectName + '_requirementsProcessXml');
	}

	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

	var mxCellElements = xmlDoc.querySelectorAll('mxCell');

	// class가 'reqName'인 <mxCell> 엘리먼트들의 value 가져오기
	var reqNameValues = [];

	mxCellElements.forEach(function(mxCellElement) {
		try{
			var classAttribute = mxCellElement.getAttribute('class');

			// class가 'reqName'이면 value 가져오기
			if (classAttribute === 'reqName') {
				var value = mxCellElement.getAttribute('value');
				reqNameValues.push(value);
			}
		}
		catch {}
	});
	return reqNameValues
}