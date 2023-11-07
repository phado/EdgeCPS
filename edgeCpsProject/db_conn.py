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
    data = project_data

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

            for key, value in data['processDatajsonData'].items():
                insert_data_sql = f"INSERT INTO `TB_PROCESS` (`PROJ_IDX`, `PROC_NAME`, `PROC_DATA`) VALUES(%s, %s, %s);"
                cursor.execute(insert_data_sql, (project_index, key,value))
            connection.commit()
        else:
            cursor.execute(f"SELECT `PROJ_IDX` FROM TB_PROJ WHERE PROJ_NAME = '{project_name}'")
            project_index = cursor.fetchall()
            sql = f"SELECT `PROC_NAME`, `PROC_DATA` FROM TB_PROCESS WHERE PROJ_IDX = '{project_index[0][0]}'"
            cursor.execute(sql)
            db_data = cursor.fetchall()

            for client_row,x in data['processDatajsonData'].items():
                for db_row in db_data:
                    if client_row == db_row[0]:
                        if x != db_row[1]:
                            # 수정된 내용이 있다면 업데이트 쿼리 생성
                            # update_query = f"UPDATE `TB_PROCESS` SET `PROC_DATA` = '{x}' WHERE `PROC_NAME` = '{client_row}' AND `PROJ_IDX` = '{project_index[0][0]}'"
                            ## 
                            update_query = "UPDATE TB_PROCESS SET PROC_DATA = %s WHERE PROC_NAME = %s AND PROJ_IDX = %s"
                            cursor.execute(update_query, (x, client_row, project_index[0][0]))
                            cursor.execute(update_query)
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

        sql = f"SELECT * FROM TB_USER"
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

