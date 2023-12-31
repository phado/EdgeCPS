function submit(activityList){
  const shouldExecute = confirm('Argo Workflow에 전송하시겠습니까?');
    // if (shouldExecute){
    //   // var xmlData = localStorage.getItem(xmlDataKey);
    //   fetch('/submit', {
    //     method: 'POST',
    //     headers: {
    //     'Content-Type': 'application/json'
    //     },
    //     body: content
    // })
    // // .then(response => response.json())
    // .then(data => {
    //     console.log(data);
    //     // 서버 응답 처리
    //     window.alert(workflowName+' 워크플로우가 실행 되었습니다.' );
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
    // }else{
    //     console.log('사용자가 취소함');
    // }
  if (shouldExecute){
    activityList.forEach(processedItem => {
     
      localStorage.getItem(projectName+processedItem)
      const serverEndpoint = '/submit';
  
    
      fetch(serverEndpoint, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json', 
          },
          body: JSON.stringify({ processedItem }), 
      })
      .then(response => response.json())
      .then(data => {
          console.log('서버 응답:', data);
      })
      .catch(error => {
          console.error('에러 발생:', error);
      });
    });
  }
}

function readFileContent(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      try{
          const fileContent = event.target.result;
          const jsonData = JSON.parse(fileContent);
          var workflowName = jsonData.workflow.metadata.name;
          executeFunctionWithFileContent(fileContent,workflowName);
      }catch(error){
          window.alert("Argo Workflow Submit Error : " + error.message);
      }
    };
    reader.readAsText(file);
  }

