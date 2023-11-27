import glob
import os
import shutil
import html
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, make_response
from db_conn import get_pool_conn
import requests
import urllib3
from db_query import add_table_save_prj, get_projet_info,get_projet_info2, load_project, get_user_info, get_user_single_info, get_category, create_category, del_category,get_group_info,add_grp,del_grp, delete_project_from_db,check_userId,db_login,find_pwd,change_pwd,cheack_id,change_Info,sign_up,is_name_exists
from flask_cors import CORS
import subprocess
import json
import urllib
import cairosvg
import base64
import urllib.parse
import mysql.connector.pooling
from flask_paginate import Pagination
from convert_from_xml import pharse_xml_to_json


from kubernetes import client, config
from kubernetes.stream import stream

urllib3.disable_warnings()

app = Flask(__name__)
CORS(app)
app.secret_key = 'EdgeCPS_workflow'


# 임의의 프로젝트 목록 데이터


mariadb_pool = get_pool_conn()

def sessionClear():
    session.clear()

# def getProjectDict(userId):

def getProjectDict():
    # 로컬 디렉토리에 저장 되어있는 목록에서 프로젝트 정보 가져오는 부분.
    # pj_dir = glob.glob('project_file/*')
    # projects = [ ]
    # idx = 1
    # for file_path in pj_dir:
    #     pj_info = file_path.split('/')[-1]
    #     pj_user = pj_info.split('@')[-1]
    #     pj_name_list = pj_info.split('@')[:-1]
    #     pj_name = '@'.join(pj_name_list)
    #     projects.append({'id': idx, 'name': pj_name, 'user': pj_user})
    #     idx += 1

    # prjs = get_projet_info2(mariadb_pool,userId)
    prjs = get_projet_info(mariadb_pool)
    projects = []

    for idx in range(len(prjs)):
        projects.append({'id': prjs[idx][0], 'name': prjs[idx][1], 'create_date': prjs[idx][2], 'user': prjs[idx][3]})
    return projects

def getProjectDict2(userId):
    prjs = get_projet_info2(mariadb_pool,userId)
    projects = []

    for idx in range(len(prjs)):
        projects.append({'id': prjs[idx][0], 'name': prjs[idx][1], 'create_date': prjs[idx][2], 'user': prjs[idx][3]})
    return projects

def getGroupDict():
    prjs = get_group_info(mariadb_pool)
    groups = []

    for idx in range(len(prjs)):
        groups.append({'idx': prjs[idx][0], 'name': prjs[idx][1], 'code': prjs[idx][2]})
    return groups

@app.route('/', methods=['GET', 'POST'])
def index():
    """
        info:
            메인 페이지
            아이디와 비밀 번호를 받아서 로그인 한다.
        Args:
            아이디 , 비밀 번호

        Returns:
            성공 : 프로젝트 목록 페이지 이동
            실패 : 다시 로그인
        """



    if request.method == 'POST':
        # session['userid'] = 'tempUser' # todo 로그인 없이 되도록
        # # return redirect(url_for('project_list',loginUserInfo ='tempUser')) # todo 로그인 없이 되도록

        userid = request.form["username"]
        password = request.form["password"]
        # userid = 'aaa'
        # # password = 'aaa'
        login = db_login(mariadb_pool, id = userid, pwd = password )
        # login = {}
        # login['login'] = True

        if login['login']:
            session['userId'] = userid
            return redirect(url_for('project_list'))
        else:
            return render_template('index.html',login_msg='로그인 실패. 일치하는 회원이 없습니다.' )

    return render_template('index.html', login_msg='')
@app.route('/logout', methods=['GET'])
def logout():
    sessionClear()
    return render_template('index.html')

@app.route('/forgetid', methods=['GET'])
def forgetid():
    sessionClear()
    return render_template('forgetid.html')

@app.route('/forgetpw', methods=['GET'])
def forgetpw():
    sessionClear()
    return render_template('forgetpw.html')

