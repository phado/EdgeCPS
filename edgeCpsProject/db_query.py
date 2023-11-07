
import logging
import traceback
import os
import mysql.connector.pooling

# 로그 기록 함수
logging.basicConfig(filename='./DB_Query.log', level=logging.ERROR)


def login(mariadb_pool,id ,pwd ):
    login_info = {'login' : False , 'user_name' : ''}
    try:
        connection = mariadb_pool.get_connection()

        # 커넥션을 사용하여 쿼리 실행
        cursor = connection.cursor(buffered=True)
        sql = 'SELECT * FROM TB_USER WHERE USER_ID = %s AND USER_PWD = %s'
        # cursor.execute("SELECT USER_NAME From TB_USER WHERE USER_ID = '"+id+"' AND USER_PWD  = '"+pwd+"';")
        cursor.execute(sql,(id,pwd))
        results = cursor.fetchall()

        if results:
            login_info['login'] = True
            login_info['user_name'] = results[0]
    except :
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

    return login_info


def check_userId(mariadb_pool, name, email ):
# 이름 비교 함수 
    try:
        response = {'exists': False }
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM TB_USER WHERE USER_NAME = %s", (name,))
        count = cursor.fetchone()[0]

        if count == 1:
            cursor.execute("SELECT USER_ID FROM TB_USER WHERE USER_NAME = %s", (name,))
            user_id = cursor.fetchone()[0]
            response = {'exists': True , 'userId' : user_id }
        else:
            response = {'exists': False}

    except :
        logging.error(traceback.format_exc())
        response = {'error': True , 'exists': False }
    finally:
        cursor.close()
        connection.close()


    return response




def find_pwd(mariadb_pool, name, email,user_id ):
    # 비밀번호 찾기
    try:
        response = {'exists': False }
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM TB_USER WHERE USER_NAME = %s AND USER_EMAIL = %s AND USER_ID = %s", (name, email, user_id))
        count = cursor.fetchone()[0]

        if count == 1:
            cursor.execute("SELECT USER_PWD FROM TB_USER WHERE USER_NAME = %s", (name,))
            user_pw = cursor.fetchone()[0]
            response = {'exists': True , 'userPw' : user_pw }
        elif count == 0:
            response = {'error': False, 'exists': False}
        else:
            response = {'error': False,'exists': False}

    except :
        logging.error(traceback.format_exc())
        response = {'error': True , 'exists': False }
    finally:
        cursor.close()
        connection.close()


    return response

def check_sameId(mariadb_pool, name, email ):
    # 아이디 중복 검사 
    try:
        response = {'exists': False }
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM TB_USER WHERE USER_ID = %s", (userId,))
        count = cursor.fetchone()[0]

        if count > 0:
            response = {'exists': True , 'userId' : 유저아이디 }
        else:
            response = {'exists': False}

    except :
        logging.error(traceback.format_exc())
        response = {'error': True , 'exists': False }
    finally:
        cursor.close()
        connection.close()


    return response

def sign_up(mariadb_pool, name, userId, password, email, birthdate, group):
    sign_up_info = {'sign_up': False}  # 기본값으로 실패 상태 설정

    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor()
        
        cursor.execute(
            "INSERT INTO TB_USER (USER_ID, USER_NAME, USER_PWD, USER_EMAIL, GROUP_IDX) VALUES (%s, %s, %s, %s, %s)",
            (userId, name, password, email, group)
        )
        connection.commit()

        sign_up_info['sign_up'] = True  # 성공한 경우 'sign_up'을 True로 설정

    except Exception as e:
        logging.error(traceback.format_exc())
        sign_up_info['error'] = str(e)  # 오류 메시지 저장

    finally:
        cursor.close()
        connection.close()

    return sign_up_info


def change_pwd(mariadb_pool, new_pwd, user_id):
    # 비밀 번호 수정
    response = {'error': False , 'result': False}
    try:
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("UPDATE TB_USER SET USER_PWD = %s WHERE USER_ID = %s", (new_pwd, user_id))
        connection.commit()

        response['result'] = True

    except:
        logging.error(traceback.format_exc())
        response['result'] = False
        response['error'] = True
    finally:
        cursor.close()
        connection.close()

    return response

def cheack_id(mariadb_pool, user_id):
    # 비밀 번호 수정
    response = {'error': False , 'result': False}
    try:
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        query = "SELECT COUNT(*) FROM TB_USER WHERE USER_ID = %s"

        cursor.execute(query, (user_id,))
        result = cursor.fetchone()

        if result[0] == 1:
            response['result'] = "same" 
        else:
            response['result'] = "nosame"   

    except:
        logging.error(traceback.format_exc())
        response['result'] = False
        response['error'] = True
    finally:
        cursor.close()
        connection.close()

    return response


def delete_project(mariadb_pool, project_id):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor()

        delete_process_query = 'DELETE FROM TB_PROCESS WHERE PROJ_IDX = %s'
        cursor.execute(delete_process_query, (project_id,))

        delete_project_query = 'DELETE FROM TB_PROJ WHERE PROJ_IDX = %s'
        cursor.execute(delete_project_query,(project_id,))

        connection.commit()
    except:
        logging.error(traceback.format_exc())

    finally:
        cursor.close()
        connection.close()
        
def change_Info(mariadb_pool, new_group, new_valid, user):
    response = {'error': False , 'result': False}
    try:
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("UPDATE TB_USER SET GROUP_IDX = %s, VALID = %s WHERE USER_IDX = %s", (new_group, new_valid, user))
        connection.commit()

        response['result'] = True

    except:
        logging.error(traceback.format_exc())
        response['result'] = False
        response['error'] = True
    finally:
        cursor.close()
        connection.close()

    return response