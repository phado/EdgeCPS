from kubernetes import client, config
from kubernetes.client.rest import ApiException
import os
import subprocess
import yaml
from jinja2 import Environment, FileSystemLoader
import socket

NAMESPACE = 'edgecps'
ARGO_NAMESPCAE = 'argo'
user_name = os.getlogin()
host_name = socket.gethostname()
node_selector = {"kubernetes.io/hostname": host_name}
tolerantion = {}

def create_namespace(namespace_name):
    config.load_kube_config()
    api_instance = client.CoreV1Api()

    body = client.V1Namespace(metadata=client.V1ObjectMeta(name=namespace_name))

    try:
        api_instance.create_namespace(body)
        print(f"Namespace {namespace_name} created successfully.")

    except client.exceptions.ApiException as e:
        print(f"Exception when creating Namespace: {e}")
def create_mariadb_object():
    container = client.V1Container(
        image="mariadb",
        name="mariadb",
        ports=[client.V1ContainerPort(container_port=3306)],
        volume_mounts=[
            {"name": "mariadb-persistent-storage", "mountPath": "/docker-entrypoint-initdb.d"},
            {"name": "mariadb-data", "mountPath": "/var/lib/mysql", "subPath": "mysql"}
        ],
        env=[
            {"name": "MYSQL_ROOT_PASSWORD", "valueFrom": {"secretKeyRef": {"name": "mariadb-secret", "key": "password"}}},
            {"name": "DB_HOST", "valueFrom": {"configMapKeyRef": {"name": "mariadb-initdb-config", "key": "DB_HOST"}}}
        ]
    )
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels={"app": "mariadb"}),
        spec=client.V1PodSpec(
            containers=[container],
            volumes=[
                {"name": "mariadb-persistent-storage", "configMap": {"name": "mariadb-initdb-config"}},
                {"name": "mariadb-data", "persistentVolumeClaim": {"claimName": "mariadb-pv-claim"}}
            ],
            node_selector=node_selector,
            tolerations=[{"effect": "NoSchedule", "key": "node-role.kubernetes.io/control-plane"}] 
        )
    )
    spec = client.V1DeploymentSpec(
        replicas=3,
        selector={"matchLabels": {"app": "mariadb"}},
        template=template,
        strategy={"type": "Recreate"}
    )
    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(name="mariadb"),
        spec=spec
    )
    return deployment

