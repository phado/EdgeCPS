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
    // var svg = document.getElementsByTagName('svg');
    // svg.style.width = "70%";
    // graph.refresh();
}

function subContent1ClickHandler(sender, evt) {
    var cell = evt.getProperty('cell'); 

    if(processName == 'requirementsProcess'){
        var cellText = cell.value.attributes[1].nodeValue;
        var cellId = cell.id;
        subContent2(cellText,cellId,cell);
    }
    else if(processName == 'businessProcess'){
        var cellValues = cell.value.attributes;
        var cellId = cell.id;
        subContent2(cellValues, cellId, cell);
    }
    
    // var cellId = cell.id
    // localStorage.setItem(projectName+'_current_workflowName', cell.value.attributes[1].value)
    
    
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
    

    if(processName == 'requirementsProcess'){
        var cellNodeName = cell.value.attributes[1].nodeName;
        requirementAttributes.textContent = cellNodeName+' : '+cellName;
        container.appendChild(requirementAttributes);

    }
    else if(processName == 'businessProcess'){
        
        for(i=1 ; i<cellName.length ; i++){
            var cellNodeName = cell.value.attributes[i];
            var requirementAttribute = document.createElement('div');
            requirementAttribute.textContent = cellNodeName.nodeName+' : '+cellNodeName.nodeValue;
            requirementAttributes.appendChild(requirementAttribute)
            container.appendChild(requirementAttribute);
        }
        
    }
    


    // var xmlData = localStorage.getItem(projectName+'_'+cellId+'#'+cellName)
    // var container = document.getElementById('graphContainer2');
    // var graph = new Graph(container);
    // var doc = mxUtils.parseXml(xmlData);
    // var codec = new mxCodec(doc);
    // codec.decode(doc.documentElement, graph.getModel());
    // graph.refresh();

    // Activity 클릭 했을 때 Activity 상태 출력
    // intervalLogContainer2 = setInterval(() => logContainer2(false), 1000);
}