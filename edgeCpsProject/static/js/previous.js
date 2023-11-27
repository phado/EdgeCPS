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
    graph.addListener(mxEvent.CLICK, subContent1ClickHandler);
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
            requirementName.style.cssText = 'color: #222;font-family: Inter;font-size: 20px;font-style: normal;font-weight: 600;line-height: normal;'

            requirementAttribute.textContent = cellNodeName.nodeValue;
            requirementAttribute.style.cssText = 'color: #5A5A5A;font-family: Inter;font-size: 18px;font-style: normal;font-weight: 500;line-height: normal; border-bottom:1px solid rgb(214, 214, 214); margin-bottom:6%'
    
            requirementAttributes.appendChild(requirementName);
            requirementAttributes.appendChild(requirementAttribute);
            container.appendChild(requirementAttributes);
        // }   
    }
}