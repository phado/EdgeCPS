function addCategory() {
  var newCategory = prompt("새 카테고리를 입력하세요:");
  if (newCategory) {
    fetch("/add_category", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "category_name=" + encodeURIComponent(newCategory),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          console.log("카테고리를 성공적으로 저장했습니다.");
          location.reload();
        } else {
          alert("카테고리 추가에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function deleteCategory() {
  // 선택된 카테고리 가져오기
  var selectedCategory = document.getElementById("project_category").value;

  if (!selectedCategory) {
    alert("삭제할 카테고리를 선택하세요.");
    return;
  }

  if (confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
    // 서버로 선택된 카테고리를 전송하여 삭제
    fetch("/delete_category", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "category_name=" + encodeURIComponent(selectedCategory),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result === "success") {
          console.log("카테고리를 성공적으로 삭제했습니다.");
          // 페이지 새로고침
          location.reload();
        } else {
          alert("카테고리 삭제에 실패했습니다.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}


function saveProjectInfo(){

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
  projectName = projectInfo['name'];


  // window.location.href = 'http://127.0.0.1:5000/process/requirementsProcess?projectName='+projectName;



}