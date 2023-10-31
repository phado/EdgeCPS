import xml.etree.ElementTree as ET
import re
import xml.etree.ElementTree as ET

# xml_string = """<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="26" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="11" target="22"><mxGeometry relative="1" as="geometry"/></mxCell>... (중략) ...<mxCell id="25" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="1"><mxGeometry x="380" y="920" width="30" height="30" as="geometry"/></mxCell></root></mxGraphModel>"""
# root = ET.fromstring(xml_string)



xml_file_path = '/home/minsoo/Documents/diagram.xml'  # XML 파일 경로
tree = ET.parse(xml_file_path)  # XML 파일 파싱
root = tree.getroot()  # XML 트리의 루트 요소 획득

print('적재 시작')
# argo json의 베이스 포맷
json_base_template = {}
# 시작
start_point = ''
# 종료
end_point = ''
# 화살표
arrow_dict = {}
# container
container_dict = {}
#input/output box
parameter_box = {}
# step dict
step_dict = {}

for cell in root.iter('mxCell'):
    attributes = cell.attrib
    try:
        if 'shape=startState;' in attributes['style']:
            start_point = attributes
        if 'shape=endState;' in attributes['style']:
            end_point = attributes
        if 'edgeStyle=orthogonalEdgeStyle;' in attributes['style']:
            arrow_dict[attributes['source']] = attributes

    except:
        pass

for cell in root.iter('object'):
    attributes = cell.attrib
    print(cell.tag, cell.attrib)
    try:
        if 'Container' in attributes['label']:
            container_dict[attributes['id']] = attributes
        if'input' in attributes or 'output' in attributes:
            parameter_box[attributes['id']] = attributes

    except:
        pass
print('적재 완료')




print('argo 제이슨 기본 생성')
json_base_template = {
  "namespace": "argo",
  "serverDryRun": False,
    "workflow": {
        "metadata": {
            "name": "워크플로우이름" #워크플로우 이름 들어가는 곳
        },
        "spec": {
            "entrypoint": "EdgeCps_Argo", # 엔트리포인트 고정으로 통일
            "templates": [
                {
                    "name": "EdgeCps_Argo",
                    "steps": [
                        #스텝 정보 들어가는 곳 // json_base_template['workflow']['spec']['templates'][0]['steps']
                    ]
                },
                {
                    #컨테이너 들어가는 곳 //json_base_template['workflow']['spec']['templates'][1]
                }
            ]
        }
    }
}
print('argo 제이슨 기본 완료')







print('컨테이터 템플릿 생성')
json_containers_dict = {}
for k,v in container_dict.items():
    json_template = {
        "name": re.search(r'\[(.*?)\]', v['label'])[1],
        "inputs": {
            "parameters": [
                {
                    "name": v['parameters'].split(' ')[1].replace('"', '')
                }
            ]
        },
        "container": {
            "image": v['link'],
            "command": [v['command']],
            "args":'["{{inputs.parameters.'+v['args']+'}}"]'
        }
    }
    json_containers_dict[json_template['name']] = json_template

print('컨테이터 템플릿 완료')


print('컨테이터 step 생성')
for k,v in container_dict.items():

    step = [
        {
            "name": re.search(r'\[(.*?)\]', v['label'])[1],
            "template": re.search(r'\[(.*?)\]', v['label'])[1],
            "arguments": {
                "parameters": [
                    {
                        "name": "message",
                        "value": v['parameters'].split('value: "')[1].strip(' "')
                    }
                ]
            }
        }
    ]
    step_dict[v['id']] = step
print('컨테이터 step 생성 완료')


# for cell in root.iter('mxCell'):
#     attributes = cell.attrib
#     try:
#         print(cell.tag, cell.attrib)  # 요소 이름과 속성 출력
#     except:
#         pass
# name = re.search(r'\[(.*?)\]', attributes['label']) 컨테이너 이름 찾기
