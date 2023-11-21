
import logging
import traceback
import os
import mysql.connector.pooling

# 로그 기록 함수
logging.basicConfig(filename='./DB_Query.log', level=logging.ERROR)


def db_login(mariadb_pool,id ,pwd ):
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


def delete_project_from_db(mariadb_pool, project_id):
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

def add_table_save_prj(mariadb_pool, project_name, project_data, userid):
    data = project_data['processDatajsonData']
    data2 = project_data['workflowDatajsonData']
    data.update(data2)
    
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(prepared=True)
        
        exist_sql = f"SELECT COUNT(*) as count FROM TB_PROJ WHERE PROJ_NAME = '{project_name}'"
        cursor.execute(exist_sql)
        exist_count = cursor.fetchone()
        # 최초 저장일 경우
        if exist_count[0] == 0:

            cursor.execute(f"SELECT `USER_IDX` FROM TB_USER WHERE USER_ID = '{userid}'")
            user_id = cursor.fetchall()[0][0]
            insert_sql = f"INSERT INTO `TB_PROJ` (`PROJ_NAME`, `PROJ_CREATE_DATE`, `USER_IDX`) VALUES ('{project_name}', NOW(), '{user_id}');"
            cursor.execute(insert_sql)

            cursor.execute(f"SELECT `PROJ_IDX` FROM TB_PROJ WHERE PROJ_NAME = '{project_name}'")
            project_index = cursor.fetchall()[0][0]

                # create_process_table_sql = f"CREATE TABLE `{table_name}` (id INT AUTO_INCREMENT PRIMARY KEY, `key` VARCHAR(255), `value` LONGTEXT);"
                # cursor.execute(create_process_table_sql)

                # create_project_table_sql = f"CREATE TABLE `{userid}` (id INT AUTO_INCREMENT PRIMARY KEY, `projectname` VARCHAR(255), `userid` VARCHAR(255));"
                # cursor.execute(create_project_table_sql)

            for key, value in data.items():
                insert_data_sql = f"INSERT INTO `TB_PROCESS` (`PROJ_IDX`, `PROC_NAME`, `PROC_DATA`) VALUES(%s, %s, %s);"
                cursor.execute(insert_data_sql, (project_index, key,value))

            connection.commit()
        else:
            cursor.execute(f"SELECT `PROJ_IDX` FROM TB_PROJ WHERE PROJ_NAME = '{project_name}'")
            project_index = cursor.fetchall()
            sql = f"SELECT `PROC_NAME`, `PROC_DATA` FROM TB_PROCESS WHERE PROJ_IDX = '{project_index[0][0]}'"
            cursor.execute(sql)
            db_data = cursor.fetchall()

            for client_row, x in data.items():
                for db_row in db_data:
                    if client_row == db_row[0]:
                        if x != db_row[1]:
                            # x = x.replace('"',"'")
                            # 수정된 내용이 있다면 업데이트 쿼리 생성
                            update_query = f"UPDATE `TB_PROCESS` SET `PROC_DATA` = %s WHERE `PROC_NAME` = %s AND `PROJ_IDX` = %s;"
                            cursor.execute(update_query, (x, client_row, project_index[0][0]))
                            connection.commit()
                        break  # 일치하는 요소를 찾았으므로 루프 종료
                else:
                    # 루프가 break로 종료되지 않았다면 (즉, 데이터베이스에 존재하지 않는 요소)
                    # 추가하는 쿼리 생성
                    # x = x.replace('"',"'")
                    insert_query = f"INSERT INTO `TB_PROCESS` (`PROJ_IDX`, `PROC_NAME`, `PROC_DATA`) VALUES(%s, %s, %s);"
                    cursor.execute(insert_query, (project_index[0][0], client_row, x))
                    connection.commit()

            # 데이터베이스에 있는 요소 중에서 data['processDatajsonData'].items()에 없는 요소 삭제
            for db_row in db_data:
                if db_row[0] not in data['processDatajsonData']:
                    delete_query = f"DELETE FROM `TB_PROCESS` WHERE `PROC_NAME` = %s AND `PROJ_IDX` = %s;"
                    cursor.execute(delete_query, (db_row[0], project_index[0][0]))
                    connection.commit()
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()


