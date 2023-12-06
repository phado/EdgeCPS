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
    document.getElementById('output-container').addEventListener('click', function (event) {
        if (event.target.classList.contains('tag-div')) {
            event.target.remove();
        }
    });
}

        //input 커서? 위치 지정
function adjustInputStyle() {
    const textInput = document.getElementById('project_tag');
    const generatedDivs = document.querySelectorAll('.tag-div');

    const totalWidth = Array.from(generatedDivs).reduce((acc, div) => acc + 10+div.clientWidth, 0);
    textInput.style.paddingLeft = totalWidth +10+ 'px';
}

async function is_name_exists(projectName, userIds) {
  const url = `/exists?project_name=${encodeURIComponent(projectName)}&userId=${encodeURIComponent(userIds)}`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    return data.trim() === 'true';
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function saveAsProject(oldProjectName, userIds) {
  var newProjectName = document.getElementById("project_name").value;
  var projectDescription = document.getElementById("project_description").value;
  var projectCategory = document.getElementById("project_category").value;
  const tagDivs = document.querySelectorAll('.tag-div');

  const tagTexts = Array.from(tagDivs).map((tagDiv) => tagDiv.textContent.trim());

  var newOverview = {
    name: newProjectName,
    description: projectDescription,
    category: projectCategory,
    tag : tagTexts
  };

  try {
    // 이미존재하는 프로젝트 이름인지 확인
    const result = await is_name_exists(newProjectName, userIds);

    if (result) {
      const allKeys = Object.keys(localStorage);
      const filteredKeys = allKeys.filter(key => key.includes(oldProjectName));

      for (let i = 0; i < filteredKeys.length; i++) {
        const oldKey = filteredKeys[i];
        if (oldKey.includes('nowWorkflow')){
          continue;
        }
        if (oldKey.includes('overview')) {
          localStorage.setItem(newProjectName + '_overviewProcessXML', JSON.stringify(newOverview));
          localStorage.removeItem(oldKey);
          continue;
        }
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue == "") {
          continue;
        }
        const regex = /[^_]+/;
        const match = oldKey.match(regex);

        if (match) {
          const beforeUnderscore = match[0];
          const newKey = oldKey.replace(beforeUnderscore, newProjectName);

          localStorage.setItem(newKey, oldValue);
          localStorage.removeItem(oldKey);
        }
      }
      saveAllProject(newProjectName);
    } else {
      alert("같은 이름의 프로젝트가 존재합니다.");
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

function loadTag(array){
  for(var i =0 ; i<array.length; i ++){
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