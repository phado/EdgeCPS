import xml.etree.ElementTree as ET
import re
import xml.etree.ElementTree as ET
import json
import ast

# xml_string = """<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="26" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="11" target="22"><mxGeometry relative="1" as="geometry"/></mxCell>... (중략) ...<mxCell id="25" value="" style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;" vertex="1" parent="1"><mxGeometry x="380" y="920" width="30" height="30" as="geometry"/></mxCell></root></mxGraphModel>"""
# root = ET.fromstring(xml_string)
def insert_type_dict(key_id, param):
    """

    Args:
        key_id: 다이어그램 인텍스
        param:

    Returns:

    """

def temp_container_output(param_str, type):
    input_str = param_str

    if type == 'p':
        # 문자열을 줄바꿈과 탭 문자를 기준으로 분할
        parts = input_str.split('\n')

        # 각 파트를 처리하여 딕셔너리로 변환
        result_dict = {}
        for part in parts:
            if part.strip():  # 빈 문자열이 아닌 경우에만 처리
                key, value = map(str.strip, part.split(':'))
                if '.' in key:
                    nested_keys = key.split('.')
                    nested_dict = result_dict
                    for nested_key in nested_keys[:-1]:
                        nested_dict = nested_dict.setdefault(nested_key, {})
                    nested_dict[nested_keys[-1]] = value.strip('"')
                else:
                    result_dict[key] = value.strip('"')

        return result_dict

    if type == 'a':
        # 문자열을 줄바꿈과 탭 문자를 기준으로 분할
        parts = input_str.split('\n\t\t\t\t\t\t\t\t\t\t\t')

        # 결과 딕셔너리
        result_dict = {}

        for part in parts:
            if part.strip():  # 빈 문자열이 아닌 경우에만 처리
                key, value = map(str.strip, part.split(':'))
                result_dict[key] = value

        # 결과 딕셔너리에서 불필요한 문자 제거
        result_dict = {key.strip(): value.strip() for key, value in result_dict.items()}

        # path 키에 대한 처리
        if 'path' in result_dict:
            result_dict['path'] = result_dict['path'].strip('"')

        # 최종적으로 원하는 형태로 딕셔너리 구성
        result_dict = {
            "name": result_dict["name"].strip('"'),
            "path": result_dict.get("path", "")
        }
        return result_dict

def temp_container_input(param_str, type):
    input_str = param_str

    if type == 'p':

        # 문자열을 줄바꿈으로 나누고 공백과 탭 문자를 제거
        lines = [line.replace('\t', '').strip() for line in input_str.split('\n')]

        # 결과 딕셔너리
        result_dict = {}

        for line in lines:
            if line:  # 빈 문자열이 아닌 경우에만 처리
                key, value = map(str.strip, line.split(':'))
                result_dict[key] = value.strip('"')

        # 최종적으로 원하는 형태로 딕셔너리 구성
        result_dict = {key: value for key, value in result_dict.items()}
        return result_dict

    if type == 'a':
        # 문자열을 줄바꿈으로 나누고 공백과 탭 문자를 제거
        lines = [line.replace('\t', '').strip() for line in input_str.split('\n')]

        # 결과 딕셔너리
        result_dict = {}

        for line in lines:
            if line:  # 빈 문자열이 아닌 경우에만 처리
                key, value = map(str.strip, line.split(':'))
                result_dict[key] = value.strip('"')

        # 최종적으로 원하는 형태로 딕셔너리 구성
        result_dict = {key: value for key, value in result_dict.items()}
        return result_dict

        return result_dict

def get_step_arguments(param_str):
    lines = param_str.split('\n')
    # 각 줄에서 키와 값을 추출하여 딕셔너리 생성
    result_dict = {}
    for line in lines:
        parts = line.split(':')
        if len(parts) == 2:
            key = parts[0].strip(' "\t')
            value = parts[1].strip(' "\t')
            result_dict[key] = value
    return result_dict

