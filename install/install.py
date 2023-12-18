from kubernetes import client, config
from kubernetes.client.rest import ApiException
import os
import subprocess
import yaml
import socket

NAMESPACE = 'edgecps'
ARGO_NAMESPCAE = 'argo'
user_name = os.getlogin()

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
            ]
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
            storage_class_name="mariadb-storage-class",
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
            storage_class_name="mariadb-storage-class",
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
                    ]
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
    print('wait for import edgecps image few second.....................T ^ T')

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

    try:
        subprocess.run(["kubectl", "apply", "-f", "./argo.yaml", "-n", ARGO_NAMESPCAE], check=True)
    except subprocess.CalledProcessError as e:
        print(f"argo YAML apply error: {e}")



if __name__ == "__main__":
    main()