def create_mariadb_config_map_object():
    config_map_data = {
        "init.sql": """
                CREATE DATABASE IF NOT EXISTS EdgeCPS;

                USE EdgeCPS;

                -- MariaDB dump 10.19  Distrib 10.7.8-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: EdgeCPS
-- ------------------------------------------------------
-- Server version	10.7.8-MariaDB-1:10.7.8+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `TB_CATE`
--

DROP TABLE IF EXISTS `TB_CATE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TB_CATE` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TB_CATE`
--

LOCK TABLES `TB_CATE` WRITE;
/*!40000 ALTER TABLE `TB_CATE` DISABLE KEYS */;
INSERT INTO `TB_CATE` VALUES
(20,'Web'),
(21,'Mobile'),
(22,'Cloud'),
(23,'Embedded system');
/*!40000 ALTER TABLE `TB_CATE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TB_GROUP`
--

DROP TABLE IF EXISTS `TB_GROUP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TB_GROUP` (
  `GROUP_IDX` bigint(20) NOT NULL AUTO_INCREMENT,
  `GROUP_NAME` varchar(100) NOT NULL,
  `GROUP_CODE` varchar(100) NOT NULL,
  PRIMARY KEY (`GROUP_IDX`)
) ENGINE=InnoDB AUTO_INCREMENT=1021 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TB_GROUP`
--

LOCK TABLES `TB_GROUP` WRITE;
/*!40000 ALTER TABLE `TB_GROUP` DISABLE KEYS */;
INSERT INTO `TB_GROUP` VALUES
(1,'ETRI',''),
(2,'KPST',''),
(1017,'aaa','code'),
(1018,'ddd','code'),
(1020,'cccc','code');
/*!40000 ALTER TABLE `TB_GROUP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TB_PROCESS`
--

DROP TABLE IF EXISTS `TB_PROCESS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TB_PROCESS` (
  `PROC_IDX` bigint(20) NOT NULL AUTO_INCREMENT,
  `PROJ_IDX` bigint(20) NOT NULL,
  `PROC_NAME` varchar(100) NOT NULL,
  `PROC_DATA` longtext DEFAULT NULL,
  PRIMARY KEY (`PROC_IDX`),
  KEY `TB_PROCESS_FK` (`PROJ_IDX`),
  CONSTRAINT `TB_PROCESS_FK` FOREIGN KEY (`PROJ_IDX`) REFERENCES `TB_PROJ` (`PROJ_IDX`)
) ENGINE=InnoDB AUTO_INCREMENT=842 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TB_PROCESS`
--

LOCK TABLES `TB_PROCESS` WRITE;
/*!40000 ALTER TABLE `TB_PROCESS` DISABLE KEYS */;
INSERT INTO `TB_PROCESS` VALUES
(533,133,'overviewProcessXML','{\"name\":\"dd\",\"description\":\"dd\",\"category\":\"java\"}'),
(534,133,'requirementsProcessXml','<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;&lt;functional requirement&gt;&gt;&#10;[name]\" class=\"geItem DiShape Class 2\" text=\"\" id=\"2\"><mxCell xmlns=\"\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"320\" y=\"190\" width=\"200\" height=\"50\" as=\"geometry\"/></mxCell></object></root></mxGraphModel>'),
(535,133,'businessProcessXml',''),
(839,212,'overviewProcessXML','{\"name\":\"testSample\",\"description\":\"testSample\",\"category\":\"Web\"}'),
(840,212,'requirementsProcessXml','<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;&lt;functional requirement&gt;&gt;&#10;[name]\" class=\"geItem DiShape Class 2\" text=\"\" id=\"2\"><mxCell parent=\"1\" xmlns=\"\" vertex=\"1\"><mxGeometry x=\"200\" y=\"160\" width=\"200\" height=\"50\" as=\"geometry\"/></mxCell></object><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;&lt;functional requirement&gt;&gt;&#10;[fff]\" req.id=\"\" req.name=\"\" req.definition=\"\" detailed.description=\"\" parent.requirements=\"\" children.requirements=\"\" id=\"3\"><mxCell xmlns=\"\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"200\" y=\"260\" width=\"200\" height=\"50\" as=\"geometry\"/></mxCell></object></root></mxGraphModel>'),
(841,212,'businessProcessXml','<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;div style=&quot;font-weight: bold&quot;&gt;[testsample]&lt;/div&gt;\" class=\"geItem DiShape Rounded Rectangle\" description=\"\" input_information=\"\" output_information=\"\" id=\"2\"><mxCell style=\"rounded=1;whiteSpace=wrap;html=1;\" parent=\"1\" xmlns=\"\" vertex=\"1\"><mxGeometry x=\"410\" y=\"190\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell></object><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;div style=&quot;font-weight: bold&quot;&gt;[aaa]&lt;/div&gt;\" class=\"geItem DiShape Rounded Rectangle\" description=\"\" input_information=\"\" output_information=\"\" id=\"3\"><mxCell style=\"rounded=1;whiteSpace=wrap;html=1;\" parent=\"1\" xmlns=\"\" vertex=\"1\"><mxGeometry x=\"360\" y=\"330\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell></object><object xmlns=\"http://www.w3.org/1999/xhtml\" label=\"&lt;div style=&quot;font-weight:bold;&quot;&gt;[Activity name]&lt;/div&gt;\" description=\"\" input_information=\"\" output_information=\"\" id=\"4\"><mxCell style=\"rounded=1;whiteSpace=wrap;html=1;\" parent=\"1\" xmlns=\"\" vertex=\"1\"><mxGeometry x=\"60\" y=\"140\" width=\"120\" height=\"60\" as=\"geometry\"/></mxCell></object></root></mxGraphModel>');
/*!40000 ALTER TABLE `TB_PROCESS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TB_PROJ`
--

DROP TABLE IF EXISTS `TB_PROJ`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TB_PROJ` (
  `PROJ_IDX` bigint(20) NOT NULL AUTO_INCREMENT,
  `PROJ_NAME` varchar(100) NOT NULL,
  `PROJ_CREATE_DATE` varchar(100) NOT NULL,
  `USER_IDX` bigint(20) NOT NULL,
  PRIMARY KEY (`PROJ_IDX`),
  KEY `TB_PROJ_FK` (`USER_IDX`),
  CONSTRAINT `TB_PROJ_FK` FOREIGN KEY (`USER_IDX`) REFERENCES `TB_USER` (`USER_IDX`)
) ENGINE=InnoDB AUTO_INCREMENT=213 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TB_PROJ`
--

LOCK TABLES `TB_PROJ` WRITE;
/*!40000 ALTER TABLE `TB_PROJ` DISABLE KEYS */;
INSERT INTO `TB_PROJ` VALUES
(133,'dd','2023-11-22 05:26:31',10017),
(134,'jmt','2023-11-22 05:50:26',10017),
(212,'testSample','2023-11-30 08:04:42',10005);
/*!40000 ALTER TABLE `TB_PROJ` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TB_USER`
--

DROP TABLE IF EXISTS `TB_USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TB_USER` (
  `USER_IDX` bigint(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` varchar(100) NOT NULL,
  `USER_NAME` varchar(100) NOT NULL,
  `USER_PWD` varchar(100) NOT NULL,
  `USER_EMAIL` varchar(100) NOT NULL,
  `GROUP_IDX` bigint(20) NOT NULL,
  `VALID` int(11) DEFAULT NULL,
  `ADMIN` int(11) DEFAULT NULL,
  PRIMARY KEY (`USER_IDX`),
  KEY `TB_USER_FK` (`GROUP_IDX`),
  CONSTRAINT `TB_USER_FK` FOREIGN KEY (`GROUP_IDX`) REFERENCES `TB_GROUP` (`GROUP_IDX`)
) ENGINE=InnoDB AUTO_INCREMENT=10023 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TB_USER`
--

LOCK TABLES `TB_USER` WRITE;
/*!40000 ALTER TABLE `TB_USER` DISABLE KEYS */;
INSERT INTO `TB_USER` VALUES
(10005,'etri','admin','1234','tmp@kpst.co.kr',1,1,1),
(10017,'kpst1234','rnjstnsdn','kpst1234','soon@kpst.co.kr',1017,0,NULL),
(10018,'test1234','test','test1234','test@naver.com',1,NULL,NULL);
/*!40000 ALTER TABLE `TB_USER` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-30  8:34:22

            """
    }

    # 추가할 ConfigMap 데이터
    additional_config_data = {
        "DB_USER": "root",
        "DB_PASSWORD": "1234",
        "DB_HOST": "mariadb",
        "DB_PORT": "30102"
    }

    # ConfigMap 데이터를 합침


    config_map = client.V1ConfigMap(
        api_version="v1",
        kind="ConfigMap",
        metadata=client.V1ObjectMeta(name="mariadb-initdb-config"),
        data=config_map_data
    )
    config_map_data.update(additional_config_data)
    return config_map


