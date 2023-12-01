# Dockerfile

FROM mariadb:latest

# ENV MYSQL_ROOT_PASSWORD=1234
COPY ./edgecps_dump.sql /docker-entrypoint-initdb.d/
RUN chmod 755 -R /docker-entrypoint-initdb.d/


RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y mysql-client
RUN cd docker-entrypoint-initdb.d && mysql -u root -p 1234 > init.sql
EXPOSE 3306