xml_file_path = '/Users/jangminsu/PycharmProjects/EdgeCPS/ArgoConvert/argotest/global.xml'  # XML 파일 경로
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
# 화살표 출발지점_목표 지점
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

temp_parallel_cnt = 1
for cell in root.iter('mxCell'):
    attributes = cell.attrib
    try:

        if 'shape=startState;' in attributes['style']:
            start_point = attributes
        if 'shape=endState;' in attributes['style']:
            end_point = attributes
        if 'edgeStyle=orthogonalEdgeStyle;' in attributes['style']:
            key_value = attributes['source']
            if key_value in arrow_dict:
                key_value = key_value + '_' + str(temp_parallel_cnt)
                temp_parallel_cnt += 1
                arrow_dict[key_value] = attributes
            else:
                arrow_dict[key_value] = attributes
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
        if'arguments.parameters' in attributes or 'arguments.artifacts' in attributes:
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
            "name": "test-sample" #워크플로우 이름 들어가는 곳
        },
        "spec": {
            "entrypoint": "test-sample", # 엔트리포인트 고정으로 통일
            "templates": [
                {
                    "name": "test-sample",
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
    json_template = {"name": re.search(r'\[(.*?)\]', v['label'])[1], 'inputs': {}, 'outputs': {}}
    globalName = {"name": re.search(r'\[(.*?)\]', v['label'])[1]}
    try:
        if 'inputs.parameters' in v:  # inputs parameters
            temp_input_param = temp_container_input(v['inputs.parameters'], type='p')
            temp_inputs_parameters = {'inputs': {"parameters": []}}

            temp_inputs_parameters['inputs']['parameters'] = temp_input_param
            json_template['inputs']['parameters'] = temp_input_param

        if 'inputs.artifacts' in v:  # inputs artifacts
            temp_input_arti = temp_container_input(v['inputs.artifacts'], type='a')
            temp_inputs_artifacts = {'inputs': {"artifacts": []}}

            temp_inputs_artifacts['inputs']['artifacts'] = temp_input_arti
            json_template['inputs']['artifacts'] = temp_input_arti

    except Exception as e:
        print("컨테이너 input 파싱에러 : ", e)

    if '&lt;&lt;Container&gt;&gt' in v['label']:  # Container
        try:
            temp_container = {'container': {}}
            if 'link' in v:
                temp_container['container']['image'] = v['link']

            if 'command' in v:
                temp_container['container']['command'] = ast.literal_eval(v['command'])

            if 'args' in v:
                temp_container['container']['args'] = ast.literal_eval(v['args'])

            json_template['container'] = temp_container['container']

        except Exception as e:
            print("컨테이너 파싱에러 : ", e)

    try:
        if 'outputs.parameters' in v:  # outputs parameters
            temp_out_param = temp_container_output(v['outputs.parameters'], type='p')
            temp_outputs_parameters = {'outputs': {'parameters': []}}
            temp_out_param['globalName'] = temp_out_param['name']

            temp_outputs_parameters['outputs']['parameters'] = [temp_out_param]
            json_template['outputs']['parameters'] = [temp_out_param]

        if 'outputs.artifacts' in v:  # outputs artifacts
            temp_out_arti = temp_container_output(v['outputs.artifacts'], type='a')
            temp_outputs_artifacts = {'outputs': {'artifacts': []}}
            temp_out_arti['globalName'] = temp_out_arti['name']

            temp_outputs_artifacts['outputs']['artifacts'] = [temp_out_arti]
            json_template['outputs']['artifacts'] = [temp_out_arti]

    except Exception as e:
        print("컨테이너 output 파싱에러 : ", e)

    json_containers_dict[json_template['name']] = json_template

print('컨테이터 템플릿 완료')


print('컨테이터 step 생성')
for k,v in container_dict.items():

    step = [
        {
            "name": re.search(r'\[(.*?)\]', v['label'])[1],
            "template": re.search(r'\[(.*?)\]', v['label'])[1],
            # "arguments": {
            #     "parameters": [
            #         {
            #             "name": v['parameters'].split(' ')[1].replace('"', ''),
            #             "value": v['parameters'].split('value: "')[1].strip(' "')
            #         }
            #     ]
            # }
        }
    ]
    step_dict[v['id']] = step
print('컨테이터 step 생성 완료')



"""
json_str = ''
# argo json의 베이스 포맷
json_base_template = {}
# 시작
start_point = ''
# 종료
end_point = ''
# 화살표 출발지점_목표 지점
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
"""

step_start = start_point['id']
step_end = end_point['id']
step_json = {}


param_box = {}  # 중요 필요한 input output 박스를 제이슨으로 만들기 위해 임시로 저장해 두는 곳

next_step_obj = None  # 최초 시작
end_parallel_point = None
try:
    while True:

        if next_step_obj is None:
            next_step_obj = step_start
        else:
            next_step_obj = next_step
        # 계속해서 edgeCps xml의 다음 순서를 가져온다
        if next_step_obj == step_end:
            break

        selected_step, next_step = arrow_dict[next_step_obj]['source'],arrow_dict[next_step_obj]['target']

        if next_step in parallel_dict:  # 병렬
            if end_parallel_point == next_step:
                continue
            parallel_step_json = [] # 병렬 전체 프로세스를 담는 최종 본
            type_flow = [] # 병렬이 몇개든 임시 저장하는 곳
            type_flow_json = None  # 제이슨 파싱 완료된것 임시로 저장하는 곳
            sorted_keys = sorted(arrow_dict.keys())
            parallel_keys = [key for key in sorted_keys if key.startswith(next_step)]
            for k in parallel_keys:
                parallel_next_step = arrow_dict[k]['target']

                type_step = step_dict.get(parallel_next_step)
                type_param = parameter_box.get(parallel_next_step)

                # 파라미터 박스가 있다면
                if type_param is not None:
                    type_flow = {'arguments': {}}

                    if 'arguments.parameters' in type_param: # 파라미터
                        parallel_arg_dict = get_step_arguments(type_param['arguments.parameters'])
                        type_flow['arguments']['parameters'] = [parallel_arg_dict]

                    if 'arguments.artifacts' in type_param:  # 아티펙트
                        parallel_arg_dict = get_step_arguments(type_param['arguments.artifacts'])
                        type_flow['arguments']['artifacts'] = [parallel_arg_dict]

                    parallel_next_step = arrow_dict[parallel_next_step]['target']

                    type_flow_json = step_dict.get(parallel_next_step)[0]
                    type_flow_json['arguments'] = type_flow['arguments']
                    parallel_step_json.append(type_flow_json)

                if type_step is not None:
                    parallel_step_json.append(type_param)

            parallel_end = None
            for k in parallel_keys:  # 병렬 종료 확인
                temp_num = None
                parallel_next_step = arrow_dict[k]['target']

                type_step = step_dict.get(parallel_next_step)
                type_param = parameter_box.get(parallel_next_step)

                if type_step is not None:
                    temp_num = arrow_dict[parallel_next_step]['target']

                if type_param is not None:
                    parallel_next_step = arrow_dict[parallel_next_step]['target']
                    temp_num = arrow_dict[parallel_next_step]['target']

                if parallel_end is not None and parallel_end != temp_num :
                    print('parallel 파싱오류')

                parallel_end = temp_num
                end_parallel_point = parallel_end

            json_base_template['workflow']['spec']['templates'][0]['steps'].append(parallel_step_json)
            next_step = end_parallel_point
        else:
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

except Exception as e:
    print(e)

finally:
    for k, v in json_containers_dict.items():
        json_base_template['workflow']['spec']['templates'].append(v)

    json_str = json.dumps(json_base_template)

print('done')