function executeFunctionWithFileContent(content,workflowName) {
    fetch('/submit', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: content
    })
    // .then(response => response.json())
    .then(data => {
        console.log(data);
        // 서버 응답 처리
        window.alert(workflowName+' 워크플로우가 실행 되었습니다.' );
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// 불러온 다이어그램 클릭 이벤트 함수 
function businessProcessViewClickHandler(sender, evt) {
    clearInterval(intervalLogDeploymentView)
    var cell = evt.getProperty('cell'); // 클릭한 셀
    var valueString='';
    if (cell != null && cell.style.includes('partialRectangle')) { //cell이 null아니고 엣지도 아닌경우 
			var cellName = cell.value;
      var cellId = cell.id;
      if(cell.value =='description'){
        var cellName = cell.parent.parent.children[0].children[1].value;
        var cellId = cell.parent.parent.children[0].children[1].id;
      }
      else if(cell.value =='name'){
        var cellName = cell.parent.children[1].value;
        var cellId = cell.parent.children[1].id;
      }
      else if(cellName ==''){
        cellName = cell.parent.parent.children[0].children[1].value;
        cellId = cell.parent.parent.children[0].children[1].id;
      }

      localStorage.setItem(projectName+'_current_workflowName', cellName);
      workflowProcessView(cellName,cellId,cell);
    }else{
      var cellName = cell.children[0].children[1].value;
      var cellId = cell.children[0].children[1].id;
      localStorage.setItem(projectName+'_current_workflowName', cellName);
      workflowProcessView(cellName,cellId,cell);
    }
    // submit(processedItem);

}

// sub-content1
function businessProcessView(projectName){
    var xmlData = localStorage.getItem(projectName+'_businessProcessXml')
    var container = document.getElementById('businessProcessView');
    // container.style.width = "100%"; // 필요에 따라 조절
    // container.style.height = "100%"; // 필요에 따라 조절
    var graph = new Graph(container);


  //   graph.sizeDidChange = function() {
  //   var bounds = graph.getGraphBounds();

  //   // 일정 조건을 만족할 때만 setTranslate 호출
  //   if (bounds.x !== 0 || bounds.y !== 0) {
  //       graph.view.setTranslate(-bounds.x, -bounds.y);
  //       container.style.width = '593px';
  //       container.style.height = '510px';
  //   }
  // };
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    graph.addListener(mxEvent.CLICK, businessProcessViewClickHandler);
    var businessProcessView = document.getElementById('businessProcessView');
    var svg = businessProcessView.querySelector('svg');

    function calculateViewBox() {
      var cells = graph.getModel().cells;
      var minX = Infinity;
      var minY = Infinity;
      var maxX = -Infinity;
      var maxY = -Infinity;
  
      for (var id in cells) {
        if (cells.hasOwnProperty(id)) {
          var cell = cells[id];
          if (cell.isVertex()) {
            var geometry = cell.getGeometry();
            if (geometry) {
              minX = Math.min(minX, geometry.x);
              minY = Math.min(minY, geometry.y);
              maxX = Math.max(maxX, geometry.x + geometry.width);
              maxY = Math.max(maxY, geometry.y + geometry.height);
            }
          }
        }
      }
  
      return { minX: minX, minY: minY, width: maxX - minX, height: maxY - minY };
    }

    mxEvent.addListener(graph.container, 'mousewheel', function(event) {
      if (event.ctrlKey) {
        var delta = event.wheelDelta || -event.detail;
        var scale = graph.view.scale;

        //휠 방향별로
        if (delta > 0) {
          scale *= 1.1;
        } else {
          scale /= 1.1;
        }

        graph.zoomTo(scale);
        mxEvent.consume(event);
      }
      // mxEvent.consume(event);
    });

    var viewBox = calculateViewBox();
    var viewBoxValues =viewBox.minX + " "+ viewBox.minY + " " + viewBox.width + " " + viewBox.height;
    svg.setAttribute('viewBox', viewBoxValues);


    // function getGroupDimensions(businessProcessViewG) {
    //   var group = businessProcessViewG
  
    //   // 초기값 설정
    //   var minX = Infinity;
    //   var minY = Infinity;
    //   var maxX = -Infinity;
    //   var maxY = -Infinity;
  
    //   // <g> 태그 내의 모든 자식 요소를 반복하여 위치와 크기를 고려
    //   var elements = group.children;
    //   for (var i = 0; i < elements.length; i++) {
    //     var element = elements[i];
    //     var bbox = element.getBBox(); // 기본 그래픽 요소에 대해서만 사용 가능
    //     minX = Math.min(minX, bbox.x);
    //     minY = Math.min(minY, bbox.y);
    //     maxX = Math.max(maxX, bbox.x + bbox.width);
    //     maxY = Math.max(maxY, bbox.y + bbox.height);
    //   }
    //   var width = maxX - minX;
    //   var height = maxY - minY;

    //   return { width: width, height: height };
    // }
    // var groupDimensions = getGroupDimensions(businessProcessViewG);
    // console.log('Group Width:', groupDimensions.width);
    // console.log('Group Height:', groupDimensions.height);
  


    // var leftmostX = Infinity;
    // var topmostY = Infinity;
    
    // var elements = svg.querySelectorAll('*');
    // elements.forEach(function(element) {
    //   var x = element.getAttribute('x');
    //   var y = element.getAttribute('y');
      
    //   if (x !== null && !isNaN(x) && parseFloat(x) < leftmostX) {
    //     leftmostX = parseFloat(x);
    //   }

    //   if (y !== null && !isNaN(y) && parseFloat(y) < topmostY) {
    //     topmostY = parseFloat(y);
    //   }
    // });

    // var viewBoxValues = leftmostX+" " +topmostY+ " "+(leftmostX+leftmostX*-2+1000)+" "+(topmostY+topmostY*-2+1000); 


    // var viewBoxValues ="-900 -300 "+ groupDimensions.width+" "+groupDimensions.height;
    // svg.setAttribute('viewBox', viewBoxValues);

    // graph.refresh();
    // graph.sizeDidChange();
}
var intervalLogDeploymentView = '';
// sub-content2
function workflowProcessView(cellName,cellId,cell){
  try{
    var containerElement = document.getElementsByClassName('workflowProcessView');
    containerElement = containerElement[0];
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
  }catch{}
    

    var xmlDataKey = projectName+'_'+cellId+'#'+cellName;
    var xmlData = localStorage.getItem(xmlDataKey);
    var container = document.getElementsByClassName('workflowProcessView');
    // container.style.width = "100%"; // 필요에 따라 조절
    // container.style.height = "100%"; // 필요에 따라 조절
    var graph = new Graph(container[0]);
    // graph.init(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    // graph.addListener(mxEvent.CLICK, workflowProcessViewHandler);
    codec.decode(doc.documentElement, graph.getModel());
    var workflowProcessView = document.getElementById('workflowProcessView');
    var svg = workflowProcessView.querySelector('svg');

    // var leftmostX = Infinity;
    // var topmostY = Infinity;
    
    // var elements = svg.querySelectorAll('*');
    // elements.forEach(function(element) {
    //   var x = element.getAttribute('x');
    //   var y = element.getAttribute('y');
      
    //   if (x !== null && !isNaN(x) && parseFloat(x) < leftmostX) {
    //     leftmostX = parseFloat(x);
    //   }

    //   if (y !== null && !isNaN(y) && parseFloat(y) < topmostY) {
    //     topmostY = parseFloat(y);
    //   }
    // });

    // var viewBoxValues = leftmostX+" " +topmostY+ " "+(leftmostX+leftmostX*-2+1000)+" "+(topmostY+topmostY*-2+1000); 
    // svg.setAttribute('viewBox', viewBoxValues);
    // graph.refresh();

    //argoworkflow 실행
    // submit(xmlDataKey);

    // Activity 클릭 했을 때 Activity 상태 출력
    function calculateViewBox() {
      var cells = graph.getModel().cells;
      var minX = Infinity;
      var minY = Infinity;
      var maxX = -Infinity;
      var maxY = -Infinity;
  
      for (var id in cells) {
        if (cells.hasOwnProperty(id)) {
          var cell = cells[id];
          if (cell.isVertex()) {
            var geometry = cell.getGeometry();
            if (geometry) {
              minX = Math.min(minX, geometry.x);
              minY = Math.min(minY, geometry.y);
              maxX = Math.max(maxX, geometry.x + geometry.width);
              maxY = Math.max(maxY, geometry.y + geometry.height);
            }
          }
        }
      }
  
      return { minX: minX, minY: minY, width: maxX - minX, height: maxY - minY };
    }
    mxEvent.addListener(graph.container, 'mousewheel', function(event) {
      if (event.ctrlKey) {
        var delta = event.wheelDelta || -event.detail;
        var scale = graph.view.scale;

        //휠 방향별로
        if (delta > 0) {
          scale *= 1.1;
        } else {
          scale /= 1.1;
        }

        graph.zoomTo(scale);
        mxEvent.consume(event);
      }
      // mxEvent.consume(event);
    });

    var viewBox = calculateViewBox();
    var viewBoxValues =viewBox.minX + " "+ viewBox.minY + " " + viewBox.width + " " + viewBox.height;
    svg.setAttribute('viewBox', viewBoxValues);

    intervalLogDeploymentView = setInterval(() => deploymentView(false,cellName), 500);
}


// function workflowProcessViewHandler(sender, evt) {
//      clearInterval(intervalLogContainer2)
//     var cell = evt.getProperty('cell'); // 클릭한 셀
//     if (cell != null && cell.style.includes('rounded=1')) { //cell이 null아니고 엣지도 아닌경우 
//         const inputString = cell.value;
//         var regex = /><div style="font-weight: bold">([^<]+)<\/div>/;
//         var match = inputString.match(regex);
//         if (match ==null){
//             regex = /<br>(.*?)<\/div>/;
//             match = inputString.match(regex);
//         }
//         var actionName = match[1]   
//         if(actionName.includes('['||']')){
//             actionName = actionName.substring(1,actionName.length -1);
//         } 
//         var actionId = cell.id
//         logContainer2(actionStatusFlag=true,actionName,actionId)
//     }
// }


// log-container1
function logContainer(){
    //워크플로우 전체 로그 출력 순우
    workflowName = localStorage.getItem(projectName+'_current_workflowName')
    const url = '/log?workflow_name='+encodeURIComponent(workflowName);

    fetch(url)
        .then(response => response.text())  // 응답의 텍스트 데이터를 받아옴
        .then(data => {
            console.log(data);  // 받아온 데이터를 콘솔에 출력
        })
        .catch(error => {
            console.error("Error:", error);
        });

    // HTML 요소 찾기
    var logContainer = document.querySelector('.logContainer');
    console.log = function(message) {
        var logEntry = document.createElement('div');

        try{
          var jsonObjects = message.trim().split('\n').map(JSON.parse);
          var output = ""
          // 각 객체의 "result" 키 내부의 "content" 값을 가져와 출력
          for(var i=0; i<jsonObjects.length; i++){
            var contentValue = jsonObjects[i].result.content;
            output+=contentValue;
            output+='\n';
          }
          output = output.replace(/ /g, '&nbsp;'); // 공백문자-> &nbsp;로
          output = output.replace(/\n/g, '<br>'); // 개행문자-> <br>로 
          logEntry.innerHTML = output; 
          logContainer.appendChild(logEntry);
        }catch{
          // var dataObject = JSON.parse(message);
          //   var messageValue = dataObject.status.phase;
          //   // if (messageValue !== undefined) {
          //     message = message.replace(/ /g, '&nbsp;'); // 공백문자-> &nbsp;로
          //     message = message.replace(/\n/g, '<br>'); // 개행문자-> <br>로 
      
          //     logEntry.innerHTML = message; 
      
          //     logContainer.appendChild(logEntry);
            // }
        }
       
        // 공백 문자 변환 하는 곳
       
        // logContainer.scrollTop = logContainer.scrollHeight; // 스크롤 맨 아래로 이동
    };
} 

function deploymentView(actionStatusFlag,actionName,actionId) {
        workflowName = localStorage.getItem(projectName+'_current_workflowName')

        const url = `/status?workflow_name=${encodeURIComponent(workflowName)}`;

        fetch(url)
        .then(response => response.text())  // 응답의 텍스트 데이터를 받아옴
        .then(data => {
            console.log(data);  // 받아온 데이터를 콘솔에 출력
            const workflowStatus = data;

            // JSON 데이터 파싱
            const statusJsonData = JSON.parse(workflowStatus);
            const nodeStatus = statusJsonData.status.nodes;
            const nodeKeys = Object.keys(nodeStatus);
            const actionStatus = statusJsonData.status.nodes;
            const actionKeys = Object.keys(actionStatus);

            // 배포 다이어그램 그릴 때 필요한 정보 가저옴
            var deployInfo = getDeployInfo(actionKeys,actionStatus)

            var containerElement = document.getElementsByClassName('deploymentView');
            containerElement = containerElement[0];
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

            var xmlData = deployInfo;
            var container = document.getElementsByClassName('deploymentView');
            container = container[0];
            var graph = new Graph(container);
            var doc = mxUtils.parseXml(xmlData);
            var codec = new mxCodec(doc);
            // graph.addListener(mxEvent.CLICK, subContent2ClickHandler);
            codec.decode(doc.documentElement, graph.getModel());
            var deploymentView = document.getElementById('deploymentView');
            var svg = deploymentView.querySelector('svg');
            var deploymentViewSvgWidth = svg.style.minWidth;
            var deploymentViewSvgHeight = svg.style.minHeight;
            var viewBoxValues =  "0 0 "+deploymentViewSvgWidth.split('px')[0]+ " "+ deploymentViewSvgHeight.split('px')[0];
            svg.setAttribute('viewBox', viewBoxValues);
            mxEvent.addListener(graph.container, 'mousewheel', function(event) {
              if (event.ctrlKey) {
                var delta = event.wheelDelta || -event.detail;
                var scale = graph.view.scale;
        
                //휠 방향별로
                if (delta > 0) {
                  scale *= 1.1;
                } else {
                  scale /= 1.1;
                }
        
                graph.zoomTo(scale);
                mxEvent.consume(event);
              }
              // mxEvent.consume(event);
            });
            // graph.refresh();
            logContainer()
            if(statusJsonData.metadata.labels["workflows.argoproj.io/completed"]=='true'){
                clearInterval(intervalLogDeploymentView)
                // logContainer()
            }
            
        })
        .catch(error => {
            console.error("Error:", error);
        });
}
// async function logContainer2(actionStatusFlag,actionName,actionId) {
//     try {
//         workflowName = localStorage.getItem(projectName+'_current_workflowName')

//         const url = `http://127.0.0.1:5000/status?workflow_name=${encodeURIComponent(workflowName)}`;

//         const response = await fetch(url);

//         // HTTP 응답 상태 확인
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const workflowStatus = await response.text();

//         // JSON 데이터 파싱
//         const statusJsonData = JSON.parse(workflowStatus);
//         const nodeStatus = statusJsonData.status.nodes;
//         const nodeKeys = Object.keys(nodeStatus);
//         const actionStatus = statusJsonData.status.nodes;
//         const actionKeys = Object.keys(actionStatus);

//         // // 순우 배포 다이어그램 그릴 때 필요한 정보 가저옴
//         // var deployInfo = getDeployInfo(actionKeys)
//         // 로그 출력
//         const logContainer2 = document.querySelector('.logContainer2');
//         const logEntry = document.createElement('div');

//         // 순우 status 비활성화 주석
//         // // activity의 원하는 정보를 로그에 출력
//         // if (actionStatusFlag == false){
//         //     logEntry.innerHTML = `
//         //         Workflow 이름: ${statusJsonData.metadata.name}<br>
//         //         Namespace: ${statusJsonData.metadata.namespace}<br>
//         //         Workflow 생성시간: ${statusJsonData.metadata.creationTimestamp}<br>
//         //         Workflow 종료여부: ${statusJsonData.metadata.labels["workflows.argoproj.io/completed"]}<br>
//         //         Workflow 성공확인: ${statusJsonData.metadata.labels["workflows.argoproj.io/phase"]}<br>
//         //         Workflow 진행도: ${statusJsonData.status.progress}<br>
//         //         [Workflow 각 노드 상태]<br>
//         //     `;
//         //     for (const key of nodeKeys) {
//         //         if (nodeStatus[key].type === 'Pod') {
//         //             logEntry.innerHTML += `
//         //                 ${nodeStatus[key].displayName}: ${nodeStatus[key].phase}<br>
//         //             `;

//         //             if (nodeStatus[key].phase !== 'Succeeded') {
//         //                 logEntry.innerHTML += `${nodeStatus[key].message}<br>`;
//         //             }
//         //         }
//         //     }
//         // }
        
//         // // action의 원하는 정보를 로그의 출력
//         // if(actionStatusFlag==true){
//         //     for (const key of actionKeys){
//         //         if (actionStatus[key].type =='Pod'){
//         //             if (actionStatus[key].displayName == actionName){
//         //                 logEntry.innerHTML = `
//         //                     boundaryId: ${actionStatus[key].boundaryID}<br>
//         //                     actionName: ${actionStatus[key].displayName}<br>
//         //                     phase: ${actionStatus[key].phase}<br>
//         //                     progress: ${actionStatus[key].progress}<br>
//         //                     hostNodeName: ${actionStatus[key].hostNodeName}<br>
//         //                 `
//         //             }
//         //         }
//         //     }
//         // }

//         while (logContainer2.firstChild) { // initialize
//             logContainer2.removeChild(logContainer2.firstChild);
//         }
//         logContainer2.appendChild(logEntry);
//         // logContainer2.scrollTop = logContainer2.scrollHeight;
//         // await saveLogContainer();
//         if(statusJsonData.metadata.labels["workflows.argoproj.io/completed"]=='true'){
//             logContainer()
//             clearInterval(intervalLogContainer2)
//         }
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }



// function deleteButton(){
//     document.getElementById("deleteButton").addEventListener("click", function(){
//         workflowName = localStorage.getItem(projectName+'_current_workflowName');
//         const shouldExecute = confirm(workflowName+'워크플로우를 삭제 하시겠습니까?');
//         if (shouldExecute) {
//             fetch('/delete', {
//                 method: 'DELETE',
//                 headers: {
//                 'Content-Type': 'application/json'
//                 },
//                 body:  JSON.stringify({ 'workflowName': workflowName })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data);
//                 // 반복 실행 멈추고 로그창 다 지우기
//                 clearInterval(intervalLogContainer2)
//                 while (logContainer2.firstChild) { // initialize
//                     logContainer2.removeChild(logContainer2.firstChild);
//                 }
                
//                 window.alert(workflowName+' 워크플로우가 삭제 되었습니다.' );
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
            
//         } else {
//             console.log('사용자가 취소함');
//         }	
//     });
// }


function getDeployInfo(actionKeys,actionStatus){
    var last_diagram_x = 0;
    var last_diagram_id = 0;
    var last_edge_y = 0;

    var deployInfo = [];
    for (const key of actionKeys){
        if (actionStatus[key].type =='Pod'){
            var array = []
            array.push(actionStatus[key].hostNodeName);
            array.push(actionStatus[key].displayName);
            array.push(actionStatus[key].phase);
            deployInfo.push(array);
        }
    }
    // var deployInfo = [
    //   ['soonwoo', 'hello1', 'Succeeded'],
    //   ['soonwoo', 'hello2', 'Succeeded'],
    //   ['soonwoo', 'hello3', 'Succeeded'],
    //   ['soonwoo1', 'hello4', 'Succeeded'],
    //   ['soonwoo1', 'hello5', 'Succeeded'],
    //   ['soonwoo3', 'hello6', 'Succeeded'],
    //   ['poontoo', 'hello11', 'fail']
    // ];

    var uniqueKeys = Array.from(new Set(deployInfo.map(item => item[0])));
    var uniqueKeyCount = uniqueKeys.length;
    var uniqueKeysId = {};
      
    var mxCells = [];
    var nodeLocationX = {};
    var nodeLocationY = {};
    var edgeLocationY = {}

    // node추가
    for (var i = 0; i < uniqueKeyCount; i++) {
        if(nodeLocationX[uniqueKeys[i]]==undefined){
            var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" value="&amp;lt;&amp;lt;node&amp;gt;&amp;gt;&lt;br&gt;${uniqueKeys[i]}" style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;fillColor=#b0e3e6;" vertex="1" parent="1"> <mxGeometry x="${(i+1) * 170}" y="240" width="120" height="80" as="geometry" /> </mxCell>`;
            mxCells.push(cellCode);
            nodeLocationX[uniqueKeys[i]] = (i+1) * 170;
            last_diagram_x = i * 140;
            last_diagram_id = i+2;
            uniqueKeysId[uniqueKeys[i]] = i + 2

            var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmPedge-${i +100 }" value="&amp;lt;&amp;lt;govern&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=50;entryDy=0;entryPerimeter=0;fillColor=#b0e3e6;" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-1" target="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" edge="1"><mxGeometry relative="1" as="geometry" /><mxGeometry relative="1" as="geometry"><mxPoint x="${(i) *85-75}" y="50" as="offset"/></mxGeometry></mxCell>`
            if(i==0){
                cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmPedge-${i +100 }" value="&amp;lt;&amp;lt;govern&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-1" target="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" edge="1"> <mxGeometry relative="1" as="geometry" /> </mxCell>`
            }
            mxCells.push(cellCode);
        }
    }
    var previousTargetNode = '';
    // action추가
    for(var i=0; i<deployInfo.length; i++){
        var targetNode = deployInfo[i][0];
        var targetNodeLocationX = nodeLocationX[targetNode];
        // var targetNodeLocationY = nodeLocationY
        if(nodeLocationY[deployInfo[i][0]]==undefined){
            nodeLocationY[deployInfo[i][0]] = 370;
            edgeLocationY[deployInfo[i][0]] = 400;
        }

        var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" value="&amp;lt;&amp;lt;container&amp;gt;&amp;gt;&lt;br&gt;${deployInfo[i][1]}" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"> <mxGeometry x="${targetNodeLocationX}" y="${nodeLocationY[deployInfo[i][0]]}" width="120" height="60" as="geometry" /> </mxCell>`
        nodeLocationY[deployInfo[i][0]] = nodeLocationY[deployInfo[i][0]] + 110;
        mxCells.push(cellCode);
        // 첫연결 엣지일 경우 화살표에 deployed 추가 
        if(i==0){
          var cellCode = `<mxCell id="s7v0z9aipiOLFaHwzPqtActionEdge-${last_diagram_id+i+1}" value="&amp;lt;&amp;lt;deployed&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=0;entryDy=30;entryPerimeter=0;" edge="1" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" target="GmCxI74Y2WdGR4Kf1rmP-${uniqueKeysId[deployInfo[i][0]]}"> <mxGeometry relative="1" as="geometry"> <Array as="points"> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="${edgeLocationY[deployInfo[i][0]]}" /> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="270" /> </Array> </mxGeometry> </mxCell>`
        }
        // 첫번째 연결 엣지가 이나고, 액션의 타겟노드가 변경 될 경우 deployed 추가
        else if(previousTargetNode !=targetNode){
          var cellCode = `<mxCell id="s7v0z9aipiOLFaHwzPqtActionEdge-${last_diagram_id+i+1}" value="&amp;lt;&amp;lt;deployed&amp;gt;&amp;gt;" style="edgeStyle=orthogonalEdgeStyle;endArrow=open;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=0;entryDy=30;entryPerimeter=0;" edge="1" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" target="GmCxI74Y2WdGR4Kf1rmP-${uniqueKeysId[deployInfo[i][0]]}"> <mxGeometry relative="1" as="geometry"> <Array as="points"> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="${edgeLocationY[deployInfo[i][0]]}" /> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="270" /> </Array> </mxGeometry> </mxCell>`
        }else{
          var cellCode = `<mxCell id="s7v0z9aipiOLFaHwzPqtActionEdge-${last_diagram_id+i+1}"  style="edgeStyle=orthogonalEdgeStyle;endArrow=open;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=0;entryDy=30;entryPerimeter=0;" edge="1" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" target="GmCxI74Y2WdGR4Kf1rmP-${uniqueKeysId[deployInfo[i][0]]}"> <mxGeometry relative="1" as="geometry"> <Array as="points"> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="${edgeLocationY[deployInfo[i][0]]}" /> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="270" /> </Array> </mxGeometry> </mxCell>`
        }
        previousTargetNode = targetNode;
        mxCells.push(cellCode);
        edgeLocationY[deployInfo[i][0]] = edgeLocationY[deployInfo[i][0]]+110
    }

    // 초기 값
    var xmlData = `<mxGraphModel dx="1433" dy="797" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0" /><mxCell id="1" parent="0" /> <mxCell id="GmCxI74Y2WdGR4Kf1rmP-1" value="&amp;lt;&amp;lt;node&amp;gt;&amp;gt;&lt;br&gt;Master" style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;fillColor=#b0e3e6;" vertex="1" parent="1"><mxGeometry x="170" y="120" width="120" height="80" as="geometry" /></mxCell>`;
    
    mxCells.forEach(function (cell) {
        xmlData += cell;
    });

    //마지막 값
    xmlData += `</root></mxGraphModel>`;

    return xmlData
}
/*
<script>
    { window.onload = function () {
    // "관리" 버튼을 클릭했을 때 팝업을 표시하는 함수
    let currentUser = null;
    function showPopup(button) {
      const popupContainer = document.getElementById("popupContainer");
      const popup = document.getElementById("popup");
      popupContainer.style.display = "block";
      popup.style.width = "500px"; // 가로 크기 조절
      popup.style.height = "500px"; // 세로 크기 조절

      const group = button.getAttribute("data-group");
      const groupSelect = document.getElementById("group");
      if (group === "111") {
        // "tmp" 옵션을 선택합니다.
        groupSelect.value = "111";
      } else if (group === "999") {
        // "admin" 옵션을 선택합니다.
        groupSelect.value = "999";
      }

      const valid = button.getAttribute("data-valid");
      if (valid === "1") {
        toggleSwitch.checked = true;
      } else {
        toggleSwitch.checked = false;
      }

      const user = button.getAttribute("data-user");
      currentUser = user;
    }

    // 팝업을 닫는 함수
    function closePopup() {
      const popupContainer = document.getElementById("popupContainer");
      popupContainer.style.display = "none";
    }

    function togglePopup() {
      const popupContainer = document.getElementById("popupContainer");
      const toggleSwitch = document.getElementById("toggleSwitch");

      if (toggleSwitch.checked) {
      } else {
      }
    }

    function saveInfo() {
      // select 박스의 값을 가져오기
      const selectedGroup = document.getElementById("group").value;

      // 토글 버튼의 상태 가져오기
      const toggleSwitch = document.getElementById("toggleSwitch");
      if (toggleSwitch.checked == 1) {
        isActive = 1;
      } else {
        isActive = 0;
      }
      fetch("/changeInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedGroup, isActive, user: currentUser }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.error) {
            alert("시스템 에러");
          } else if (data.result) {
            alert("정보 변경 완료");
            window.location.reload();
          } else if (!data.result) {
            alert("정보 변경 실패.");
          }
        });
    }

    // 버튼 클릭 시 모달 표시
    const modalButton = document.getElementById("user-name");
    const modal = document.getElementById("userInfoModal");
    const closeModalButton = document.getElementById("closeModal");
    const logoutButton = document.getElementById("logoutButton");

    modalButton.addEventListener("click", function () {
      modal.style.display = "block";
    });

    // 모달 닫기 버튼 클릭 시 모달 숨김
    closeModalButton.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // 로그아웃 버튼 클릭 시 로그아웃 처리 (예: 페이지 리로드)
    logoutButton.addEventListener("click", function () {
      // 로그아웃 처리를 여기에 추가
      // 예: window.location.href = '/logout';  // 로그아웃 URL로 리다이렉트
    });

    // 모달 외부 클릭 시 모달 숨김
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }; }
</script>*/