def create_mariadb_persistent_volume_object():
    current_file_path = os.path.abspath(__file__)
    volume_path = current_file_path.replace("/install/install.py", "/edgeCpsProject/db/data")
    persistent_volume = client.V1PersistentVolume(
        api_version="v1",
        kind="PersistentVolume",
        metadata=client.V1ObjectMeta(
            name="mariadb-pv-volume",
            labels={"type": "local"}
        ),
        spec=client.V1PersistentVolumeSpec(
            storage_class_name="",
            capacity={"storage": "50Gi"},
            access_modes=["ReadWriteMany"],
            host_path=client.V1HostPathVolumeSource(path=volume_path)
        )
    )
    return persistent_volume


def create_mariadb_persistent_volume_claim_object():
    persistent_volume_claim = client.V1PersistentVolumeClaim(
        api_version="v1",
        kind="PersistentVolumeClaim",
        metadata=client.V1ObjectMeta(name="mariadb-pv-claim"),
        spec=client.V1PersistentVolumeClaimSpec(
            storage_class_name="",
            access_modes=["ReadWriteMany"],
            resources=client.V1ResourceRequirements(
                requests={"storage": "50Gi"}
            )
        )
    )
    return persistent_volume_claim

def mariadb_create_secret_object():
    secret_data = {
        "password": "MTIzNA=="
    }
    secret = client.V1Secret(
        api_version="v1",
        kind="Secret",
        metadata=client.V1ObjectMeta(name="mariadb-secret"),
        data=secret_data
    )
    return secret