@app.route('/project/projectsList', methods=['GET', 'POST'])
def project_list():
    loginUserInfo = request.args.get('loginUserInfo')
    userId= session['userId']

    projects_info = getProjectDict2(userId)

    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info

    page = request.args.get('page', type=int, default=1)
    per_page = 5  # 페이지당 항목 수를 설정합니다.
    offset = (page - 1) * per_page
    total = len(projects_info)

    pagination_projects = projects_info[offset: offset + per_page]

    pagination = Pagination(
        page=page,
        total=total,
        per_page=per_page,
        css_framework='bootstrap4',  # 사용하는 CSS 프레임워크에 맞게 조정
    )

    # todo 프로젝트 리스트 정보 조회하는 기능 필요
    return render_template('projectList.html',  projects=pagination_projects, pagination=pagination, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup, loginUserInfo=loginUserInfo)



@app.route('/projects/delete/<int:project_id>', methods=['POST'])
def delete_project(project_id): # todo 프로젝트 삭제 기능
    # projects = getProjectDict()
    delete_project_from_db(mariadb_pool, project_id)

    # # todo 회원의 소속 확인, 회원의 프로젝트인지 확인 필요
    # for project in projects:
    #     if project['id'] == project_id:
            
            # rm_dir_name = '@'.join([project['name'],project['user']])
            # shutil.rmtree('project_file/'+rm_dir_name)
            # break

    return redirect(url_for('project_list'))



@app.route('/signup', methods=['GET','POST'])
def signup():
    """
    회원가입
    :return: 성공 여부 반환
    """
    if request.method == 'GET':
        return render_template('signup.html')


    if request.method == 'POST':
        try:
            name = request.form.get('name')
            userId = request.form.get('userId')
            password = request.form.get('password')
            email = request.form.get('email')
            birthdate = request.form.get('birthdate')
            group = request.form.get('group')
            sign_up(mariadb_pool, name = name,userId = userId,password = password,email = email,birthdate = birthdate,group =group)
        except:
            return render_template('index.html')
        #todo 여기서 데이터를 처리하거나 저장하는 로직을 추가하세요
    return render_template('index.html')

    # return redirect(url_for('success'))

@app.route('/success')
def success():
    return "가입이 완료되었습니다!"

@app.route('/cancel')
def cancel():
    return redirect('/')  # 원하는 주소로 변경

"""
프로젝트 전체 저장 페이지
"""
@app.route('/saveProject', methods=['POST'])
def save_project():
    try:
        data = request.json
        proj_name =data['projectNamejsonData']['projectName']

        # db에 저장하는 함수
        add_table_save_prj(mariadb_pool, proj_name,data,session['userId'])

        response = {"status": "success", "message": "Project data saved successfully.", "urlFor": 'projectName='+ data['projectNamejsonData']['projectName'] }
        # save as인 경우
        if data['saveAsProject'] == 'True':
            project_name = data['projectNamejsonData']['projectName']
            userId= session['userId'] 
            user_info = user_get_info(userId)    
            userIds, userName, userEmail, userGroup, userAdmin = user_info
            catlist = get_category(mariadb_pool)

            return jsonify(response), 200
        else:
            return jsonify(response), 200
    except Exception as e:
        response = {"status": "error", "message": str(e)}
        return jsonify(response), 500



"""
프로젝트 프로세스 오픈 하는 과정 페이지
"""

@app.route('/projects/open_process/<int:project_id>/<project_name>/<project_user>', methods=['GET', 'POST'])
def open_process(project_id,project_user,project_name):
    # overview process
    active_overview = True

    projects = getProjectDict()

    # # todo 회원의 소속 확인, 회원의 프로젝트인지 확인 필요
    for project in projects:
        if project['id'] == project_id and project['name'] == project_name and project['user'] == project_user:

            data = load_project(project_id, mariadb_pool)

            return redirect(url_for('overview_process', active_overview=active_overview, data = data, projectName = project_name, openProject=True))

    return redirect(url_for('project_list'))

