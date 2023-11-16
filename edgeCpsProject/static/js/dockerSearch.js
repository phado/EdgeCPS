		// 로컬 이미지 검색
		document.getElementById("searchLocalButton").addEventListener("click", function(){
			const url = 'http://127.0.0.1:4999/localsearch';
			fetch(url)
				.then(response => response.text())  // 응답의 텍스트 데이터를 받아옴
				.then(data => {
					workflowStatus = data
					const resultElement = document.getElementById("result");
					const logs = data.split('\n');

				})
				.catch(error => {
					console.error("Error:", error);
				});
		});

		// 도커 허브 이미지 검색
		document.addEventListener("DOMContentLoaded", function() {
			const searchButton = document.getElementById("searchButton");

			searchButton.addEventListener("click", function() {
				const searchInput = document.getElementById("searchInput").value;
				const url = 'http://127.0.0.1:4999/search?keyword='+encodeURIComponent(searchInput);
				fetch(url)
					.then(response => response.text())  // 응답의 텍스트 데이터를 받아옴
					.then(data => {
						// console.log(data);  // 받아온 데이터를 콘솔에 출력
						workflowStatus = data
						const resultElement = document.getElementById("result");
						const logs = data.split('\n');

					})
					.catch(error => {
						console.error("Error:", error);
					});
			});
		});