def mariadb_create_service_object():
    service = client.V1Service(
        api_version="v1",
        kind="Service",
        metadata=client.V1ObjectMeta(name="mariadb"),
        spec=client.V1ServiceSpec(
            type="NodePort",
            ports=[client.V1ServicePort(port=3306, node_port=30102)],
            selector={"app": "mariadb"}
        )
    )
    return service


def create_edgecps_deployment():

    config.load_kube_config()
    deployment = client.V1Deployment(
        api_version="apps/v1",
        kind="Deployment",
        metadata=client.V1ObjectMeta(name="edgecps"),
        spec=client.V1DeploymentSpec(
            replicas=1,
            selector={"matchLabels": {"app": "flask-app"}},
            template=client.V1PodTemplateSpec(
                metadata=client.V1ObjectMeta(labels={"app": "flask-app"}),
                spec=client.V1PodSpec(
                    containers=[
                        client.V1Container(
                            name="flask-app",
                            image="edgecps",
                            volume_mounts=[
                                # client.V1VolumeMount(
                                #     name="docker-socket",
                                #     mount_path="/var/run/docker.sock"
                                # ),
                                client.V1VolumeMount(
                                    name="kube-config",
                                    mount_path="/root/.kube/"
                                )
                            ],
                            security_context=client.V1SecurityContext(
                                privileged=True
                            ),
                            image_pull_policy="Never",
                            ports=[client.V1ContainerPort(container_port=5000)]
                        )
                    ],
                    volumes=[
                        # client.V1Volume(
                        #     name="docker-socket",
                        #     host_path=client.V1HostPathVolumeSource(path="/var/run/docker.sock")
                        # ),
                        client.V1Volume(
                            name="kube-config",
                            host_path=client.V1HostPathVolumeSource(path="/home/"+user_name+"/.kube")
                        )
                    ],
                    node_selector=node_selector,
                    tolerations=[{"effect": "NoSchedule", "key": "node-role.kubernetes.io/control-plane"}]
                )
            )
        )
    )
    return deployment

def create_edgecps_service():
    config.load_kube_config()
    service = client.V1Service(
        api_version="v1",
        kind="Service",
        metadata=client.V1ObjectMeta(name="edgecpsservice"),
        spec=client.V1ServiceSpec(
            selector={"app": "flask-app"},
            ports=[
                client.V1ServicePort(
                    protocol="TCP",
                    port=80,
                    target_port=5000,
                    node_port=30808
                )
            ],
            type="NodePort"
        )
    )
    return service

