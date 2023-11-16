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
    var cell = evt.getProperty('cell'); // 클릭한 셀
    var valueString='';
    if (cell != null && cell.style.includes('rounded=1')) { //cell이 null아니고 엣지도 아닌경우 
        var valueString = cell.value.outerHTML;
        if(valueString==undefined){
            valueString = cell.value;
        }
        var regex = /&quot;&gt;(.+?)&lt;/;
			var matches = [];
			// var match;
			var match = regex.exec(valueString);
			var extractedString = match ? match[1] : null;
			if(extractedString.includes('['||']')){
				extractedString=extractedString.substring(1,extractedString.length -1);
			}
			matches.push(extractedString);
			
			var cellName = matches;
        var cellId = cell.id
        localStorage.setItem(projectName+'_current_workflowName', cellName)
        workflowProcessView(cellName,cellId,cell)
    }
}

// sub-content1
function businessProcessView(projectName){
    var xmlData = localStorage.getItem(projectName+'_businessProcessXml')
    var container = document.getElementById('businessProcessViewContainer');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    graph.addListener(mxEvent.CLICK, businessProcessViewClickHandler);
    graph.refresh();
}
var intervalLogDeploymentView = '';
// sub-content2
function workflowProcessView(cellName,cellId,cell){
    var containerElement = document.getElementById("workflowProcessView");
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

    var xmlData = localStorage.getItem(projectName+'_'+cellId+'#'+cellName)
    var container = document.getElementById('workflowProcessView');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    // graph.addListener(mxEvent.CLICK, workflowProcessViewHandler);
    codec.decode(doc.documentElement, graph.getModel());
    graph.refresh();

    // Activity 클릭 했을 때 Activity 상태 출력
    intervalLogDeploymentView = setInterval(() => deploymentView(false), 1000);
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
    const url = 'http://127.0.0.1:4999/log?workflow_name='+encodeURIComponent(workflowName);

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

        // 공백 문자 변환 하는 곳
        message = message.replace(/ /g, '&nbsp;'); // 공백문자-> &nbsp;로
        message = message.replace(/\n/g, '<br>'); // 개행문자-> <br>로 

        logEntry.innerHTML = message; // HTML을 해석

        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight; // 스크롤 맨 아래로 이동
    };
} 

