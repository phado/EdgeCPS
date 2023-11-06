

	// Reads files locally 0727 민수
	function processHandleFiles(files)
	// {   for (var i = 0; i < files.length; i++)
		{
                    // 순우 불러오기 자동 
                    window.openFile.setDataProcess(files[0],files[1]); //순우 open
                            // files[0]은 xml데이터
                            // files[1]은 이름 
                            // window.openFile 로드 안댐
	};
    

	

	// Handles form-submit by preparing to process response 0727 민수 xml 불러오기 생성
	function processHandleSubmit()
	{
		console.log('processHandleSubmit')
		// var form = window.openForm || document.getElementById('openForm');

		// 현재 프로세스 가져오기
		var currentProcess = localStorage.getItem('current_process');
		var getProcessXML = localStorage.getItem('')
		if (currentProcess == 'workflowProcess'||currentProcess == 'searchReusableProcess'|| currentProcess=='workflowImplementationProcess'||currentProcess=='policyProcess'){
			var getActivityDict = localStorage.getItem(localStorage.getItem('last_selected_activity')); 
			var file = [getActivityDict,localStorage.getItem('last_selected_activity')]
			processHandleFiles(file);
		}
		else{
			var getProcessDict = localStorage.getItem(currentProcess);
			var file = [getProcessDict,currentProcess]
			processHandleFiles(file);
		}
		

		
			
		// return false;

		
	};

	