window.onload = function () {
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

  // 모달 외부 클릭 시 모달 숨김
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
};
