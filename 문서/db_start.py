import subprocess

yaml_files = ["pv.yaml", "pvc.yaml", "secret.yaml", "configmap.yaml", "service.yaml", "mariadb.yaml"]

cmd = f"kubectl create namespace edgecps2"
try:
    subprocess.run(cmd, shell=True, check=True)
    print(f"create namespace edgecps successfully.")
except subprocess.CalledProcessError as e:
    print(f"create namespace edgecps fail.: {e}")
    

for yaml_file in yaml_files:
    cmd = f"kubectl apply -f {yaml_file} -n edgecps"
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"Applied {yaml_file} successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error applying {yaml_file}: {e}")
