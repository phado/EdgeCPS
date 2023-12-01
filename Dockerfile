
FROM python:3.8

WORKDIR /edgeCpsProject

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

RUN apt-get update
RUN apt install docker.io -y

CMD ["python", "edgeCpsProject/app.py"]