"""캡처  export"""
@app.route('/export' , methods=['POST'])
@app.route('/save' , methods=['POST'])
def save_to_server():
    format = request.form.get('format')
    filename = request.form.get('filename')
    filename= filename.split('.')[0]
    pj_root_pth = 'project_file'
    referrer = request.referrer
    start_index = referrer.find('projectName=')+ len('projectName=')
    end_index = referrer.find('&',   start_index)
    if end_index == -1:
        end_index=len(referrer)
    proj_name = referrer[start_index:end_index]
    # pj_pth = os.path.join(pj_root_pth ,proj_name +'@'+session['userid'])
    download_path = os.path.join(os.path.expanduser("~/Downloads"), filename)
    # full_pth = os.path.join(pj_pth,filename)
    data = request.form.get('xml')
    # try:
    #     os.makedirs(pj_pth)
    # except:
    #     pass

    if format == 'svg':
        decoding_svg_data = urllib.parse.unquote(data)
        try:
            with open(download_path, 'w') as file:
                file.write(decoding_svg_data)
            return '', 204 
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500
    elif format == 'png':
        try:
            decoding_svg_data = urllib.parse.unquote(data)
            cairosvg.svg2png(bytestring=decoding_svg_data, write_to=download_path + '.png')
            return '', 204 
        except Exception as e:
            return jsonify({'message': f'Error: {str(e)}'}), 500


"""previous"""
@app.route("/previous", methods=['GET', 'POST'])
def previous():
    project_name = request.args.get("ProjectName")
    process_name = request.args.get("ProcessName")
    return render_template("previous.html", project_name = project_name, process_name = process_name)

@app.route('/process/overviewProcess', methods=['GET', 'POST'])
def overview_process():
    catlist = get_category(mariadb_pool)
    pass_overview = request.form.get('pass_overview')

    data = request.args.get('data')
    open_project = request.args.get('openProject')# 현재 불러오기 중인 프로젝트인지 확인
    opened_project = request.args.get('openedProject')# 이미 한번 불러온 프로젝트인지 확인

    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    
    if opened_project =='True':
        project_name = request.args.get('projectName')
        return render_template('process/overviewProcess.html',categories=catlist, opened_project=True, project_name=project_name,userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)
    
    #  불러오기
    if open_project=='True':
        project_name = request.args.get('projectName')
        # pass_overview = request.args.get('pass_overview')
        return render_template('process/overviewProcess.html', categories=catlist, project_data = data, open_project = 'True', project_name=project_name,userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)

    # create project
    if request.method == 'GET': #최초 생성 
        # session.clear()
        new_pj = request.args.get('newPj')
        project_name = request.args.get('projectName')
        
        return render_template('process/overviewProcess.html', categories=catlist, new_pj=new_pj, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)
           
@app.route('/process/requirementsProcess', methods=['GET', 'POST'])
def requirements_process():
    project_name = request.form.get('project_name')
    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    project_name
    catlist = get_category(mariadb_pool)

    if request.method == 'GET':
        project_name = request.args.get('project_name')
        if not project_name:
            project_name = request.args.get('projectName')
            if not project_name:
                return redirect(url_for('overview_process',category = catlist, newPj=True, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup))


    return render_template('process/requirementsProcess.html',categories=catlist,  project_name=project_name,userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)

@app.route('/process/businessProcess', methods=['GET', 'POST'])
def business_process():
    active_process = True
    userId= session['userId'] 
    user_info = user_get_info(userId)
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    catlist = get_category(mariadb_pool)

    if request.method == 'GET':
        project_name = request.args.get('projectName')
        return render_template('process/businessProcess.html', categories=catlist, active_process=active_process, project_name=project_name, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)

@app.route('/process/workflowProcess', methods=['GET', 'POST'])
def workflow_process():
    active_workflow = True
    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    catlist = get_category(mariadb_pool)

    if request.method == 'GET':
        project_name = request.args.get('projectName')
        return render_template('process/workflowProcess.html', active_workflow=active_workflow, project_name=project_name, userIds =userIds, categories=catlist,userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup
)

@app.route('/process/policyProcess', methods=['GET', 'POST'])
def policy_process():
    active_policy = True
    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    catlist = get_category(mariadb_pool)

    if request.method == 'GET':
        project_name = request.args.get('projectName')
        return render_template('process/policyProcess.html', categories=catlist, active_policy=active_policy, project_name=project_name, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup
)

@app.route('/process/runProcess', methods=['GET', 'POST'])
def run_process():
    active_run = True
    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info

    if request.method == 'GET':
        project_name = request.args.get('projectName')
        return render_template('process/runProcess.html', active_run=active_run, project_name=project_name, userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup)


