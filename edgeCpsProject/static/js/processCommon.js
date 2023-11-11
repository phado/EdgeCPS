let processDict = [
  "overviewProcess",
  "requirementsProcess",
  "businessProcess",
  "workflowProcess",
  "searchReusablesProcess",
  "workflowImplementationProcess",
  "policyProcess",
  "runProcess",
];
let processXml = [
  "overviewProcessXML",
  "requirementsProcessXml",
  "businessProcessXml",
  "workflowProcessXml",
  "searchReusablesProcessXml",
  "workflowImplementationProcessXml",
  "policyProcessXml",
  "runProcessXml",
];

/**
 * process xml을 화면으로 불러오는 함수
 */
function uploadXML() {
  // console.log('다녀감')
  let xml = "";
  if (
    processDict[current_process] == "workflowProcess" ||
    processDict[current_process] == "runProcess" ||
    processDict[current_process] == "policyProcess"
  ) {
    var xmlKey = localStorage.getItem(projectName + "_nowWorkflow"); // 필요하면 워크플로우 프로세스의 항목을 가져온다.
    xml = localStorage.getItem(xmlKey); // 필요하면 워크플로우 프로세스의 항목을 가져온다.
  } else {
    xml = localStorage.getItem(projectName + "_" + processXml[current_process]); // 해당 프로세스의 xml을 불러온다.
  }

  if (xml == "") {
    return;
  }
  let doc = mxUtils.parseXml(xml);
  let codec = new mxCodec(doc);

  if (universalGraph && universalGraph !== "") {
    codec.decode(doc.documentElement, universalGraph.getModel());
    let elt = doc.documentElement.firstChild;
    let cells = [];
    while (elt != null) {
      let cell = codec.decode(elt);
      if (cell != undefined) {
        if (
          cell.id != undefined &&
          cell.parent != undefined &&
          cell.id == cell.parent
        ) {
          elt = elt.nextSibling;
          continue;
        }
        cells.push(cell);
      }
      elt = elt.nextSibling;
    }
    processGraphxml = xml;
    universalGraph.addCells(cells);
  }
}

/**
 * 모든 프로세스를 모아서 프로젝트 저장
 */
