function subContent1(projectName, processName){
    if (processName =='requirementsProcess'){
        var xmlData = localStorage.getItem(projectName+'_requirementsProcessXml')
    }
    else if(processName =='businessProcess'){
        var xmlData = localStorage.getItem(projectName+'_businessProcessXml')
    }
    
    var container = document.getElementById('graphContainer');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    // graph.addListener(mxEvent.CLICK, subContent1ClickHandler);
    graph.addListener(mxEvent.CLICK, function(sender, evt) {
        var clickCell = evt.getProperty('cell');

        // 최상위 부모 셀 가져오기 (req의 경우 여러 자식 노드들이 있는데 그것들을 선택 한 경우에도 부모의 정보를 가져오기위해)
        var topmostCell = getTopmostCell(graph, clickCell);
        subContent2(topmostCell.value.attributes, topmostCell.id, topmostCell)
    });
}
// 최상위 부모 셀을 찾는 함수
function getTopmostCell(graph, cell) {
    var model = graph.getModel();

    while (cell && cell.getParent() && cell.getParent() != model.getRoot()) {
        // 부모 노드 중에서 특정 조건을 만족하는 object를 찾기
        if (typeof(cell.value) == 'object') {
            return cell
        }

        cell = cell.getParent();
    }

    return null; // 조건을 만족하는 object를 찾지 못한 경우 nbull
}
function subContent1ClickHandler(sender, evt) {
    var cell = evt.getProperty('cell'); 

    // if(processName == 'requirementsProcess'){
    //     var cellText = cell.value.attributes[3].nodeValue;
    //     var cellId = cell.id;
    //     subContent2(cellText,cellId,cell);
    // }
    // else if(processName == 'businessProcess'){
        var cellValues = cell.value.attributes;
        var cellId = cell.id;
        subContent2(cellValues, cellId, cell);
    // }
}

function subContent2(cellName,cellId,cell){
    var containerElement = document.getElementById("graphContainer2");
    var svgElements = containerElement.querySelectorAll("svg");
    var divElements = containerElement.querySelectorAll("div");
    // 선택한 각 SVG 요소를 순회하면서 삭제
    svgElements.forEach(function(svgElement) {
        svgElement.parentNode.removeChild(svgElement);
    });

    // 선택한 각 div 요소 순회하면서 삭제
    divElements.forEach(function(divElement) {
        divElement.parentNode.removeChild(divElement);
    });

    var container = document.getElementById('graphContainer2');
    var requirementAttributes = document.createElement('div');
    

    // if(processName == 'requirementsProcess'){
    //     var cellNodeName = cell.value.attributes[3].nodeName;
    //     var requirementName = document.createElement('div');
    //     var requirementAttribute = document.createElement('div');
        
    //     requirementAttribute.textContent = cellName;
    //     requirementAttribute.style.cssText = 'color: #5A5A5A;font-family: Inter;font-size: 18px;font-style: normal;font-weight: 500;line-height: normal; border-bottom:1px solid rgb(214, 214, 214); margin-bottom:6%'
    //     requirementName.textContent = cellNodeName;
    //     requirementName.style.cssText = 'color: #222;font-family: Inter;font-size: 20px;font-style: normal;font-weight: 600;line-height: normal;'
        
    //     requirementAttributes.appendChild(requirementName);
    //     requirementAttributes.appendChild(requirementAttribute);
 
    //     container.appendChild(requirementAttributes);

    // }
    // else if(processName == 'businessProcess'){
        
        for(i=2 ; i<cellName.length ; i++){
            var cellNodeName = cell.value.attributes[i];
            var requirementName = document.createElement('div');
            var requirementAttribute = document.createElement('div');

            requirementName.textContent = cellNodeName.nodeName;
            requirementName.style.cssText = 'color: #353535;font-family: Inter Extra Light;font-size: 14px;font-style: normal;font-weight: 400;line-height: normal;    margin-left: 10px;margin-top: 20px;'

            requirementAttribute.textContent = cellNodeName.nodeValue;
            requirementAttribute.style.cssText = 'color: #919191; font-family: Inter Extra Light; font-size: 12px; font-style: normal; font-weight: 400; line-height: normal; border-bottom: 1px solid rgb(214, 214, 214); margin-bottom: 6%; margin-left: 10px; padding-bottom: 3px; width: 94%; overflow-wrap: break-word; word-wrap: break-word;';
    
            requirementAttributes.appendChild(requirementName);
            requirementAttributes.appendChild(requirementAttribute);
            container.appendChild(requirementAttributes);
        // }   
    }
}