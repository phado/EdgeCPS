
function savePorjectInfo(){

    var projectName = document.getElementById("project_name").value;
    var projectDescription = document.getElementById("project_description").value;
    var projectCategory = document.getElementById("project_category").value;

    // localStorage.setItem(projectName+'_current_processDict', 'overviewProcess'); //현재 작업중인 프로세스 dict저장

    var projectInfo = {
        name: projectName,
        description: projectDescription,
        category: projectCategory
    };

    localStorage.setItem(projectName+'_overviewProcessXML', JSON.stringify(projectInfo));

    // localStorage.setItem(projectName+'_workflowXML',workflowXMLList);

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