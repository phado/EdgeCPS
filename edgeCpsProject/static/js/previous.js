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
        var cellText = cell.value.attributes[3].nodeValue;
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
        var cellNodeName = cell.value.attributes[3].nodeName;
        var requirementName = document.createElement('div');
        var requirementAttribute = document.createElement('div');
        
        requirementName.textContent = cellName;
        requirementName.style.cssText = 'color: #222;font-family: Inter;font-size: 20px;font-style: normal;font-weight: 600;line-height: normal;'
        requirementAttribute.textContent = cellNodeName;
        requirementAttribute.style.cssText = 'color: #5A5A5A;font-family: Inter;font-size: 18px;font-style: normal;font-weight: 500;line-height: normal; border-bottom:1px solid rgb(214, 214, 214); margin-bottom:6%'

        requirementAttributes.appendChild(requirementName);
        requirementAttributes.appendChild(requirementAttribute);
        container.appendChild(requirementAttributes);

    }
    else if(processName == 'businessProcess'){
        
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