# node selector
@app.route('/get_label',methods = ['GET','POST'])
def get_label():
    label_dict = {}

    if request.method == 'GET':
        config.load_kube_config()
        v1 = client.CoreV1Api()
        nodes = v1.list_node()

        try:
            for node in nodes.items:
                node_name = node.metadata.name
                node_labels = node.metadata.labels
                label_dict[node_name] = node_labels

        except client.exceptions.ApiException as e:
            print(f"Error: {e}")

        
    # label_dict = {'etri-1': {'beta.kubernetes.io/arch': 'amd64', 'beta.kubernetes.io/os': 'linux', 'kubernetes.io/arch': 'amd64', 'kubernetes.io/hostip': '192.168.0.181', 'kubernetes.io/hostname': 'etri-1', 'kubernetes.io/os': 'linux', 'node-role.kubernetes.io/control-plane': '', 'node-role.kubernetes.io/master': '', 'node.kubernetes.io/exclude-from-external-load-balancers': ''}, 'etri-3': {'beta.kubernetes.io/arch': 'amd64', 'beta.kubernetes.io/os': 'linux', 'kubernetes.io/arch': 'amd64', 'kubernetes.io/hostip': '192.168.0.189', 'kubernetes.io/hostname': 'etri-3', 'kubernetes.io/os': 'linux'}}
    return jsonify(label_dict)

#############""" 아르고 """#########
NAMESPACE = 'argo'
ARGO_SERVER_URL = 'https://localhost:2746'
activity_dic = {}

def search_images(keyword):
    url = f'https://hub.docker.com/v2/search/repositories'
    params = {'query': keyword}

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if 'results' in data:
            image_list = [result['repo_name'] for result in data['results']]
            return image_list
    return None

def argo_logs_workflow(workflow_name):
    api_url = f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}/{workflow_name}/log?logOptions.container=main"
    response = requests.get(api_url, verify=False)
    if response.status_code == 200:
        logs = response.text
        return logs
    else:
        print(f"Failwd to fetch logs. Status code: {response.status_code}")
        return None

def argo_status_workflow(workflow_name):
    api_url = f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}/{workflow_name}"
    response = requests.get(api_url, verify=False)
    if response.status_code == 200:
        status = response.text
        return status
    else:
        print(f"FFailed to load status. Status code: {response.status_code}")
        return None

def search_local_images():
    output = subprocess.check_output(['docker', 'images', '--format', '{{.Repository}}']).decode().strip()

    # 이미지 이름을 리스트로 변환
    image_list = output.split('\n')

    return image_list

# activity_dic


# @app.route('/stop', methods=['PUT'])
# def stop_workflow():
#     data = request.get_json()
#     workflow_name = data.get('workflowName')
#     response = requests.put(f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}/"+workflow_name+'/stop', verify=False)
#     if response.status_code == 200:
#         print("Workflow stop successfully")
#         return "Workflow stop successfully", 200
#     else:
#         print("Workflow stop failed")
#         return "Workflow stop failed", 500


# @app.route('/terminate', methods=['PUT'])
# def terminate_workflow():
#     data = request.get_json()
#     workflow_name = data.get('workflowName')
#     response = requests.put(f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}/"+workflow_name+'/terminate', verify=False)
#     if response.status_code == 200:
#         print('Workflow terminated successfully')
#         return "Workflow terminated successfully", 200
#     else:
#         print("Workflow terminated failed")
#         return "Workflow terminated failed", 500

# @app.route('/delete', methods=['DELETE'])
# def delete_workflow():
#     data = request.get_json()
#     workflow_name = data.get('workflowName')
#     response = requests.delete(f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}/"+workflow_name, verify=False)
#     if response.status_code == 200:
#         print('Workflow deleted successfully')
#         return "Workflow deleted successfully", 200
#     else:
#         print("Workflow deleted failed")
#         return "Workflow deleted failed", 500

@app.route('/log', methods=['GET'])
def logs_workflow():
    workflow_name = request.args.get('workflow_name')
    logs = argo_logs_workflow(workflow_name)
    activity_dic[workflow_name+'_log'] = logs
    return logs

@app.route('/status', methods = ['GET'])
def staus_workflow():
    workflow_name = request.args.get('workflow_name')
    status = argo_status_workflow(workflow_name)
    activity_dic[workflow_name+'_status'] = status
    return status

