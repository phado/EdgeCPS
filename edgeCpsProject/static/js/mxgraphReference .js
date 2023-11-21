/**
 *  생성된 오브젝트의 edit의 값을 가져오는 민수 이사필요
 *
 */
function getObjectPropertyValue(input,id, mxObjId) {
	let htmlTag = input.outerHTML;

	let tempElement = document.createElement('div');
	tempElement.innerHTML = htmlTag;

	let attributes = tempElement.firstChild.attributes;

	let desiredAttributes = [];
	for (let i = 0; i < attributes.length; i++) {
	let attribute = attributes[i];
	if (attribute.name !== 'label') {
		desiredAttributes.push(attribute.name + '="' + attribute.value + '"');
	}
	}
	objValueDict[id +'_'+ mxObjId] = desiredAttributes
}


 /**
 * 클래스들의 마지막 숫자를 가져와서 +1을 해준다. flowdict의 중복된 키를 방지하기 위해 민수 이사필요
 */
function getLastIndexOfShape(shapeName){ //민수 마지막숫자를 가져와서 거기에서 +1 추가하는 방식
	var lastIndex = 0
	var number = 0
	var ele = document.getElementsByClassName(shapeName);
	for (let index = 0; index < ele.length; index++) {

		const regex = /[^0-9]/g;
		const result = ele[index].className.baseVal.replace(regex, "");
		const number = parseInt(result);

		if (lastIndex == 0 || lastIndex < number ){
			lastIndex = number
		}
	}
	return lastIndex +1;
};


/**
 * 생성된 다이어그램의 Class Name 생성 기능 카멜 표기법으로 클래스 이름을 생성 해준다. 민수 이사필요
 */
function convertToCamelCase(input) { // 단어를 클래스로 변경하기 위한 함수 민수
	var keyword = "DiShape";
	var keywordIndex = input.indexOf(keyword);

	if (keywordIndex !== -1) {
		var remainingText = input.slice(keywordIndex + keyword.length).trim();

	}
	var words = remainingText.split(' ');
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (word !== '') {
		words[i] = word.charAt(0).toUpperCase() + word.slice(1);
		}
	}

	return 'Di'+ words.join('');
	}
