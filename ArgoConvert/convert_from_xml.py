import xml.etree.ElementTree as ET
import re
import xml.etree.ElementTree as ET
import json

# xml_string = """<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="26" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="11" target="22"><mxGeometry relative="1" as="geometry"/></mxCell>... (중략) ...<mxCell id="25" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="1"><mxGeometry x="380" y="920" width="30" height="30" as="geometry"/></mxCell></root></mxGraphModel>"""
# root = ET.fromstring(xml_string)
def insert_type_dict(key_id, param):
    """

    Args:
        key_id: 다이어그램 인텍스
        param:

    Returns:

    """




xml_file_path = '/home/minsoo/Documents/argotest/global.xml'  # XML 파일 경로
tree = ET.parse(xml_file_path)  # XML 파일 파싱
root = tree.getroot()  # XML 트리의 루트 요소 획득

print('적재 시작')
json_str = ''
# argo json의 베이스 포맷
json_base_template = {}
# 시작
start_point = ''
# 종료
end_point = ''
# 화살표
arrow_dict = {}
#병렬 실행
parallel_dict = {}
#조건문 수행
if_dict = {}
# 모든 id를 가진 obj의 박스 정보
type_dict = {}
# container
container_dict = {}
# Drawio container -> argo json 템플릿 container
json_containers_dict = {}
# Drawio container -> step dict
step_dict = {}
#input/output box
parameter_box = {}


for cell in root.iter('mxCell'):
    attributes = cell.attrib
    try:
        if 'shape=startState;' in attributes['style']:
            start_point = attributes
        if 'shape=endState;' in attributes['style']:
            end_point = attributes
        if 'edgeStyle=orthogonalEdgeStyle;' in attributes['style']:
            arrow_dict[attributes['source']] = attributes
        if 'html=1;points=[];perimeter=orthogonalPerimeter;fillColor=#000000' in attributes['style']:
            parallel_dict[attributes['id']] = attributes

    except:
        print(attributes)

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
            "name": "test_sample" #워크플로우 이름 들어가는 곳
        },
        "spec": {
            "entrypoint": "test_sample", # 엔트리포인트 고정으로 통일
            "templates": [
                {
                    "name": "test_sample",
                    "steps": [
                        #스텝 정보 들어가는 곳 // json_base_template['workflow']['spec']['templates'][0]['steps']
                    ]
                }
            ]
        }
    }
}
print('argo 제이슨 기본 완료')







print('컨테이터 템플릿 생성')

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
            "args":["{{inputs.parameters."+v['args']+"}}"]
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
                        "name": v['parameters'].split(' ')[1].replace('"', ''),
                        "value": v['parameters'].split('value: "')[1].strip(' "')
                    }
                ]
            }
        }
    ]
    step_dict[v['id']] = step
print('컨테이터 step 생성 완료')



"""
# argo json의 베이스 포맷
json_base_template = {}
# 시작
start_point = ''
# 종료
end_point = ''
# 화살표
arrow_dict = {}
# 모든 id를 가진 obj의 박스 정보
type_dict = {}
# container
container_dict = {}
# Drawio container -> argo json 템플릿 container
json_containers_dict = {}
# Drawio container -> step dict
step_dict = {}
#input/output box
parameter_box = {}
"""
step_start = start_point['id']
step_end = end_point['id']
step_json = {}


param_box = {} # 중요 필요한 input output 박스를 제이슨으로 만들기 위해 임시로 저장해 두는 곳

next_step_obj = None # 최초 시작
try:
    while True :

        if next_step_obj is None:
            next_step_obj = step_start
        else:
            next_step_obj = next_step
        # 계속해서 edgeCps xml의 다음 순서를 가져온다
        if next_step_obj == step_end:
            break
        selected_step, next_step = arrow_dict[next_step_obj]['source'],arrow_dict[next_step_obj]['target']


        # 해당 step의 obj가 container 인지 parameter box인지 병렬 등 기타 기능인지 확인한다.
        type_step = step_dict.get(next_step)
        type_param = parameter_box.get(next_step)
        type_flow = None # todo 병렬 조건문

        catch_error = 0 # 박스 혹은 화살표 정보가 없거나 중첩될때를 위해 확인  2가 되면 문제

        if type_flow is not None:
            catch_error += 1
            pass

        if type_param is not None:
            catch_error += 1
            param_box = type_param

        # type에 맞게 조건 진행
        if type_step is not None:
            catch_error += 1
            if param_box: # 직전에 있던 파라미터 박스 값 체크 있다면 추가해주고 없다면 pass
                param_box = {} # 마무리는 비워주기
            json_base_template['workflow']['spec']['templates'][0]['steps'].append(type_step)

        if catch_error == 2:
            print('파싱 다이어그램 중첩 Error')

except Exception as e :
    print(e)

finally:
    for k, v in json_containers_dict.items():
        json_base_template['workflow']['spec']['templates'].append(v)

    json_str = json.dumps(json_base_template)

print('done')