@app.route('/search', methods=['GET', 'POST'])
def search():
    data = request.get_json()
    inputValue = data['inputValue']

    keyword = inputValue
    if not keyword:
        return jsonify({'error': 'Missing keyword parameter.'}), 400
    images = search_images(keyword)
    if images:
        print(images)
        return jsonify({'images': images}), 200
    else:
        return jsonify({'error': 'Failed to retrieve image list.'}), 500

@app.route('/localsearch', methods=['GET', 'POST'])
def searchlocal():

    images = search_local_images()
    if images:
        print(images)
        return jsonify({'images': images}), 200
    else:
        return jsonify({'error': 'Failed to retrieve image list.'}), 500

@app.route('/open', methods=['GET', 'POST'])
def projectOpen():
    return render_template('/open.html')



@app.route('/findUserId', methods=['POST'])
def check_username():
    # 아이디 찾기
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        response = check_userId(mariadb_pool,name = name, email=email)
    except:
        response = {'error': True ,'exists': False }

    return jsonify(response)


@app.route('/findUserPwd', methods=['POST'])
def find_user_pwd():
    # 비밀번호 찾기
    try:
        data = request.get_json()
        name = data['name']
        email = data['email']
        user_id = data['userId']
        response = find_pwd(mariadb_pool,name = name, email=email,user_id=user_id)
    except:
        response = {'error': True ,'exists': False }

    return jsonify(response)

@app.route('/changePwd', methods=['POST'])
def change_pwd():
    # 새로운 비밀번호 수정
    
    try:
        data = request.get_json()
        userId =  data['userId']
        new_pwd = data['newPwd']
        response = change_pwd(mariadb_pool,new_pwd=new_pwd, user_id=userId)
    except:
        response = {'error': True ,'result': False }

    return jsonify(response)

@app.route('/checkUserId', methods=['POST'])
def check_user_id():
    try:
        data = request.get_json()
        user_id = data['userId']
        response = cheack_id(mariadb_pool,user_id=user_id)
    except:
        response = {'error': True ,'result': False }

    return jsonify(response)


def getUserDict():
    prjs = get_user_info(mariadb_pool)
    projects = []

    for idx in range(len(prjs)):
        projects.append({'id': prjs[idx][0], 'name': prjs[idx][1], 'user': prjs[idx][2], 'user_pwd': prjs[idx][3], 'user_email': prjs[idx][4], 'group_index': prjs[idx][5], 'vaild': prjs[idx][6], 'admin': prjs[idx][7], 'group_name': prjs[idx][8]})
    return projects

def getSingleUserDict():
    prjs = get_user_single_info(mariadb_pool)
    projects = []

    for idx in range(len(prjs)):
        projects.append({'id': prjs[idx][0], 'name': prjs[idx][1], 'user': prjs[idx][2], 'user_pwd': prjs[idx][3], 'user_email': prjs[idx][4], 'group_index': prjs[idx][5], 'vaild': prjs[idx][6], 'admin': prjs[idx][7]})
    return projects

@app.route('/project/userManagement', methods=['GET', 'POST'])
def management_user():
    loginUserInfo = request.args.get('loginUserInfo')
    projects_info = getUserDict()

    userId= session['userId'] 
    user_info = user_get_info(userId)    
    userIds, userName, userEmail, userGroup, userAdmin = user_info
    # todo 프로젝트 리스트 정보 조회하는 기능 필요

    groups_info = getGroupDict()
    return render_template('userManagement.html', projects=projects_info,groups = groups_info ,userIds =userIds, userName=userName, userEmail=userEmail, userAdmin=userAdmin, userGroup=userGroup,loginUserInfo=loginUserInfo)


@app.route('/changeInfo', methods=['POST'])
def change_info():
    try:
        data = request.get_json()
        
        new_group = data['selectedGroup']
        new_valid =  str(data['isActive'])
        user = data['user']
        response = change_Info(mariadb_pool,new_group=new_group,new_valid=new_valid,user = user)
    except:
        response = {'error': True ,'result': False }

    return jsonify(response)