function saveAllProject() {
  updateLocalStorage(flowDict, processGraphxml);
  ////////////////yaml생성에 필요한 데이터들////////////////////////
  var workflowXMLValue = [];
  let get_localstorage_xml_list = [
    "overviewProcessXML",
    "requirementsProcessXml",
    "businessProcessXml",
  ];
  var stringWorkflowList = localStorage.getItem(projectName + "_workflowXML");
  var workflowList = JSON.parse(stringWorkflowList);
  try {
    for (var i = 0; i < workflowList.length; i++) {
      // get_localstorage_xml_list.push(workflowList[i]);
      // get_localstorage_xml_list.push(workflowList[i]+'_requirement');
      // get_localstorage_xml_list.push(workflowList[i]+'_nodeSelector');
      for (var j = 0; j < localStorage.length; j++) {
        const key = localStorage.key(j);
        if (key.includes(projectName + "_" + workflowList[i])) {
          workflowXMLValue.push(key);
        }
      }
      // get_localstorage_xml_list.push(workflowList[i]+'_flowDict');
    }
  } catch {}
  console.log(get_localstorage_xml_list);
  /////////////////////////////////////////
  let data = {};
  let processData = {};
  let workflowData = {};

  // 프로세스 저장
  for (var i = 0; i < get_localstorage_xml_list.length; i++) {
    var key = get_localstorage_xml_list[i];
    var value = localStorage.getItem(projectName + "_" + key);
    if (!value) {
      value = "";
    }
    processData[key] = value;
  }

  //워크플로우 저장
  // var workflowXMLValue = localStorage.getItem(projectName + '_workflowXML');
  // workflowXMLValue = JSON.parse(workflowXMLValue);

  if (workflowXMLValue) {
    for (var i = 0; i < workflowXMLValue.length; i++) {
      var key = workflowXMLValue[i];
      var value = localStorage.getItem(key);
      workflowData[key] = value;
    }
  }
  data["projectName"] = projectName;

  var projectNamejsonData = data;
  var processDatajsonData = processData;
  var workflowDatajsonData = workflowData;

  var dataToSend = {
    projectNamejsonData: projectNamejsonData,
    processDatajsonData: processDatajsonData,
    workflowDatajsonData: workflowDatajsonData,
  };
  // Flask의 saveProject 함수 호출
  fetch("/saveProject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data); // 서버에서 반환된 데이터 출력
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

/**
 * 민수 메뉴바에 버튼 추가 하는 방식 다른 자바스크립트 로드 속도 때문에 시간차가 필요하다
 */
document.addEventListener("DOMContentLoaded", function () {
  localStorage.setItem(
    projectName + "_current_processXml",
    processXml[current_process]
  ); //현재 작업중인 프로세스 xml저장
  localStorage.setItem(
    projectName + "_current_processDict",
    processDict[current_process]
  ); //현재 작업중인 프로세스 dict저장
  // previewBusinessProcess.show()
  if (
    processDict[current_process] != "workflowProcess" &&
    processDict[current_process] != "runProcess" &&
    processDict[current_process] != "policyProcess"
  ) {
    // 워크플로우 로컬스토리지 초기화
    localStorage.setItem(projectName + "_nowWorkflow", "");
  }

  let nowPorcess = localStorage.getItem(projectName + "_current_processDict"); // 현재 프로세스 확인

  function createSaveAsButton(buttonName) {
    var newButton = document.createElement("button");
    newButton.type = "button";
    newButton.className = "btn btn-primary";
    newButton.setAttribute("data-bs-toggle", "modal");
    newButton.setAttribute("data-bs-target", "#exampleModal");
    newButton.setAttribute(
      "data-bs-whatever",
      "새로운 프로젝트 이름을 입력해주세요"
    );
    newButton.textContent = buttonName;

    // 스타일 속성 변경
    newButton.style.backgroundColor = "#3853ff";
    newButton.style.color = "#fff";
    newButton.style.borderRadius = "5px";
    newButton.style.padding = "2px 8px";
    newButton.style.fontFamily = "'Inter Extra Light'";
    newButton.style.fontStyle = "normal";
    newButton.style.marginTop =  "-2px";

    var buttonContainer = document.getElementById("buttonContainer");

    return newButton;
  }

  // 민수 process 버튼 생성 메뉴 버튼 생성 함수
  function createButton(text, clickFunc, className, style) {
    var button = document.createElement("button");
    button.innerHTML = text;
    button.className = "processButton";
    // button.className = className;

    // 클래스 이름 추가
    if (className) {
      button.classList.add(className);
    }

    // 스타일 추가
    if (style) {
      button.style.cssText = style;
    }

    button.addEventListener("click", clickFunc); // 버튼 클릭 이벤트 리스너 추가
    return button;
  }

  function processLoadClick() {
    uploadXML();
  }

  function processSaveClick() {
    saveAllProject();
  }
  // 버튼을 감싸는 div
  var buttonContainer = document.createElement("div");

  buttonContainer.style.float = "right"; // 오른쪽으로 정렬
  buttonContainer.style.marginRight = "10px"; // 오른쪽 여백
  // buttonContainer.style.marginTop = "5px";

  buttonContainer.appendChild(
    createButton(
      "Save All",
      processSaveClick,
      "saveButton",
      "background-color: #3853ff; color: #fff; border-radius: 5px; padding: 2px 8px; font-family: 'Inter Extra Light'; font-style: normal;"
    )
  ); // process-save 버튼
  // buttonContainer.appendChild(
  //   createButton(
  //     "Save As",
  //     openSaveModal,
  //     "saveButton",
  //     "background-color: #3853ff; color: #fff; border-radius: 5px; padding: 2px 8px; font-family: 'Inter Extra Light'; font-style: normal;"
  //   )
  // ); // process-save 버튼
  buttonContainer.appendChild(createSaveAsButton("Save As")); // process-save-as 버튼

  function openSaveModal() {
    var saveModal = document.getElementById("saveModal");
    saveModal.style.display = "block";
  }
  //
  // buttonContainer.appendChild(createButton("process-load", processLoadClick)); // process-load 버튼

  // 버튼을 추가할 위치의 요소를 선택 (여기서는 "right_sidebar" 클래스를 가진 div)
  var targetElement = document.querySelector(".geMenubar");

  // targetElement가 null일 경우 예외 처리
  if (targetElement !== null) {
    targetElement.appendChild(buttonContainer);
  } else {
    // 일정 시간(예: 0.5초) 이후에 다시 시도
    setTimeout(function () {
      let targetElementRetry = document.querySelector(".geMenubar"); // save, load 버튼 생성
      // 순우 이전 프로세스 보기
      var previousContainer =
        document.getElementsByClassName("previousProcess");
      try {
        previousContainer[0].appendChild(
          createButton("Requirement Process", function () {
            var previousXML = localStorage.getItem(
              projectName + "_requirementsProcessXml"
            );
            // preViewClick(previousXML);
            window.open(
              "/previous?ProjectName=" +
                projectName +
                "&ProcessName=requirementsProcess",
              "Popup",
              "width=1200, height=700"
            );
          })
        );
        if (
          process_name == "workflowProcess" ||
          process_name == "policyProcess"
        ) {
          previousContainer[0].appendChild(
            createButton("Business Process", function () {
              var previousXML = localStorage.getItem(
                projectName + "_businessProcessXml"
              );
              // preViewClick(previousXML);
              window.open(
                "/previous?ProjectName=" +
                  projectName +
                  "&ProcessName=businessProcess",
                "Popup",
                "width=1200, height=700"
              );
            })
          );
        }
      } catch {}

      if (targetElementRetry !== null) {
        targetElementRetry.appendChild(buttonContainer);
      }

      let workflowSelectList = [];
      if (nowPorcess == "workflowProcess") {
        workflowSelectList = getWorkflowObjList(
          localStorage.getItem(projectName + "_" + processXml[2])
        ); // workflow process 일때 Activity 개수 만큼 select box 생성
        createWorkflowSelectBox(workflowSelectList);
        // createTypeSelectbox();
        uploadXML();
      } else if (nowPorcess == "runProcess") {
        workflowSelectList = getWorkflowObjList(
          localStorage.getItem(projectName + "_" + processXml[2])
        ); // run process 일때 Activity 개수 만큼 select box 생성
        // runCreateWorkflowSelectBox(workflowSelectList) // 샐랙트박스 없애고 다이어그램 띄울거라 없앰
        insertResult();
      } else if (nowPorcess == "policyProcess") {
        workflowSelectList = getWorkflowObjList(
          localStorage.getItem(projectName + "_" + processXml[2])
        ); // policy process 일때 Activity 개수 만큼 select box 생성
        createWorkflowSelectBox(workflowSelectList);
        uploadXML();
      } else {
        // 기존 프로세스 값을 불러오냐 오지 않냐
        let storedXml = localStorage.getItem(
          projectName + "_" + processXml[current_process]
        );
        if (
          !storedXml ||
          storedXml == "" ||
          storedXml ==
            '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>'
        ) {
          console.log("no xml value");
        } else {
          uploadXML();
        }
      }
    }, 250);
  }
});

/**
 * 페이지 이동시 xml, flowdict 저장 하는 함수
 */
function getLatestXml(flowDict, strXml) {
  localStorage.setItem(
    projectName +
      "_" +
      localStorage.getItem(projectName + "_current_processXml"),
    strXml
  ); // xml 저장
  if (
    localStorage.getItem(projectName + "_current_processDict") !=
    "policyProcess"
  ) {
    //policy일 경우에는 이미지 저장 따로 안함
    captureAndDownloadImage(
      projectName +
        "_" +
        localStorage.getItem(projectName + "_current_processXml")
    );
  }

  // 프로세스간 이동 중 다이어그램 간 링크 연결 없이 이동 할 경우 빈 딕셔너리flowDict가 들어가는 오류 있어서 조건문 추가
  // if(JSON.stringify(flowDict) != '{}'){
  // 	localStorage.setItem(projectName+'_'+localStorage.getItem(projectName+'_current_processDict')+'_flowDict',JSON.stringify(flowDict)) // dict 저장
  // }
}

function getRunData(flowDict, strXml) {
  localStorage.setItem(
    localStorage.getItem(projectName + "_nowWorkflow") + "_resultLog",
    runData
  );
  // localStorage.setItem(projectName+'_current_workflowName',workflowName) // 현재 submit한 workflow 저장
  localStorage.setItem(
    projectName +
      "_" +
      localStorage.getItem(projectName + "_current_processXml"),
    strXml
  ); // result 저장
  // localStorage.setItem(projectName+'_'+localStorage.getItem(projectName+'_current_processDict')+'_flowDict',JSON.stringify(flowDict)) // dict 저장
}

function getWorkflowData(flowDict, processGraphxml) {
  localStorage.setItem(
    localStorage.getItem(projectName + "_nowWorkflow"),
    processGraphxml
  ); // 기존 선택된 워크 플로우 xml
  if (
    localStorage.getItem(projectName + "_current_processDict") !=
    "policyProcess"
  ) {
    //policy일 경우에는 이미지 저장 따로 안함
    captureAndDownloadImage(localStorage.getItem(projectName + "_nowWorkflow"));
  }
  // 프로세스간 이동 중 다이어그램 간 링크 연결 없이 이동 할 경우 빈 딕셔너리flowDict가 들어가는 오류 있어서 조건문 추가
  // if(JSON.stringify(flowDict) != '{}'){
  // 	localStorage.setItem(localStorage.getItem(projectName+'_nowWorkflow')+'_flowDict',JSON.stringify(flowDict)) // dict 저장
  // }
}

// saveAll 버튼 눌렀을 때 로컬 스토리지 업데이트 후 db에 저장하기 위한 함수
function updateLocalStorage(flowDict, strXml) {
  localStorage.setItem(
    projectName +
      "_" +
      localStorage.getItem(projectName + "_current_processXml"),
    strXml
  ); // xml 저장

  // 프로세스간 이동 중 다이어그램 간 링크 연결 없이 이동 할 경우 빈 딕셔너리flowDict가 들어가는 오류 있어서 조건문 추가
  // if(JSON.stringify(flowDict) != '{}'){
  // 	localStorage.setItem(projectName+'_'+localStorage.getItem(projectName+'_current_processDict')+'_flowDict',JSON.stringify(flowDict)) // dict 저장
  // }
}

/**
 * 클래스들의 마지막 숫자를 가져와서 +1을 해준다. flowdict의 중복된 키를 방지하기 위해
 */
function getLastIndexOfShape(shapeName) {
  //민수 마지막숫자를 가져와서 거기에서 +1 추가하는 방식
  lastIndex = 0;
  var number = 0;
  var ele = document.getElementsByClassName(shapeName);
  for (let index = 0; index < ele.length; index++) {
    const regex = /[^0-9]/g;
    const result = ele[index].className.baseVal.replace(regex, "");
    const number = parseInt(result);

    if (lastIndex == 0 || lastIndex < number) {
      lastIndex = number;
    }
  }

  return lastIndex + 1;
}

/**
 * 생성된 다이어그램의 Class Name 생성 기능 카멜 표기법으로 클래스 이름을 생성 해준다.
 */
function convertToCamelCase(input) {
  // 단어를 클래스로 변경하기 위한 함수 민수
  var keyword = "DiShape";
  var keywordIndex = input.indexOf(keyword);

  if (keywordIndex !== -1) {
    var remainingText = input.slice(keywordIndex + keyword.length).trim();
  }
  var words = remainingText.split(" ");
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    if (word !== "") {
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }

  return "Di" + words.join("");
}

/**
 *  생성된 오브젝트의 edit의 값을 가져오는 기능
 *
 */
function getObjectPropertyValue(input, id, mxObjId) {
  let htmlTag = input.outerHTML;

  let tempElement = document.createElement("div");
  tempElement.innerHTML = htmlTag;

  let attributes = tempElement.firstChild.attributes;

  let desiredAttributes = [];
  for (let i = 0; i < attributes.length; i++) {
    let attribute = attributes[i];
    if (attribute.name !== "label") {
      desiredAttributes.push(attribute.name + '="' + attribute.value + '"');
    }
  }
  objValueDict[id + "_" + mxObjId] = desiredAttributes;
}

/**
 *  id , mxobj 로 받을 수 있는지 확인
 *  화살표가 가르키는 곳?
 */
function getWorkflowElement(input, start, end) {
  flowDict[input] = [start, end];
  // console.log(input, start, end)
}

function getDeleteWorkflowElement(input, start, end) {
  var key = input;
  delete flowDict.key;
  // console.log(input, start, end)
}

function getWorkflowObjList(xml) {
  var xmlString = xml;

  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xmlString, "text/xml");

  var roundedObjects = [];

  // var mxCells = xmlDoc.getElementsByTagName("mxCell");
  // for (var i = 0; i < mxCells.length; i++) {
  //   var mxCell = mxCells[i];
  //   var style = mxCell.getAttribute("style");
  //   if (style && style.includes("rounded=1;")) {
  // 	var id = mxCell.getAttribute("id");
  // 	var value = mxCell.getAttribute("value");
  // 	roundedObjects.push({ id: id, value: value });
  //   }
  // }

  // Business Process에서 Edit data에 값이 추가 된 다음 workflow Process로 넘어와서 select box를 생성할 때 오류 발생해서 밑에 새로 짬
  var mxCells = xmlDoc.documentElement.getElementsByTagName("object");
  if (mxCells.length != 0) {
    for (var i = 0; i < mxCells.length; i++) {
      var mxCell = mxCells[i];
      if (
        mxCell
          .getElementsByTagName("mxCell")[0]
          .attributes[0].nodeValue.includes("rounded=1;")
      ) {
        var id = mxCell.getAttribute("id");
        // var value = mxCell.getAttribute('name');
        var valueString = mxCell.outerHTML;
        // var regex = /\[([^\]]+)\]/g;
        var regex = /&quot;&gt;(.+?)&lt;/;
        var matches = [];
        // var match;
        var match = regex.exec(valueString);
        var extractedString = match ? match[1] : null;
        if (extractedString.includes("[" || "]")) {
          extractedString = extractedString.substring(
            1,
            extractedString.length - 1
          );
        }
        matches.push(extractedString);

        var value = matches;
        roundedObjects.push({ id: id, value: value });
      }
    }
  } else {
    for (
      var i = 0;
      i < xmlDoc.documentElement.getElementsByTagName("mxCell").length;
      i++
    ) {
      try {
        if (
          xmlDoc.documentElement
            .getElementsByTagName("mxCell")
            [i].attributes.style.textContent.includes("rounded")
        ) {
          var inputString =
            xmlDoc.documentElement.getElementsByTagName("mxCell")[2].attributes
              .value.nodeValue;
          var parser = new DOMParser();
          var doc = parser.parseFromString(inputString, "text/html");
          var divElement = doc.querySelector("div");
          var value = divElement.textContent;
          if (value.includes("[" || "]")) {
            value = value.substring(1, value.length - 1);
          }
          var id =
            xmlDoc.documentElement.getElementsByTagName("mxCell")[2].attributes
              .id.textContent;
          roundedObjects.push({ id: id, value: value });
        }
      } catch {}
    }
  }

  return roundedObjects;
}

function getNewWorkflow(selectedKey, selectedValue) {
  console.log("Selected Key:", selectedKey);
  console.log("Selected Value:", selectedValue);
}
function createWorkflowSelectBox(activityCatList) {
  let workflowXML = [];
  let data = activityCatList;

  const selectBox = document.createElement("select");
  selectBox.multiple = true; // Enable multiple selection
  selectBox.className = "workflow-select-box";
  selectBox.style.width = "200px";

  // workflow 페이지를 최초로 열어 로컬스토리지에 nowWorkflow 값이 없는 경우 넣어줌.
  if (localStorage.getItem(projectName + "_nowWorkflow") == "") {
    localStorage.setItem(
      projectName + "_nowWorkflow",
      projectName + "_" + activityCatList[0].id + "#" + activityCatList[0].value
    ); // 샐렉트 박스 첫번째 값
  }
  let nowWorkflow = localStorage.getItem(projectName + "_nowWorkflow");

  for (var i = 0; i < data.length; i++) {
    var option = document.createElement("option");
    option.value = data[i].id;
    option.text = data[i].value;

    // 선택한 옵션의 key와 value를 data-* 속성으로 저장
    option.dataset.key = data[i].id;
    option.dataset.value = data[i].value;
    workflowXML.push(data[i].id + "#" + data[i].value); // 로컬 스토리지
    selectBox.appendChild(option);

    if (nowWorkflow === projectName + "_" + data[i].id + "#" + data[i].value) {
      option.selected = true; // 일치하는 경우 선택됨으로 표시
    }
  }

  // 순우 워크플로우 선택하는 셀렉트 박스 생성 위치 지정
  var geMenubar = document.getElementsByClassName("selectWorkflow");

  geMenubar[0].appendChild(selectBox);

  // 전부 완료 되면 로컬 스토리지에 저장
  var workflowXMLList = JSON.stringify(workflowXML);
  localStorage.setItem(projectName + "_workflowXML", workflowXMLList);

  selectBox.addEventListener("click", function (event) {
    if (event.target.tagName === "OPTION") {
      localStorage.setItem(
        localStorage.getItem(projectName + "_nowWorkflow"),
        processGraphxml
      ); // 현재 작업 중이던 워크 플로우 xml 저장
      // var selectedOption = selectBox.options[selectBox.selectedIndex];
      var selectedKey = event.target.dataset.key;
      var selectedValue = event.target.dataset.value;

      getWorkflowData(flowDict, processGraphxml);

      localStorage.setItem(
        projectName + "_nowWorkflow",
        projectName + "_" + selectedKey + "#" + selectedValue
      ); // 클릭한 worklfow로 nowWorklfow 업데이트

      location.reload(true);

      getNewWorkflow(selectedKey, selectedValue);
    }
  });
}

// function createWorkflowSelectBox(activityCatList){
// 	let workflowXML = []
//     let data = activityCatList;
//     var selectBox = document.createElement("select");
// 	// selectBox.multiple = true;
// 	// selectBox.size = '6';
//     selectBox.className = "workflow-select-box";

//     // 처음에 선택된 항목 없음을 나타내는 옵션 추가
//     // var defaultOption = document.createElement("option"); // 사용자가 실수로 항목 없음 상태에서 다이어그램을 그릴 수도 있어서 주석처리 해야하나
//     // defaultOption.disabled = true;
//     // defaultOption.selected = true;
//     // defaultOption.text = "Select an option";
//     // selectBox.appendChild(defaultOption);

// 	// workflow 페이지를 최초로 열어 로컬스토리지에 nowWorkflow 값이 없는 경우 넣어줌.
// 	if(localStorage.getItem(projectName+'_nowWorkflow')==""){
// 		localStorage.setItem(projectName+'_nowWorkflow' ,projectName+'_'+activityCatList[0].id + '#' + activityCatList[0].value); // 샐렉트 박스 첫번째 값
// 	}

// 	let nowWorkflow = localStorage.getItem(projectName+'_nowWorkflow');
//     for (var i = 0; i < data.length; i++) {
//         var option = document.createElement("option");
//         option.value = data[i].id;
//         option.text = data[i].value;

//         // 선택한 옵션의 key와 value를 data-* 속성으로 저장
//         option.dataset.key = data[i].id;
//         option.dataset.value = data[i].value;
// 		workflowXML.push(data[i].id + '#' + data[i].value) // 로컬 스토리지
//         selectBox.appendChild(option);

// 		if (nowWorkflow === projectName+'_'+data[i].id + '#' + data[i].value) {
//             option.selected = true; // 일치하는 경우 선택됨으로 표시
// 			// option.style =

//         }
//     }

// 	// 순우 워크플로우 선택하는 셀렉트 박스 생성 위치 지정
//     // var geMenubar = document.querySelector(".geToolbarContainer");
// 	var geMenubar = document.getElementsByClassName("selectWorkflow");
// 	// var geMenubar = document.querySelector("body > div:nth-child(11) > div:nth-child(4) > div");
//     // geMenubar[0].style.display = "flex";
//     // geMenubar[0].style.justifyContent = "flex-end";
//     geMenubar[0].appendChild(selectBox);

// 	// 전부 완료 되면 로컬 스토리지에 저장
// 	var workflowXMLList = JSON.stringify(workflowXML);
// 	localStorage.setItem(projectName+'_workflowXML',workflowXMLList);

//     selectBox.addEventListener("change", function() {

// 		localStorage.setItem(localStorage.getItem(projectName+'_nowWorkflow') , processGraphxml); // 현재 작업 중이던 워크 플로우 xml 저장
//         var selectedOption = selectBox.options[selectBox.selectedIndex];
//         var selectedKey = selectedOption.dataset.key;
//         var selectedValue = selectedOption.dataset.value;

// 		// // 모든 옵션의 배경색 초기화 (선택되지 않은 옵션은 원래 색상으로 돌아갑니다)
// 		// for (var i = 0; i < selectBox.options.length; i++) {
// 		// 	selectBox.options[i].style.backgroundColor = "";
// 		//   }

// 		//   // 선택한 옵션에 배경색 적용
// 		//   selectedOption.style.backgroundColor = "yellow"; // 원하는 배경색으로 변경

// 		// 셀렉트 박스로 화면 이동 시 flowDict가 저장되지 않는 오류 있어서 추가
// 		getWorkflowData(flowDict, processGraphxml)

// 		localStorage.setItem(projectName+'_nowWorkflow' ,projectName+'_'+selectedKey + '#' + selectedValue); // 클릭한 worklfow로 nowWorklfow 업데이트

// 		location.reload(true);

//         getNewWorkflow(selectedKey, selectedValue);
//     });
// };

// function runCreateWorkflowSelectBox(activityCatList){
// 	let workflowXML = []
//     let data = activityCatList;
//     var selectBox = document.createElement("select");
//     selectBox.className = "workflow-select-box";

//     // 처음에 선택된 항목 없음을 나타내는 옵션 추가
//     var defaultOption = document.createElement("option");
//     defaultOption.disabled = true;
//     defaultOption.selected = true;
//     defaultOption.text = "Select an option";
//     selectBox.appendChild(defaultOption);

// 	let nowWorkflow = localStorage.getItem(projectName+'_nowWorkflow');
//     for (var i = 0; i < data.length; i++) {
//         var option = document.createElement("option");
//         option.value = data[i].id;
//         option.text = data[i].value;

//         // 선택한 옵션의 key와 value를 data-* 속성으로 저장
//         option.dataset.key = data[i].id;
//         option.dataset.value = data[i].value;
// 		workflowXML.push(data[i].id + '#' + data[i].value) // 로컬 스토리지
//         selectBox.appendChild(option);

// 		if (nowWorkflow === projectName+'_'+data[i].id + '#' + data[i].value) {
//             option.selected = true; // 일치하는 경우 선택됨으로 표시

//         }
//     }

//     var geMenubar = document.getElementsByClassName("sub-content1")[0];
//     // geMenubar.style.display = "flex";
//     // geMenubar.style.justifyContent = "flex-end";
//     geMenubar.appendChild(selectBox);

// 	// 전부 완료 되면 로컬 스토리지에 저장
// 	var workflowXMLList = JSON.stringify(workflowXML);
// 	localStorage.setItem(projectName+'_workflowXML',workflowXMLList);

// 	var workflowName = localStorage.getItem(projectName+'_nowWorkflow');
// 	const parts = workflowName.split('#');
// 	workflowName = parts[1];
// 	localStorage.setItem(projectName+'_current_workflowName', workflowName)

//     selectBox.addEventListener("change", function() {
// var runData = saveRunData()
// localStorage.setItem(localStorage.getItem(projectName+'_nowWorkflow')+'_resultLog' , runData); // log 출력
//         var selectedOption = selectBox.options[selectBox.selectedIndex];
//         var selectedKey = selectedOption.dataset.key;
//         var selectedValue = selectedOption.dataset.value;
// 		localStorage.setItem(projectName+'_nowWorkflow' ,projectName+'_'+selectedKey + '#' + selectedValue); // 현재 작업중이던 워크플로우

// 		location.reload(true);

//         getNewWorkflow(selectedKey, selectedValue);
//     });

// };

function insertResult() {
  var data = localStorage.getItem(
    localStorage.getItem(projectName + "_nowWorkflow") + "_resultLog"
  );
  var logContainer = document.querySelector(".logContainer");
  logContainer.innerHTML = data;
}

// 현재xml에서 클릭한 오브젝트 id의 attribute 추출
function extractObjects(id) {
  const inputString = processGraphxml;
  const searchString = 'id="' + id;
  const index = inputString.indexOf(searchString);

  if (index !== -1) {
    // 찾은 문자열의 왼쪽으로 < 문자를 찾음
    const startIndex = inputString.lastIndexOf("<", index);

    if (startIndex !== -1) {
      const extractedString = inputString.substring(startIndex + 1, index);
      console.log(extractedString);
      return extractedString;
    }
  }
}

// 페이지 이동할 때 마다 다이어그램 캔버스 png캡쳐 저장
function captureAndDownloadImage(workflowName) {
  // const divToCapture = document.querySelector(".geBackgroundPage"); // 캡쳐할 div 선택

  // html2canvas(divToCapture).then(function(canvas) {
  //     var link = document.createElement("a")
  //     link.href = canvas.toDataURL("image/jpeg")
  // 	link.target = "_blank"; // 파일이 브라우저 창 바깥에서 열리게
  //     link.download = workflowName+'.jpg' // 다운로드 할 파일명 설정
  //     link.click() // <a> 요소를 클릭하는 것과 동일한 효과. 브라우저는 해당 링크를 따라가고 href 속성에 지정된 주소로 이동하지 않으면서도 브라우저의 다운로드 동작을 트리거 (링크를 클릭하지 않고도)
  // });
  ExportDialog.exportFile(tempEditorUi, workflowName, "png", null, 1, 0, 100);
}

// function extractReq(){
// 	var xmlString =window.localStorage.getItem(projectName+'_requirementsProcessXml');

// 	var parser = new DOMParser();
// 	var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

// 	var xpathResult = xmlDoc.evaluate("//object/@label", xmlDoc, null, XPathResult.ANY_TYPE, null);
// 	var extractedValues = [];
// 	var node = xpathResult.iterateNext();

// 	while (node) {
// 	var match = node.value.match(/<<functional requirement>>\n(.*)/);

// 	if (match && match[1]) {
// 		if(match[1].includes('['||']')){
// 			match[1] = match[1].substring(1,match[1].length -1);
// 		}
// 		extractedValues.push(match[1]);
// 	}

// 	node = xpathResult.iterateNext();
// 	}
// 	return extractedValues
// }

function saveAsProject() {
  console.log("다른 이름으로 저장");
  // 	updateLocalStorage(flowDict, processGraphxml)
  // ////////////////yaml생성에 필요한 데이터들////////////////////////
  // 	var workflowXMLValue = [];
  // 	let get_localstorage_xml_list = ['overviewProcessXML','requirementsProcessXml','businessProcessXml',];
  // 	var stringWorkflowList = localStorage.getItem(projectName+'_workflowXML');
  // 	var workflowList = JSON.parse(stringWorkflowList);
  // 	try{
  // 		for (var i = 0 ; i< workflowList.length ; i++){
  // 			// get_localstorage_xml_list.push(workflowList[i]);
  // 			// get_localstorage_xml_list.push(workflowList[i]+'_requirement');
  // 			// get_localstorage_xml_list.push(workflowList[i]+'_nodeSelector');
  // 			for (var j = 0; j < localStorage.length; j++){
  // 				const key = localStorage.key(j);
  // 				if(key.includes(projectName+'_'+workflowList[i])){
  // 					workflowXMLValue.push(key);
  // 				}
  // 			}
  // 			// get_localstorage_xml_list.push(workflowList[i]+'_flowDict');
  // 		}
  // 	}
  // 	catch{
  // 	}
  // 	console.log(get_localstorage_xml_list)
  // /////////////////////////////////////////
  // 	let data = {};
  // 	let processData = {};
  // 	let workflowData = {};
  // 	// 프로세스 저장
  // 	for (var i = 0; i < get_localstorage_xml_list.length; i++) {
  // 		var key = get_localstorage_xml_list[i];
  // 		var value = localStorage.getItem(projectName + '_' + key);
  // 		if(!value){
  // 			value = ''
  // 		}
  // 		processData[key] = value;
  // 	}
  // 	//워크플로우 저장
  // 	// var workflowXMLValue = localStorage.getItem(projectName + '_workflowXML');
  // 	// workflowXMLValue = JSON.parse(workflowXMLValue);
  // 	if (workflowXMLValue) {
  // 		for (var i = 0; i < workflowXMLValue.length; i++) {
  // 			var key = workflowXMLValue[i];
  // 			var value = localStorage.getItem( key);
  // 			workflowData[key] = value;
  // 		}
  // 	}
  // 	data['projectName'] = projectName;
  // 	var projectNamejsonData = data;
  // 	var processDatajsonData = processData;
  // 	var workflowDatajsonData = workflowData;
  // 	var dataToSend = {
  // 		  projectNamejsonData: projectNamejsonData,
  // 		  processDatajsonData: processDatajsonData,
  // 		  workflowDatajsonData: workflowDatajsonData
  // 		};
  // 	// Flask의 saveProject 함수 호출
  // 	fetch('/saveProject', {
  // 		method: 'POST',
  // 		headers: {
  // 			'Content-Type': 'application/json'
  // 		},
  // 		body: JSON.stringify(dataToSend)
  // 	})
  // 		.then(response => response.json())
  // 		.then(data => {
  // 			alert(data); // 서버에서 반환된 데이터 출력
  // 		})
  // 		.catch(error => {
  // 			console.error('Error:', error);
  // 		});
}
