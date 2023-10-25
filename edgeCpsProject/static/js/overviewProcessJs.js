
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


function setAllProjectProcess(){

}