def user_get_info(userId):
    userInfo = get_user_single_info(userId,mariadb_pool)

    userIds = userInfo[0][1]
    userName = userInfo[0][2]
    userEmail = userInfo[0][4]

    if(userInfo[0][5] == 1):
        userGroup = "ETRI"
    elif(userInfo[0][5] == 2):
        userGroup = "KPST"
    elif(userInfo[0][5] == 999):
        userGroup = "공통"
    else:
        userGroup = "!!"
    userAdmin = userInfo[0][7]

    return userIds, userName, userEmail, userGroup, userAdmin

@app.route('/add_category', methods=['POST'])
def add_category():
    category_name = request.form['category_name']

    # 저장 로직 호출
    create_category(category_name,mariadb_pool)
    return jsonify({'result': 'success'})


@app.route('/delete_category', methods=['POST'])
def delete_category():
    category_name = request.form['category_name']

    # 삭제 로직 호출
    del_category(category_name, mariadb_pool)
    return jsonify({'result': 'success'})


@app.route('/add_group', methods=['POST'])
def add_group():
    group_name = request.form['group_name']

    # 저장 로직 호출
    response = add_grp(group_name,mariadb_pool)
    if response ==True:
        return jsonify({'result': 'success'})
    elif response ==False:
        return jsonify({'result': 'fail'})

@app.route('/delete_group', methods=['POST'])
def delete_group():
    group_name = request.form['group_name']

    # 삭제 로직 호출
    del_grp(group_name,mariadb_pool)

    return jsonify({'result': 'success'})

@app.route('/exists', methods=['GET'])
def exists():
    # userId= session['userId'] 
    # user_info = user_get_info(userId)    
    # userIds, userName, userEmail, userGroup, userAdmin = user_info
    project_name = request.args.get('project_name')
    user_id = request.args.get('userId')
    result = is_name_exists(project_name,mariadb_pool,user_id)
    if result == True:
        return 'true'
    else:
        return 'false'

@app.route('/submit', methods=['POST'])
def submit_workflow():
    try:
        workflow_json = request.get_json()
        print(workflow_json)
        headers = {
            "Content-Type": "application/json"
        }
        response = requests.post(f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}", headers=headers, json=workflow_json, verify=False)
        if response.status_code == 200:
            return "Workflow submitted successfully", 200
        else:
            return "Workflow submission failed", 500
    except Exception as e:
        error_message = str(e)
        return f"Error: {error_message}", 500

import re
@app.route('/runworkflow/run', methods=['POST'])
def runworkflow_run():
    data = request.get_json()

    prj_name = data.get('prj_name')
    dict_workflow = data.get('dict_workflow')
    business_xml_val = data.get('business_xml_val')
    # result = pharse_xml_to_json(dict_workflow["4#Activity na3me"])
    # print(result)
    # if data:
    #     return True
    # else:
    #     return False
    try:
        workflow_json = request.get_json()
        print(workflow_json)

        # Iterate over keys in dict_workflow and call pharse_xml_to_json
        for key, xml_data in dict_workflow.items():
            new_activity_name = prj_name+key
            # convert_activity_name = preprocess_string( new_activity_name)

            result_txt_data = pharse_xml_to_json(xml_data)
            result_json_data = json.loads(result_txt_data)
            result_json_data['workflow']['metadata']['name'] = key.split('#')[1] if '#' in key else None
            headers = {"Content-Type": "application/json"}
            response = requests.post(f"{ARGO_SERVER_URL}/api/v1/workflows/{NAMESPACE}", headers=headers, json=result_json_data, verify=False)

            if response.status_code == 200:
                print(f"Workflow for {key} submitted successfully")
                alert_data = {"message": key+"성공."}
                # return jsonify(alert_data)
            else:
                print(f"Workflow submission for {key} failed")
                alert_data = {"message": "{key}실패."}
                # return jsonify(alert_data)

        return "All workflows submitted successfully", 200

    except Exception as e:
        error_message = str(e)
        return f"Error: {error_message}", 500

def preprocess_string(input_string):
    # 특수문자 제거 (알파벳, 숫자, 공백만 남김)
    processed_string = re.sub(r'[^a-zA-Z0-9 ]', '', input_string)

    # 대문자를 소문자로 변환
    processed_string = processed_string.lower()

    # 띄어쓰기 제거
    processed_string = processed_string.replace(' ', '')

    return processed_string

if __name__ == '__main__':
    app.run(host = '0.0.0.0',debug=True)