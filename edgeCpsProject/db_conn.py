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
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **config)
    except :
        config = {
            'user': 'minsoo'
            , 'password': '1111'
            , 'host': '10.110.122.165:3306'
            , 'port': '3306'
            , 'database': 'EdgeCPS'
        }
        # Mariadb 커넥션 풀 설정
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **config)
    return mariadb_pool
