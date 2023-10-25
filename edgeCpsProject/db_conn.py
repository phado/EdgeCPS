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


def add_table(project_name, project_data, userid):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)
    data = project_data

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
                            update_query = f"UPDATE `{project_name}` SET `value` = '{x}' WHERE `key` = '{client_row}'"
                            cursor.execute(update_query)
                            connection.commit()
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()


def get_projet_info():
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

        sql = f"SELECT * FROM TB_PROJ"
        cursor.execute(sql)
        db_data = cursor.fetchall()

        return db_data
        
    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())
    finally:
        cursor.close()
        connection.close()

def load_project(project_index):
    dotenv_file = dotenv.find_dotenv()
    dotenv.load_dotenv(dotenv_file)

    try:
        config = {
            'user': os.environ['root'],
            'password': os.environ['pw'],
            'host': os.environ['ip'],
            'port': os.environ['port'],
            'database': 'EdgeCPS'
        }

        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **config)

        connection = mariadb_pool.get_connection()
        cursor = connection.cursor(buffered=True)

        sql = f"SELECT PROC_NAME, PROC_DATA FROM TB_PROCESS WHERE PROJ_IDX = '{project_index}'"
        cursor.execute(sql)
        data = cursor.fetchall()

        return data

    except Exception as e:
        print(str(e))
        logging.error(traceback.format_exc())   