function deploymentView(actionStatusFlag,actionName,actionId) {
    // try {
        workflowName = localStorage.getItem(projectName+'_current_workflowName')

        const url = `http://127.0.0.1:4999/status?workflow_name=${encodeURIComponent(workflowName)}`;

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

            // 순우 배포 다이어그램 그릴 때 필요한 정보 가저옴
            var deployInfo = getDeployInfo(actionKeys,actionStatus)
            // 로그 출력
            // const logContainer2 = document.querySelector('.logContainer2');
            // const logEntry = document.createElement('div');
            


            var containerElement = document.getElementById('deploymentView');
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
            var container = document.getElementById('deploymentView');
            var graph = new Graph(container);
            var doc = mxUtils.parseXml(xmlData);
            var codec = new mxCodec(doc);
            // graph.addListener(mxEvent.CLICK, subContent2ClickHandler);
            codec.decode(doc.documentElement, graph.getModel());
            graph.refresh();

            if(statusJsonData.metadata.labels["workflows.argoproj.io/completed"]=='true'){
                clearInterval(intervalLogDeploymentView)
                logContainer()
                
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
        
    // }catch{

    // }
}
// async function logContainer2(actionStatusFlag,actionName,actionId) {
//     try {
//         workflowName = localStorage.getItem(projectName+'_current_workflowName')

//         const url = `http://127.0.0.1:4999/status?workflow_name=${encodeURIComponent(workflowName)}`;

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

// function submitButton(){
//     document.getElementById("submitButton").addEventListener("click", function(){
//         const fileInput = document.getElementById('fileInput');
//         const shouldExecute = confirm('Argo Workflow에 전송하시겠습니까?');
//         if (shouldExecute){
//             if (fileInput.files.length > 0) {
//                 const selectedFile = fileInput.files[0];
//                 readFileContent(selectedFile);
//             }else {
//                 alert('Please select a file.');
//             }
//         }else{
//             console.log('사용자가 취소함');
//         }
//     });
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

    var deployInfo = [
        ['soonwoo', 'hello1', 'Succeeded'],
        ['soonwoo', 'hello2', 'Succeeded'],
        ['soonwoo', 'hello3', 'Succeeded'],
        ['soonwoo1', 'hello4', 'Succeeded'],
        ['soonwoo1', 'hello5', 'Succeeded'],
        ['soonwoo3', 'hello6', 'Succeeded'],
        ['poontoo', 'hello11', 'fail']
      ];

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
            var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" value="${uniqueKeys[i]}" style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;" vertex="1" parent="1"> <mxGeometry x="${(i+1) * 170}" y="240" width="120" height="80" as="geometry" /> </mxCell>`;
            mxCells.push(cellCode);
            nodeLocationX[uniqueKeys[i]] = (i+1) * 170;
            last_diagram_x = i * 140;
            last_diagram_id = i+2;
            uniqueKeysId[uniqueKeys[i]] = i + 2

            var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmPedge-${i +100 }" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=50;entryDy=0;entryPerimeter=0;" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-1" target="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" edge="1"><mxGeometry relative="1" as="geometry" /></mxCell>`
            if(i==0){
                cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmPedge-${i +100 }" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-1" target="GmCxI74Y2WdGR4Kf1rmP-${i + 1+1}" edge="1"> <mxGeometry relative="1" as="geometry" /> </mxCell>`
            }
            mxCells.push(cellCode);
        }
    }

    // action추가
    for(var i=0; i<deployInfo.length; i++){
        var targetNode = deployInfo[i][0];
        var targetNodeLocationX = nodeLocationX[targetNode];
        // var targetNodeLocationY = nodeLocationY
        if(nodeLocationY[deployInfo[i][0]]==undefined){
            nodeLocationY[deployInfo[i][0]] = 370;
            edgeLocationY[deployInfo[i][0]] = 400;
        }

        var cellCode = `<mxCell id="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" value="${deployInfo[i][1]}" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1"> <mxGeometry x="${targetNodeLocationX}" y="${nodeLocationY[deployInfo[i][0]]}" width="120" height="60" as="geometry" /> </mxCell>`
        nodeLocationY[deployInfo[i][0]] = nodeLocationY[deployInfo[i][0]] + 110;
        mxCells.push(cellCode);

        var cellCode = `<mxCell id="s7v0z9aipiOLFaHwzPqtActionEdge-${last_diagram_id+i+1}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0;entryY=0;entryDx=0;entryDy=30;entryPerimeter=0;" edge="1" parent="1" source="GmCxI74Y2WdGR4Kf1rmP-${last_diagram_id+i+1}" target="GmCxI74Y2WdGR4Kf1rmP-${uniqueKeysId[deployInfo[i][0]]}"> <mxGeometry relative="1" as="geometry"> <Array as="points"> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="${edgeLocationY[deployInfo[i][0]]}" /> <mxPoint x="${nodeLocationX[deployInfo[i][0]]-20}" y="270" /> </Array> </mxGeometry> </mxCell>`
        mxCells.push(cellCode);
        edgeLocationY[deployInfo[i][0]] = edgeLocationY[deployInfo[i][0]]+110
    }

    // 초기 값
    var xmlData = `<mxGraphModel dx="1433" dy="797" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0"><root><mxCell id="0" /><mxCell id="1" parent="0" /> <mxCell id="GmCxI74Y2WdGR4Kf1rmP-1" value="Master" style="shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;" vertex="1" parent="1"><mxGeometry x="170" y="120" width="120" height="80" as="geometry" /></mxCell>`;
    
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



// var EditDataDialog = function(ui, cell)
// {
// 	var div = document.createElement('div');
// 	var editDataTitle = document.createElement('div');
// 	editDataTitle.textContent = 'EditData';
// 	editDataTitle.style.cssText='color: #353535;font-family: Inter;font-size: 24px;font-style: normal;font-weight: 500;line-height: normal; padding:20px;'
// 	div.appendChild(editDataTitle);
// 	div.style.cssText = 'height:70px;border-radius: 5px 5px 0px 0px;background: #E8F3FF;'

// 	var graph = ui.editor.graph;
	
// 	var value = graph.getModel().getValue(cell);
// 	value.removeAttribute('xmlns');
	
// 	// Converts the value to an XML node
// 	if (!mxUtils.isNode(value))
// 	{
// 		var doc = mxUtils.createXmlDocument();
// 		var obj = doc.createElement('object');
// 		obj.setAttribute('label', value || '');
// 		value = obj;
// 	}
	
// 	var meta = {};
	
// 	try
// 	{
// 		var temp = mxUtils.getValue(ui.editor.graph.getCurrentCellStyle(cell), 'metaData', null);
		
// 		if (temp != null)
// 		{
// 			meta = JSON.parse(temp);
// 		}
// 	}
// 	catch (e) 
// 	{
// 		// ignore
// 	}
	
// 	// Creates the dialog contents
// 	// var form = new mxForm('properties');
// 	// form.table.style.width = '100%';
// 	var form = document.createElement('div');
// 	form.style.width = '100%';
// 	form.style.padding = '2%';

	
	

// 	// var diagram_shape = cell.BaseFormatPanel.scope[0]
// 	// console.log(diagram_shape)
// 	var attrs = value.attributes; // 순우 property 값 저장 되어있는 변수
// 	var names = [];
// 	var texts = [];
// 	var count = 0;

// 	var id = (EditDataDialog.getDisplayIdForCell != null) ?
// 		EditDataDialog.getDisplayIdForCell(ui, cell) : null; // 민수 고유한 인덱스 아이디 찾는 곳
// 	// flowDict[id]=NULL;
// 	var addRemoveButton = function(text, name)
// 	{
// 		var wrapper = document.createElement('div');
// 		wrapper.style.position = 'relative';
// 		wrapper.style.paddingRight = '20px';
// 		wrapper.style.boxSizing = 'border-box';
// 		wrapper.style.width = '100%';
		
// 		var removeAttr = document.createElement('a');
// 		var img = mxUtils.createImage(Dialog.prototype.closeImage);
// 		img.style.height = '9px';
// 		img.style.fontSize = '9px';
// 		img.style.marginBottom = (mxClient.IS_IE11) ? '-1px' : '5px';
		
// 		removeAttr.className = 'geButton';
// 		removeAttr.setAttribute('title', mxResources.get('delete'));
// 		removeAttr.style.position = 'absolute';
// 		removeAttr.style.top = '4px';
// 		removeAttr.style.right = '0px';
// 		removeAttr.style.margin = '0px';
// 		removeAttr.style.width = '9px';
// 		removeAttr.style.height = '9px';
// 		removeAttr.style.cursor = 'pointer';
// 		removeAttr.appendChild(img);
		
// 		var removeAttrFn = (function(name)
// 		{
// 			return function()
// 			{
// 				var count = 0;
				
// 				for (var j = 0; j < names.length; j++)
// 				{
// 					if (names[j] == name)
// 					{
// 						texts[j] = null;
// 						form.table.deleteRow(count + ((id != null) ? 1 : 0));
						
// 						break;
// 					}
					
// 					if (texts[j] != null)
// 					{
// 						count++;
// 					}
// 				}
// 			};
// 		})(name);
		
// 		mxEvent.addListener(removeAttr, 'click', removeAttrFn);
		
// 		var parent = text.parentNode;
// 		wrapper.appendChild(text);
// 		wrapper.appendChild(removeAttr);
// 		parent.appendChild(wrapper);
// 	};

// 	var addTextArea = function(name, value) {
// 		var label = document.createElement('div');
// 		label.textContent = name;
// 		label.style.cssText = 'color: #353535;font-family: Inter;font-size: 20px;font-style: normal;font-weight: 500;line-height: normal;'
// 		form.appendChild(label);
	
// 		var textarea = document.createElement('textarea');
// 		textarea.value = value;
// 		// textarea.style.width = '100%';
// 		textarea.style.cssText ='color: #353535;font-family: Inter;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal; width:100%;border-radius: 5px;border: 1px solid #9B9B9B;'
	
// 		if (value.indexOf('\n') > 0) {
// 			textarea.setAttribute('rows', '5');
// 		}
	
// 		form.appendChild(textarea);
	
// 		addRemoveButton(textarea, name);
	
// 		if (meta[name] != null && meta[name].editable == false) {
// 			textarea.setAttribute('disabled', 'disabled');
// 		}
// 	};


// 	//original
// 	// var addTextArea = function(index, name, value)
// 	// {
// 	// 	names[index] = name;
// 	// 	texts[index] = form.addTextarea(names[count] + ':', value, 2);
// 	// 	texts[index].style.width = '100%';
		
// 	// 	if (value.indexOf('\n') > 0) //개행문자가 포함되어있다면 얼마나 늘릴지
// 	// 	{
// 	// 		texts[index].setAttribute('rows', '5');//순우 editdata 입력칸 높이 5로 늘리는 부분 
// 	// 	}
		
// 	// 	addRemoveButton(texts[index], name);
		
// 	// 	if (meta[name] != null && meta[name].editable == false)
// 	// 	{
// 	// 		texts[index].setAttribute('disabled', 'disabled');
// 	// 	}
// 	// };
	
// 	var temp = [];
// 	var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();
// 	// DiRoundedRectangle 일 경우 고정 값 넣기 순우
// 	var extracted = extractObjects(id)
// 	try{
// 		if (extracted=='object label="" '|| extracted =='mxCell '){
// 			if (DiagramClicked.includes('RoundedRectangle')){
// 				// var RoundedRectangleFixProperty = document.createAttribute('Name')
// 				// RoundedRectangleFixProperty.value = ''
// 				var RoundedRectangleFixProperty2 = document.createAttribute('Description')
// 				RoundedRectangleFixProperty2.value = ''
// 				var RoundedRectangleFixProperty3 = document.createAttribute('Input_information')
// 				RoundedRectangleFixProperty3.value = ''
// 				var RoundedRectangleFixProperty4 = document.createAttribute('output_information')
// 				RoundedRectangleFixProperty4.value = ''
// 				// attrs.setNamedItem(RoundedRectangleFixProperty)
// 				attrs.setNamedItem(RoundedRectangleFixProperty2)
// 				attrs.setNamedItem(RoundedRectangleFixProperty3)
// 				attrs.setNamedItem(RoundedRectangleFixProperty4)
// 			}
// 			// DiDiamond 일 경우 고정 값 넣기 순우
// 			else if (DiagramClicked.includes('DiDiamond')){
// 				var DiDiamondFixProperty = document.createAttribute('DiDiamondFixPropertyKey')
// 				DiDiamondFixProperty.value = 'DiDiamondFixPropertyValue'
// 				attrs.setNamedItem(DiDiamondFixProperty)
// 			}
// 			// Class 일 경우 고정 값 넣기 순우
// 			else if (DiagramClicked.includes('Class')){
// 				// var DiClassFixProperty = document.createAttribute('Name')
// 				// DiClassFixProperty.value = ''
// 				// 순우 id 값은 자동으로 할당되기 때문에 필요 없을거 같아서 일단 주석 처리
// 				// var DiClassFixProperty2 = document.createAttribute('Id') 
// 				// DiClassFixProperty2.value = ''
// 				var DiClassFixProperty3 = document.createAttribute('Text')
// 				DiClassFixProperty3.value = ''

// 				// attrs.setNamedItem(DiClassFixProperty)
// 				// attrs.setNamedItem(DiClassFixProperty2)
// 				attrs.setNamedItem(DiClassFixProperty3)

// 			}
// 			else if (DiagramClicked.includes('Rectangle')){
// 				var DiClassFixProperty = document.createAttribute('arguments.parameters')
// 				DiClassFixProperty.value = `name:""  
// value:"{{workflow.outputs.parameters.parameters-}}"`
// 				var DiClassFixProperty2 = document.createAttribute('arguments.artifacts')
// 				DiClassFixProperty2.value = `name:"" 
// from:"{{workflow.outputs.parameters.artifacts-}}"`
// 				// var DiClassFixProperty2 = document.createAttribute('Output')
// 				// DiClassFixProperty2.value = ''
				
// 				attrs.setNamedItem(DiClassFixProperty)
// 				attrs.setNamedItem(DiClassFixProperty2)
// 			}
// 			else if (DiagramClicked.includes('Container')){
// 				var DiClassFixProperty1 = document.createAttribute('image')
// 				DiClassFixProperty1.value = ''
// 				var DiClassFixProperty2 = document.createAttribute('command')
// 				DiClassFixProperty2.value = '[]'
// 				var DiClassFixProperty3 = document.createAttribute('args')
// 				DiClassFixProperty3.value = '[""]'
// 				var DiClassFixProperty4 = document.createAttribute('resource')
// 				DiClassFixProperty4.value = ''
// 				var DiClassFixProperty5 = document.createAttribute('volumeMount')
// 				DiClassFixProperty5.value = ''
// 				var DiClassFixProperty6 = document.createAttribute('environment')
// 				DiClassFixProperty6.value = ''
// 				var DiClassFixProperty7 = document.createAttribute('inputs.parameters')
// 				DiClassFixProperty7.value = `name : ""    
// value : ""`
// 				// DiClassFixProperty7.value = 'value : ""'
// 				var DiClassFixProperty8 = document.createAttribute('outputs.parameters')
// 				DiClassFixProperty8.value = `name : ""    
// value : ""    
// valueFrom.path : ""`
// 				var DiClassFixProperty9 = document.createAttribute('inputs.artifacts')
// 				DiClassFixProperty9.value = `name : ""    
// path : ""`
// 				var DiClassFixProperty10 = document.createAttribute('outputs.artifacts')
// 				DiClassFixProperty10.value = `name : ""    
// path : ""`

// 				attrs.setNamedItem(DiClassFixProperty1)
// 				attrs.setNamedItem(DiClassFixProperty2)
// 				attrs.setNamedItem(DiClassFixProperty3)
// 				// attrs.setNamedItem(DiClassFixProperty4)
// 				// attrs.setNamedItem(DiClassFixProperty5)
// 				// attrs.setNamedItem(DiClassFixProperty6)
// 				attrs.setNamedItem(DiClassFixProperty7)
				
// 				attrs.setNamedItem(DiClassFixProperty8)
// 				attrs.setNamedItem(DiClassFixProperty9)
// 				attrs.setNamedItem(DiClassFixProperty10)
// 				// for (var i =1 ; i<11; i++){
// 				// 	var a = 'DiClassFixProperty'+String(i)
// 				// 	attrs.setNamedItem(a)
// 				// }
// 			}
// 			else if (DiagramClicked.includes('Script')){
// 				var DiClassFixProperty = document.createAttribute('interpreter')
// 				DiClassFixProperty.value = ''
// 				var DiClassFixProperty2 = document.createAttribute('source')
// 				DiClassFixProperty2.value = ''
// 				var DiClassFixProperty3 = document.createAttribute('command')
// 				DiClassFixProperty3.value = ''
// 				var DiClassFixProperty4 = document.createAttribute('args')
// 				DiClassFixProperty4.value = ''
				
// 				attrs.setNamedItem(DiClassFixProperty)
// 				attrs.setNamedItem(DiClassFixProperty2)
// 				attrs.setNamedItem(DiClassFixProperty3)
// 				attrs.setNamedItem(DiClassFixProperty4)
// 			}
// 			else if (DiagramClicked.includes('Resource')){
// 				var DiClassFixProperty = document.createAttribute('action')
// 				DiClassFixProperty.value = ''
// 				var DiClassFixProperty2 = document.createAttribute('manifest')
// 				DiClassFixProperty2.value = ''
				
// 				attrs.setNamedItem(DiClassFixProperty)
// 				attrs.setNamedItem(DiClassFixProperty2)
// 			}
// 			else if (DiagramClicked.includes('Sensor')){
// 				var DiClassFixProperty = document.createAttribute('eventSpecification')
// 				DiClassFixProperty.value = ''
				
// 				attrs.setNamedItem(DiClassFixProperty)
// 			}
// 			else if (DiagramClicked.includes('Suspend')){
// 				var DiClassFixProperty = document.createAttribute('duration')
// 				DiClassFixProperty.value = ''
				
// 				attrs.setNamedItem(DiClassFixProperty)
// 			}
// 		}
// 	}catch{
// 		console.log('edit error')
// 	}
	
// 	clicked.push(id)


// 	console.log(attrs)
// 	// for (var i = 0; i < attrs.length; i++) // 순우 다이어그램 노드에 property 값을 하나하나 추가하는 부분
// 	// {
// 	// 	if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders')
// 	// 	{
// 	// 		temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
// 	// 	}
// 	// }
// 	for (var i = 0; i < attrs.length; i++) {
// 		if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders') {
// 			temp.push({ name: attrs[i].nodeName, value: attrs[i].nodeValue });
// 		}
// 	}

// 	// if (id != null)
// 	// {	
// 	// 	var text = document.createElement('div');
// 	// 	text.style.width = '100%';
// 	// 	text.style.fontSize = '11px';
// 	// 	text.style.textAlign = 'center';
// 	// 	mxUtils.write(text, id);
		
// 	// 	// form.addField('EdgeCps Name' + ':', 'EdgeCps Porperty');
// 	// 	// form.addField('ID', 'd');
// 	// 	// form.addField( text, false)
// 	// 	form.addField(mxResources.get('id') , text);
// 	// 	console.log('민수 아이디 입력')
// 	// }
	
// 	// for (var i = 0; i < temp.length; i++)
// 	// {
// 	// 	addTextArea(count, temp[i].name, temp[i].value);
// 	// 	count++;
// 	// }
// 	for (var i = 0; i < temp.length; i++) {
// 		addTextArea(temp[i].name, temp[i].value);
// 	}
	
// 	var top = document.createElement('div');
// 	top.style.cssText = 'position:absolute;left:30px;right:30px;overflow-y:auto;top:40px;bottom:80px;';
// 	// 순우 editdata css반영
// 	top.className = 'editDataDialog';
// 	top.style.borderRadius = '10px';
// 	top.style.border = '1px solid #9B9B9B';
// 	top.style.top = '20%';

// 	// top.appendChild(form.table);
// 	top.appendChild(form);

// 	var newProp = document.createElement('div');
// 	newProp.style.boxSizing = 'border-box';
// 	newProp.style.paddingRight = '160px';
// 	newProp.style.whiteSpace = 'nowrap';
// 	newProp.style.marginTop = '6px';
// 	newProp.style.width = '100%';
	
// 	var nameInput = document.createElement('input');
// 	// nameInput.setAttribute('placeholder', mxResources.get('enterPropertyName'));
// 	// nameInput.setAttribute('type', 'text');
// 	// nameInput.setAttribute('size', (mxClient.IS_IE || mxClient.IS_IE11) ? '36' : '40');
// 	// nameInput.style.boxSizing = 'border-box';
// 	// nameInput.style.marginLeft = '2px';
// 	// nameInput.style.width = '100%';
	
// 	// newProp.appendChild(nameInput);
// 	top.appendChild(newProp);
// 	div.appendChild(top);
	

// 	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
// 	{
// 		ui.hideDialog.apply(ui, arguments);
// 	});
	
// 	cancelBtn.className = 'geBtn';
	
// 	var applyBtn = mxUtils.button(mxResources.get('apply'), function()
// 	{
// 		try
// 		{
// 			try{
// 				// req editdata에서 selectbox로 선택 한 값 로컬스토리지에 저장
// 				if (cell.value.includes('non functional')) {
// 					var selectedReqKind = reqSelectBox.value
// 					var reqId = document.querySelector("body > div.geDialog.right_sidebar > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > div").textContent
// 					localStorage.setItem(projectName +'_'+reqId+ '#requirementKind', selectedReqKind)
// 				}
// 			}catch{
// 				if (cell.value.outerHTML.includes('non functional')) {
// 					var selectedReqKind = reqSelectBox.value
// 					var reqId = document.querySelector("body > div.geDialog.right_sidebar > div > div:nth-child(1) > table > tbody > tr:nth-child(1) > td:nth-child(2) > div").textContent
// 					localStorage.setItem(projectName +'_'+reqId+ '#requirementKind', selectedReqKind)
// 				}
// 			}
			

// 			ui.hideDialog.apply(ui, arguments);
			
// 			// Clones and updates the value
// 			value = value.cloneNode(true);
// 			var removeLabel = false;
			
// 			for (var i = 0; i < names.length; i++)
// 			{
// 				if (texts[i] == null)
// 				{
// 					value.removeAttribute(names[i]);
// 				}
// 				else
// 				{
// 					value.setAttribute(names[i], texts[i].value);
// 					removeLabel = removeLabel || (names[i] == 'placeholder' &&
// 						value.getAttribute('placeholders') == '1');
// 				}
// 			}
			
// 			// Removes label if placeholder is assigned
// 			if (removeLabel)
// 			{
// 				value.removeAttribute('label');
// 			}
			
// 			// Updates the value of the cell (undoable)
// 			graph.getModel().setValue(cell, value);
// 			value.removeAttribute('xmlns');
// 			getObjectPropertyValue(value,cell.id,cell.mxObjectId) // 민수 property 값을 바인딩 하는 곳

// 		}
// 		catch (e)
// 		{
// 			mxUtils.alert(e);
// 		}
// 	});
// 	applyBtn.className = 'geBtn gePrimaryBtn minsoo'; // 민수 property입력 버튼 

// 	function updateAddBtn()
// 	{
// 		if (nameInput.value.length > 0)
// 		{
// 			addBtn.removeAttribute('disabled');
// 		}
// 		else
// 		{
// 			addBtn.setAttribute('disabled', 'disabled');
// 		}
// 	};

// 	mxEvent.addListener(nameInput, 'keyup', updateAddBtn);
	
// 	// Catches all changes that don't fire a keyup (such as paste via mouse)
// 	mxEvent.addListener(nameInput, 'change', updateAddBtn);
	
// 	var buttons = document.createElement('div');
// 	buttons.id = 'editData'//순우
// 	buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;'

// 	if (ui.editor.graph.getModel().isVertex(cell) || ui.editor.graph.getModel().isEdge(cell))
// 	{
// 		var replace = document.createElement('span');
// 		replace.style.marginRight = '10px';
// 		var input = document.createElement('input');
// 		input.setAttribute('type', 'checkbox');
// 		input.style.marginRight = '6px';
		
// 		if (value.getAttribute('placeholders') == '1')
// 		{
// 			input.setAttribute('checked', 'checked');
// 			input.defaultChecked = true;
// 		}
	
// 		mxEvent.addListener(input, 'click', function()
// 		{
// 			if (value.getAttribute('placeholders') == '1')
// 			{
// 				value.removeAttribute('placeholders');
// 			}
// 			else
// 			{
// 				value.setAttribute('placeholders', '1');
// 			}
// 		});
		
// 		replace.appendChild(input);
// 		mxUtils.write(replace, mxResources.get('placeholders'));
		
// 		if (EditDataDialog.placeholderHelpLink != null)
// 		{
// 			var link = document.createElement('a');
// 			link.setAttribute('href', EditDataDialog.placeholderHelpLink);
// 			link.setAttribute('title', mxResources.get('help'));
// 			link.setAttribute('target', '_blank');
// 			link.style.marginLeft = '8px';
// 			link.style.cursor = 'help';
			
// 			var icon = document.createElement('img');
// 			mxUtils.setOpacity(icon, 50);
// 			icon.style.height = '16px';
// 			icon.style.width = '16px';
// 			icon.setAttribute('border', '0');
// 			icon.setAttribute('valign', 'middle');
// 			icon.style.marginTop = (mxClient.IS_IE11) ? '0px' : '-4px';
// 			icon.setAttribute('src', Editor.helpImage);
// 			link.appendChild(icon);
			
// 			replace.appendChild(link);
// 		}
		
// 		buttons.appendChild(replace);
// 	}
	
// 	if (ui.editor.cancelFirst)
// 	{
// 		buttons.appendChild(applyBtn);
// 		buttons.appendChild(cancelBtn);
		
// 	}
// 	else
// 	{
// 		buttons.appendChild(applyBtn);
// 		buttons.appendChild(cancelBtn);
// 	}

// 	div.appendChild(buttons);
// 	this.container = div;
// };
