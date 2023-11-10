function findProjectByName(projectName) {
  // 모든 로컬 스토리지 아이템 가져오기
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);

    // 프로젝트 이름이 포함된 아이템을 찾음
    if (key && key.includes("_overviewProcessXML")) {
      var storedProjectInfo = localStorage.getItem(key);

      // JSON 문자열을 JavaScript 객체로 변환
      var projectInfo = JSON.parse(storedProjectInfo);

      // 프로젝트 이름 비교
      if (projectInfo && projectInfo.name === projectName) {
        return projectInfo;
      }
    }
  }

  // 찾지 못한 경우 null 반환
  return null;
}

function savePorjectInfo() {
  var projectName = document.getElementById("project_name").value;
  var projectDescription = document.getElementById("project_description").value;
  var projectCategory = document.getElementById("project_category").value;

  // localStorage.setItem(projectName+'_current_processDict', 'overviewProcess'); //현재 작업중인 프로세스 dict저장

  var projectInfo = {
    name: projectName,
    description: projectDescription,
    category: projectCategory,
  };

  var projectNameToFind = projectName;
  var foundProjectInfo = findProjectByName(projectNameToFind);

  if (foundProjectInfo) {
    var confirmSave = confirm(
      "같은 이름의 프로젝트가 이미 존재합니다. 계속 진행하시겠습니까?"
    );

    if (!confirmSave) {
      // 사용자가 취소를 누른 경우 함수 종료
      return;
    }
  } else {
    console.log("프로젝트를 찾을 수 없습니다.");
  }

  localStorage.setItem(
    projectName + "_overviewProcessXML",
    JSON.stringify(projectInfo)
  );
}

// window.onload = function() {
//     var newPjValue = "{{ new_pj }}";
//     console.log('newPjValue = ' , newPjValue)
//     if (newPjValue != "True"){
//         // getElementById("project_category").value = projectInfo.category;
//             var overviewData = localStorage.getItem(project_name+'_overviewProcessXML');
//             var modifiedOverviewData = ''
//             for (var i = 0; i < overviewData.length; i++) {
//                 var currentChar = overviewData.charAt(i);

//                 if (currentChar === "'") {
//                     modifiedOverviewData += '"';
//                 } else if (currentChar === '"') {
//                     modifiedOverviewData += "'";
//                 } else {
//                     modifiedOverviewData += currentChar;
//                 }
//             }
//             var jsonOverview = JSON.parse(modifiedOverviewData);

//             document.getElementById("project_name").value = jsonOverview['name'];
//             // var projectInput = document.getElementById("project_name")
//             // projectInput.readOnly = true

//             document.getElementById("project_description").value = jsonOverview['description']
//             document.getElementById("project_category").value = jsonOverview['category'];

//     }
//     // <div class="form-group">
//     // 		<textarea class="form-control" id="create_project" name="create_project" >True</textarea>
//     // 	</div>

//     if(openProject == 'True'){
//         var div = document.createElement('div');
//         div.innerHTML = projectData.replace(/&#39;/g, "\"");
//         projectData = div.textContent || div.innerText;

//         var div = document.createElement('div');
//         div.innerHTML = project_name.replace(/&#39;/g, "\"");;
//         project_name = div.textContent || div.innerText;

//         var div = document.createElement('div');
//         div.innerHTML = xml_process.replace(/&#39;/g, "\"");;
//         xml_process = div.textContent || div.innerText;

//         var div = document.createElement('div');
//         div.innerHTML = workflow_xml.replace(/&#39;/g, "\"");;
//         workflow_xml = div.textContent || div.innerText;

//         var container = document.getElementById("formtag");
//         var div = document.createElement('div');
//         div.className = "form-group";
//         var textarea = document.createElement('textarea');
//         textarea.className = "form-control";
//         textarea.id = "load_project";
//         textarea.name = "load_project";
//         textarea.textContent = "True";
//         div.appendChild(textarea);
//         container.appendChild(div);
//         textarea.style.display = 'none';

//     }

// }
