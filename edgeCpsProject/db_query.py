
import logging
import traceback

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
    # 아이디 중복 검사 /// 아이디 찾기 같이 사용
    try:
        response = {'exists': False }
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (userId,))
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




def find_pwd(mariadb_pool, name, email,user_id ):
    # 비밀번호 찾기
    try:
        response = {'exists': False }
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (userId,))
        count = cursor.fetchone()[0]

        if count > 0:
            response = {'exists': True }
        else:
            response = {'exists': False}

    except :
        logging.error(traceback.format_exc())
        response = {'error': True , 'exists': False }
    finally:
        cursor.close()
        connection.close()


    return response


def sign_up(mariadb_pool, name,userId ,password,email,birthdate,group):
    """

    회원가입

    :return: 성공 여부
    """
    sign_up_info = {'sign_up' : False}
    try:
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (name,userId ,password,email,birthdate,group))
        connection.commit()
        
        sign_up_info['sign_up'] = True
        
    except :
        logging.error(traceback.format_exc())
        
    finally:
        cursor.close()
        connection.close()

    return sign_up_info


def change_pwd(mariadb_pool, new_pwd):
    # 비밀 번호 수정
    response = {'error': False , 'result': False}
    try:
        connection = mariadb_pool.get_connection()

        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (new_pwd) VALUES (%s, %s)",new_pwd)
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