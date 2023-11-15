// req 정보를 xml에서 추출하기
// function extractReq(){
// 	const inputString = window.localStorage.getItem(projectName+'_requirementsProcessXml')
// 	const pattern = /&lt;functional requirement&gt;&gt;&#10;([^<]+)" /g;// functional req만 추출

// 	const matches = [...inputString.matchAll(pattern)];

// 	const resultArray = [];

// 	if (matches) {
// 		for (const match of matches) {
// 			var reqName = match[1];
// 			if(reqName.includes('['||']')){
// 				reqName = reqName.substring(1,reqName.length -1);
// 			}
// 			resultArray.push(reqName);
// 		}
// 	}
// 	console.log(resultArray);
// 	return resultArray;
// }



// var xpathResult = xmlDoc.evaluate("//object[contains(@label, '<<functional requirement>>')]/@label", xmlDoc, null, XPathResult.ANY_TYPE, null);
// var extractedValues = [];
// var node = xpathResult.iterateNext();
// while (node) {
//     var match = node.value.match(/<<functional requirement>>\n(.*)/);

//     if (match && match[1]) {
//         if (match[1].includes('[' || ']')) {
//             match[1] = match[1].substring(1, match[1].length - 1);
//         }
//         extractedValues.push(match[1]);
//     }

//     node = xpathResult.iterateNext();
// }






// function extractReq(){
// 	var xmlString =window.localStorage.getItem(projectName+'_requirementsProcessXml');

// 	var parser = new DOMParser();
// 	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

// 	var xpathResult = xmlDoc.evaluate("//object/@label", xmlDoc, null, XPathResult.ANY_TYPE, null);
// 	// var xpathResult = xmlDoc.evaluate("//object[contains(@label, '<<functional requirement>>')]/@label", xmlDoc, null, XPathResult.ANY_TYPE, null);
// 	var extractedValues = [];
// 	var node = xpathResult.iterateNext();
// 	while (node) {
// 		var match = node.value.match(/<<functional requirement>>\n(.*)/);
	
// 		if (match && match[1]) {
// 			if(match[1].includes('['||']')){
// 				match[1] = match[1].substring(1,match[1].length -1);
// 			}
// 			extractedValues.push(match[1]);
// 		}
		
// 		node = xpathResult.iterateNext();
// 	}
// 	if (node== null){
// 		var mxCells = xmlDoc.querySelectorAll('mxCell');
// 		var values = [];

// 		// 각 mxCell 요소에서 value 속성을 추출
// 		mxCells.forEach(function(mxCell) {
// 			try{
// 				var value = mxCell.getAttribute('value');	
// 			}catch{}
			
// 			if(value !=null){
// 				values.push(value);

// 				var match = value.match(/<<functional requirement>>\n(.*)/);
			
// 				if (match && match[1]) {
// 					if(match[1].includes('['||']')){
// 						match[1] = match[1].substring(1,match[1].length -1);
// 					}
// 					extractedValues.push(match[1]);
// 				}
			
// 			}

// 		});
// 		return extractedValues
// 	}
	
	
// 	return extractedValues
// }

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