def get_projet_info(mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT * FROM TB_PROJ"
        cursor.execute(sql)
        db_data = cursor.fetchall()
        

        for i in range(len(db_data)):
            list_db_data = list(db_data[i])
            sql = f"SELECT USER_NAME FROM TB_USER WHERE USER_IDX = {list_db_data[3]}"
            cursor.execute(sql)
            user_name = cursor.fetchall()
            list_db_data[3] = user_name[0][0]
            db_data[i] = tuple(list_db_data)
        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def get_projet_info2(mariadb_pool,userId):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT GROUP_IDX FROM TB_USER WHERE USER_ID = '{userId}'"
        cursor.execute(sql)
        user_group = cursor.fetchall()[0][0]
        sql = f"SELECT TP.PROJ_IDX, TP.PROJ_NAME, TP.PROJ_CREATE_DATE, TU.USER_IDX FROM TB_PROJ TP INNER JOIN TB_USER TU ON TP.USER_IDX = TU.USER_IDX WHERE TU.GROUP_IDX = '{user_group}'"
        cursor.execute(sql)
        db_data = cursor.fetchall()
        

        for i in range(len(db_data)):
            list_db_data = list(db_data[i])
            sql = f"SELECT USER_NAME FROM TB_USER WHERE USER_IDX = {list_db_data[3]}"
            cursor.execute(sql)
            user_name = cursor.fetchall()
            list_db_data[3] = user_name[0][0]
            db_data[i] = tuple(list_db_data)
        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def load_project(project_index, mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT PROC_NAME, PROC_DATA FROM TB_PROCESS WHERE PROJ_IDX = '{project_index}'"
        cursor.execute(sql)
        # data = cursor.fetchall()
        # data = [dict(row) for row in cursor.fetchall()]
        results = cursor.fetchall()
        # data = [dict(PROC_NAME=row[0], PROC_DATA=row[1]) for row in results]
        data={}
        for row in results:
            data[row[0]]= row[1]

        return data

    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())   
    finally:
        cursor.close()
        connection.close()


def get_user_info(mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT TB_USER.*, TB_GROUP.GROUP_NAME FROM TB_USER INNER JOIN TB_GROUP ON TB_USER.GROUP_IDX = TB_GROUP.GROUP_IDX;"
        cursor.execute(sql)
        db_data = cursor.fetchall()

        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def get_user_single_info(userId,mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT * FROM TB_USER WHERE USER_ID = '{userId}'"
        cursor.execute(sql)
        db_data = cursor.fetchall()

        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()


def get_category(mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT name FROM TB_CATE;"
        cursor.execute(sql)
        db_data = cursor.fetchall()
        extracted_values = [item[0] for item in db_data]

        return extracted_values
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()


def create_category(category,mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"INSERT INTO TB_CATE (id, name) VALUES (DEFAULT, '{category}');"

        cursor.execute(sql)
        connection.commit()
        
        # 영향을 받은 행의 수를 확인
        affected_rows = cursor.rowcount

        return affected_rows

    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def del_category(category,mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        # SQL 쿼리를 파라미터화하여 SQL 인젝션을 방지
        sql = "DELETE FROM TB_CATE WHERE name = %s"
        cursor.execute(sql, (category,))

        connection.commit()
        
        # 영향을 받은 행의 수를 확인
        affected_rows = cursor.rowcount

        return affected_rows

    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
        logging.error("MySQL Error: %s", e)
    except Exception as e:
        print(f"Error: {e}")
        logging.error("Error: %s", e)
    finally:
        cursor.close()
        connection.close()

def get_group_info(mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT * FROM TB_GROUP;"
        cursor.execute(sql)
        db_data = cursor.fetchall()

        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def add_grp(group,mariadb_pool):
    code = "code"
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"INSERT INTO TB_GROUP (GROUP_IDX, GROUP_NAME,GROUP_CODE) VALUES (DEFAULT, '{group}','{code}');"

        cursor.execute(sql)
        connection.commit()
        
        # 영향을 받은 행의 수를 확인
        affected_rows = cursor.rowcount

        return affected_rows

    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def del_grp(group,mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        # SQL 쿼리를 파라미터화하여 SQL 인젝션을 방지
        sql = "DELETE FROM TB_GROUP WHERE GROUP_NAME = %s"
        cursor.execute(sql, (group,))

        connection.commit()
        
        # 영향을 받은 행의 수를 확인
        affected_rows = cursor.rowcount

        return affected_rows

    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
        logging.error("MySQL Error: %s", e)
    except Exception as e:
        print(f"Error: {e}")
        logging.error("Error: %s", e)
    finally:
        cursor.close()
        connection.close()

def is_name_exists(project_name,mariadb_pool):
    try:
        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        # SQL 쿼리를 파라미터화하여 SQL 인젝션을 방지
        sql = "SELECT PROJ_NAME FROM TB_PROJ WHERE PROJ_NAME = %s"
        cursor.execute(sql, (project_name,))
        db_data = cursor.fetchall()
        if len(db_data) > 0:
            return False
        else:
            return True

    except mysql.connector.Error as e:
        print(f"MySQL Error: {e}")
        logging.error("MySQL Error: %s", e)
    except Exception as e:
        print(f"Error: {e}")
        logging.error("Error: %s", e)
    finally:
        cursor.close()
        connection.close()