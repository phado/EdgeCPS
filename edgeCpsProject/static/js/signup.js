document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const nameInput = document.getElementById("name");
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const birthdateInput = document.getElementById("birthdate");
  const groupInput = document.getElementById("group");

  const nameErrorError = document.getElementById("nameError");
  const userIdError = document.getElementById("userIdError");
  const passwordError = document.getElementById("passwordError");
  const emailError = document.getElementById("emailError");
  const birthdateError = document.getElementById("birthdateError");
  const groupError = document.getElementById("groupError");

  let signupFlg = true;
  //   회원가입 시 입력하는 값(이름, 아이디, 생년월일, 비밀번호, 이메일, 소속)에 대한 유효성 검사 효정
  signupForm.addEventListener("submit", function (event) {
    //  1. 아이디 유효성 검사, 중복 확인
    const idValid = /^[a-zA-Z0-9]{6,12}$/.test(userIdInput.value);
    if (!idValid) {
      event.preventDefault();
      userIdError.textContent =
        "6글자 이상 12글자 미만, 영문과 숫자로 생성 가능 합니다.";
      signupFlg = false;
    } else {
      userIdError.textContent = "";
    }
    //  2. 비밀번호 확인
    const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/.test(
      passwordInput.value
    ); // 비밀번호 성립 조건 (5자 이상, 영문과 숫자 포함)
    if (!isPasswordValid) {
      event.preventDefault();
      passwordError.textContent =
        "비밀번호는 5자 이상이며 영문과 숫자를 포함해야 합니다.";
      signupFlg = false;
    } else {
      passwordError.textContent = "";
    }

    //  3. 이름 유효성 검사
    const nameValid = /^[가-힣a-zA-Z]+$/.test(nameInput.value);
    if (!nameValid) {
      event.preventDefault();
      nameErrorError.textContent = "잘못된 입력입니다";
      signupFlg = false;
    } else {
      nameErrorError.textContent = "";
    }

    //  4. 생년월일
    if (birthdateInput.value.trim() === "") {
      event.preventDefault();
      birthdateError.textContent = "생년월일을 선택해 주세요.";
      signupFlg = false;
    } else {
      birthdateError.textContent = "";
    }

    //  5. 이메일
    const emailValid = /^[\w\.-]+@[\w\.-]+\.\w+$/.test(emailInput.value);
    if (!emailValid) {
      event.preventDefault();
      emailError.textContent = "이미 사용 중인 이메일입니다.";
      signupFlg = false;
    } else {
      emailError.textContent = "";
    }

    //  6. 소속
    if (groupInput.value.trim() === "") {
      event.preventDefault();
      groupError.textContent = "소속을 선택해주세요.";
      signupFlg = false;
    } else {
      groupError.textContent = "";
    }

    if (signupFlg) {
      alert("가입 완료");
    }
  });

  // 아이디 중복확인 기능 효정
  const checkDuplicateButton = document.getElementById("checkDuplicateButton");
  checkDuplicateButton.addEventListener("click", function () {
    const userIdInput = document.getElementById("userId");
    const userId = userIdInput.value;

    fetch("/checkUserId", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result == "same") {
          userIdError.textContent = "이미 사용 중인 아이디입니다.";
          userIdInput.value = "";
          checkDuplicateButton.classList.remove("btn-success");
          checkDuplicateButton.classList.add("btn-danger");
        } else {
          userIdError.textContent = "사용 가능한 아이디입니다.";
          checkDuplicateButton.classList.remove("btn-danger");
          checkDuplicateButton.classList.add("btn-success");
        }
      })
      .catch((error) => {
        console.error("서버 요청 오류:", error);
      });
  });
});
