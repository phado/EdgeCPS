function addCategory() {
    var newCategory = prompt("새 카테고리를 입력하세요:");
    if (newCategory) {
        fetch("/add_category", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "category_name=" + encodeURIComponent(newCategory)
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
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "category_name=" + encodeURIComponent(selectedCategory)
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

function saveProjectInfo() {

    var projectName = document.getElementById("project_name").value;
    var projectDescription = document.getElementById("project_description").value;
    var projectCategory = document.getElementById("project_category").value;
    // var projectTag = document.getElementById("project_tag").value; 모든 tag-div 요소
    // 선택
    const tagDivs = document.querySelectorAll('.tag-div');

    // 각 tag-div의 텍스트를 배열에 저장
    const tagTexts = Array.from(tagDivs).map((tagDiv) => tagDiv.textContent.trim());

    var projectInfo = {
        name: projectName,
        description: projectDescription,
        category: projectCategory,
        tag: tagTexts
    };

    localStorage.setItem(projectName + '_overviewProcessXML',JSON.stringify(projectInfo));
    projectName = projectInfo['name'];

    // window.location.href =
    // 'http://127.0.0.1:5000/process/requirementsProcess?projectName='+projectName;

}

function handleKeyDown(event) {
    if (event.key === ',') {
        event.preventDefault();

        const textInput = document.getElementById('project_tag');
        let text = textInput.value;

        // 맨 마지막 문자가 쉼표인 경우 제거
        if (text.endsWith(',')) {
            text = text.slice(0, -1);
        }

        if (text !== '') {
            // 새로운 div 생성 및 스타일 적용
            const newDiv = document.createElement('div');
            newDiv.className = 'tag-div';
            newDiv.textContent = text;
            newDiv.id = 'tag-div';

            // 생성된 div를 출력 컨테이너에 추가
            const outputContainer = document.getElementById('output-container');
            outputContainer.appendChild(newDiv);

            textInput.value = '';
            textInput.selectionStart = textInput.selectionEnd = textInput.value.length;
        }
    } else if (event.key === 'Enter') {
        event.preventDefault(); // 엔터 입력 방지
    }
    // 생성된 div를 클릭하면 삭제
    document
        .getElementById('output-container')
        .addEventListener('click', function (event) {
            if (event.target.classList.contains('tag-div')) {
                event.target.remove();
                adjustInputStyle();
            }
        });
    adjustInputStyle();
}

//input 커서? 위치 지정
function adjustInputStyle() {
    const textInput = document.getElementById('project_tag');
    const generatedDivs = document.querySelectorAll('.tag-div');

    const totalWidth = Array.from(generatedDivs).reduce((acc, div) => acc + 10 + div.clientWidth, 0);
    textInput.style.paddingLeft = totalWidth + 10 + 'px';
    // var currentWidth = textInput.style.width;
    // var numericWidth = parseInt(currentWidth);
    // textInput.style.width = (numericWidth - totalWidth) + 'px';
}

function loadTag(array) {
    for (var i = 0; i < array.length; i++) {
        const newDiv = document.createElement('div');
        newDiv.className = 'tag-div';
        newDiv.textContent = array[i];
        newDiv.id = 'tag-div';

        // 생성된 div를 출력 컨테이너에 추가
        const outputContainer = document.getElementById('output-container');
        outputContainer.appendChild(newDiv);

        document.getElementById('output-container').addEventListener('click', function (event) {
                if (event.target.classList.contains('tag-div')) {
                    event.target.remove();
                    adjustInputStyle();
                }
            });
        adjustInputStyle();
    }
}