def main():
    config.load_kube_config()
    create_namespace("edgecps")
    create_namespace("argo")

    command = "sudo ctr -n k8s.io image import edgecps.tar"
    subprocess.run(command, shell=True)
    print('wait for import edgecps image few second.....................')

    api_instance = client.CoreV1Api()
    mariadb_pv_obj = create_mariadb_persistent_volume_object()
    try:
        api_instance.create_persistent_volume(body=mariadb_pv_obj)
        print(f"PersistentVolume mariadb-pv-volume created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating PersistentVolume: {e}")

    api_instance = client.CoreV1Api()
    mariadb_pvc_obj = create_mariadb_persistent_volume_claim_object()
    try:
        api_instance.create_namespaced_persistent_volume_claim(
            namespace=NAMESPACE,
            body=mariadb_pvc_obj
        )
        print(f"PersistentVolumeClaim mariadb-pv-claim created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating PersistentVolumeClaim: {e}")

    api_instance = client.CoreV1Api()
    mariadb_config_map_obj = create_mariadb_config_map_object()
    try:
        api_instance.create_namespaced_config_map(
            body=mariadb_config_map_obj,
            namespace=NAMESPACE
        )
        print(f"ConfigMap mariadb-initdb-config created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating ConfigMap: {e}")

    api_instance = client.CoreV1Api()
    mariadb_secret_obj = mariadb_create_secret_object()
    try:
        api_instance.create_namespaced_secret(
            namespace=NAMESPACE,
            body=mariadb_secret_obj
        )
        print(f"Secret mariadb-secret created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating Secret: {e}")

    api_instance = client.CoreV1Api()
    service_obj = mariadb_create_service_object()
    try:
        api_instance.create_namespaced_service(
            namespace=NAMESPACE,
            body=service_obj
        )
        print(f"Service mariadb created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating Service: {e}")

    api_instance = client.AppsV1Api()
    mariadb_deployment_obj = create_mariadb_object()
    try:
        api_instance.create_namespaced_deployment(
            body=mariadb_deployment_obj,
            namespace=NAMESPACE
        )
        print(f"Deployment mariadb created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating deployment: {e}")

    api_instance = client.AppsV1Api()
    edgecps_deployment_obj = create_edgecps_deployment()
    try:
        api_instance.create_namespaced_deployment(body=edgecps_deployment_obj, namespace=NAMESPACE)
        print(f"Deployment {edgecps_deployment_obj.metadata.name} created successfully.")
    except ApiException as e:
        print(f"Exception when creating Deployment: {e}")

    api_instance = client.CoreV1Api()
    edgecps_service_obj = create_edgecps_service()
    try:
        api_instance.create_namespaced_service(
            namespace=NAMESPACE,
            body=edgecps_service_obj
        )
        print(f"Service mariadb created successfully.")
    except client.exceptions.ApiException as e:
        print(f"Exception when creating Service: {e}")

    ##########argo##########
    try:
        subprocess.run(["kubectl", "apply", "-f", "./argo.yaml", "-n", ARGO_NAMESPCAE], check=True)
        print(f"argo resource created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo yaml apply error: {e}")

    try:
        current_directory = os.path.dirname(os.path.realpath(__file__))
        env = Environment(loader=FileSystemLoader(searchpath=current_directory))
        template = env.get_template('argoserver.yaml')

        rendered_yaml = template.render(hostname = host_name)   
        parsed_yaml = yaml.safe_load(rendered_yaml)

        api_instance = client.AppsV1Api()
        api_instance.create_namespaced_deployment(body=parsed_yaml,namespace=ARGO_NAMESPCAE)
        print(f"Deployment argo server created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo server apply error: {e}")

    try:
        current_directory = os.path.dirname(os.path.realpath(__file__))
        env = Environment(loader=FileSystemLoader(searchpath=current_directory))
        template = env.get_template('argohttpbin.yaml')

        rendered_yaml = template.render(hostname = host_name)   
        parsed_yaml = yaml.safe_load(rendered_yaml)

        api_instance = client.AppsV1Api()
        api_instance.create_namespaced_deployment(body=parsed_yaml,namespace=ARGO_NAMESPCAE)
        print(f"Deployment argohttpbin created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo httpbin apply error: {e}")


    try:
        current_directory = os.path.dirname(os.path.realpath(__file__))
        env = Environment(loader=FileSystemLoader(searchpath=current_directory))
        template = env.get_template('argominio.yaml')

        rendered_yaml = template.render(hostname = host_name)   
        parsed_yaml = yaml.safe_load(rendered_yaml)

        api_instance = client.AppsV1Api()
        api_instance.create_namespaced_deployment(body=parsed_yaml,namespace=ARGO_NAMESPCAE)
        print(f"Deployment argominio created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo minio apply error: {e}")

    try:
        current_directory = os.path.dirname(os.path.realpath(__file__))
        env = Environment(loader=FileSystemLoader(searchpath=current_directory))
        template = env.get_template('argopostgres.yaml')

        rendered_yaml = template.render(hostname = host_name)   
        parsed_yaml = yaml.safe_load(rendered_yaml)

        api_instance = client.AppsV1Api()
        api_instance.create_namespaced_deployment(body=parsed_yaml,namespace=ARGO_NAMESPCAE)
        print(f"Deployment argo postgres created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo postgres apply error: {e}")

    try:
        current_directory = os.path.dirname(os.path.realpath(__file__))
        env = Environment(loader=FileSystemLoader(searchpath=current_directory))
        template = env.get_template('argoworkflowctr.yaml')

        rendered_yaml = template.render(hostname = host_name)   
        parsed_yaml = yaml.safe_load(rendered_yaml)

        api_instance = client.AppsV1Api()
        api_instance.create_namespaced_deployment(body=parsed_yaml,namespace=ARGO_NAMESPCAE)
        print(f"Deployment argo workflowctr created successfully.")
    except subprocess.CalledProcessError as e:
        print(f"argo workflowctr apply error: {e}")



if __name__ == "__main__":
    main()