import pymysql  # pymysql 임포트
import mysql.connector.pooling
import dotenv
import os
import logging
import traceback
import json

dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)


def get_pool_conn():
    try:
        config = {

            'user': os.environ['root']
            , 'password':  os.environ['pw']
            , 'host': os.environ['ip']
            , 'port': os.environ['port']
            , 'database': 'EdgeCPS'
                  }
        # Mariadb 커넥션 풀 설정
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)
    except :
        config = {
            'user': 'minsoo'
            , 'password': '1111'
            , 'host': '10.110.122.165:3306'
            , 'port': '3306'
            , 'database': 'EdgeCPS'
        }
        # Mariadb 커넥션 풀 설정
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)
    return mariadb_pool


def add_table(mariadb_pool, project_name, project_data, userid):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)
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
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

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
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

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
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

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


def get_user_info():
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
        'user': os.environ['root']
        , 'password':  os.environ['pw']
        , 'host': os.environ['ip']
        , 'port': os.environ['port']
        , 'database': 'EdgeCPS'
                }
        
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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

def get_user_single_info(userId):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
        'user': os.environ['root']
        , 'password':  os.environ['pw']
        , 'host': os.environ['ip']
        , 'port': os.environ['port']
        , 'database': 'EdgeCPS'
                }
        
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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


def get_category():
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
        'user': os.environ['root']
        , 'password':  os.environ['pw']
        , 'host': os.environ['ip']
        , 'port': os.environ['port']
        , 'database': 'EdgeCPS'
                }
        
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT name FROM TB_CATE;"
        cursor.execute(sql)
        db_data = cursor.fetchall()

        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()


def create_category(category):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
            'user': os.environ['root'],
            'password': os.environ['pw'],
            'host': os.environ['ip'],
            'port': os.environ['port'],
            'database': 'EdgeCPS',
        }

        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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

def del_category(category):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
            'user': os.environ['root'],
            'password': os.environ['pw'],
            'host': os.environ['ip'],
            'port': os.environ['port'],
            'database': 'EdgeCPS',
        }

        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
        'user': os.environ['root']
        , 'password':  os.environ['pw']
        , 'host': os.environ['ip']
        , 'port': os.environ['port']
        , 'database': 'EdgeCPS'
                }
        
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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

def add_grp(group):
    code = "code"
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
            'user': os.environ['root'],
            'password': os.environ['pw'],
            'host': os.environ['ip'],
            'port': os.environ['port'],
            'database': 'EdgeCPS',
        }

        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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

def del_grp(group):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
            'user': os.environ['root'],
            'password': os.environ['pw'],
            'host': os.environ['ip'],
            'port': os.environ['port'],
            'database': 'EdgeCPS',
        }

        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

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