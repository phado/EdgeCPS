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
	var xmlString = window.localStorage.getItem(projectName + '_requirementsProcessXml');
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');
	//
	// var objects = xmlDoc.getElementsByTagName('object');
	//
	// // 오브젝트가 존재하면
	// while (objects) {
	// 	// 오브젝트의 ID 가져오기
	// 	var objectId = objects.getAttribute("id");
	//
	// 	// ID를 부모로 갖는 mxCell 오브젝트를 찾기 위한 XPath 쿼리
	// 	var mxCellQuery = "//mxCell[@parent='" + objectId + "']";
	//
	// 	// XPath로 mxCell 오브젝트를 선택
	// 	var mxCellNodes = xmlDoc.evaluate(mxCellQuery, xmlDoc, null, XPathResult.ANY_TYPE, null);
	// 	var mxCellNode = mxCellNodes.iterateNext();
	//
	// 	// mxCell 오브젝트 출력 또는 처리
	// 	while (mxCellNode) {
	// 		console.log(mxCellNode);
	// 		// 여기에서 mxCell 오브젝트를 처리하거나 저장할 수 있습니다.
	//
	// 		// 다음 mxCell 노드 가져오기
	// 		mxCellNode = mxCellNodes.iterateNext();
	// 	}
	//
	// 	// 다음 오브젝트 노드 가져오기
	// 	objects = objects.iterateNext();
	// }
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