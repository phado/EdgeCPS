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

            'user': os.getenv("DB_USER"),
            'password': os.getenv("DB_PASSWORD"),
            'host': os.getenv("DB_HOST"),
            'port': os.getenv("DB_PORT"),
            'database': 'EdgeCPS'
        }
        # Mariadb 커넥션 풀 설정
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **config)
    except :
        config = {
            'user': 'root'
            , 'password': '1234'
            , 'host': '112.167.170.54'
            , 'port': '30102'
            , 'database': 'EdgeCPS'
        }
        # Mariadb 커넥션 풀 설정
        mariadb_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name="mypool", pool_size=10, **config)
    return mariadb_pool
