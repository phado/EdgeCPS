import json
from collections import OrderedDict
import re
import xml.etree.ElementTree as ET

data = ET.fromstring("<mxGraphModel><root><mxCell id='0'/><mxCell id='1' parent='0'/><mxCell id='26' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='11' target='22'><mxGeometry relative='1' as='geometry'/></mxCell><object label='&lt;div style=&quot;font-weight: bold&quot;&gt;&amp;lt;&amp;lt;Container&amp;gt;&amp;gt;&lt;br&gt;[hello1]&lt;/div&gt;' command='cowsay' args='[&quot;{{inputs.parameters.message}}&quot;]' parameters='name: &quot;message&quot;       value: &quot;hello1&quot;' link='docker/whalesay' id='11'><mxCell style='rounded=1;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='190' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='18' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='15' target='11'><mxGeometry relative='1' as='geometry'/></mxCell><object label='' input='message' id='15'><mxCell style='rounded=0;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='80' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='17' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='16' target='15'><mxGeometry relative='1' as='geometry'/></mxCell><mxCell id='16' value='' style='ellipse;fillColor=#000000;shape=startState;strokeColor=none;' vertex='1' parent='1'><mxGeometry x='380' width='30' height='30' as='geometry'/></mxCell><mxCell id='28' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='19' target='23'><mxGeometry relative='1' as='geometry'/></mxCell><object label='&lt;div style=&quot;font-weight: bold&quot;&gt;&amp;lt;&amp;lt;Container&amp;gt;&amp;gt;&lt;br&gt;[hello2a]&lt;/div&gt;' command='cowsay' args='[&quot;{{inputs.parameters.message}}&quot;]' parameters='name: &quot;message&quot;       value: &quot;hello2a&quot;' link='docker/whalesay' id='19'><mxCell style='rounded=1;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='390' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='30' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;entryX=0.5;entryY=0;entryDx=0;entryDy=0;' edge='1' parent='1' source='20' target='24'><mxGeometry relative='1' as='geometry'/></mxCell><object label='&lt;div&gt;&amp;lt;&amp;lt;Container&amp;gt;&amp;gt;&lt;br&gt;[hello2b]&lt;/div&gt;' command='cowsay' args='[&quot;{{inputs.parameters.message}}&quot;]' parameters='name: &quot;message&quot;       value: &quot;hello2b&quot;' link='docker/whalesay' id='20'><mxCell style='rounded=1;whiteSpace=wrap;html=1;fontStyle=1' vertex='1' parent='1'><mxGeometry x='335' y='590' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='32' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='21' target='25'><mxGeometry relative='1' as='geometry'/></mxCell><object label='&lt;div style=&quot;font-weight: bold&quot;&gt;&amp;lt;&amp;lt;Container&amp;gt;&amp;gt;&lt;br&gt;[hello32b]&lt;/div&gt;' command='cowsay' args='[&quot;{{inputs.parameters.message}}&quot;]' parameters='name: &quot;message&quot;       value: &quot;hello32b&quot;' link='docker/whalesay' id='21'><mxCell style='rounded=1;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='790' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='27' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='22' target='19'><mxGeometry relative='1' as='geometry'/></mxCell><object label='' input='message' id='22'><mxCell style='rounded=0;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='290' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='29' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='23' target='20'><mxGeometry relative='1' as='geometry'/></mxCell><object label='' input='message' id='23'><mxCell style='rounded=0;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='490' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='31' style='edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;' edge='1' parent='1' source='24' target='21'><mxGeometry relative='1' as='geometry'/></mxCell><object label='' input='message' id='24'><mxCell style='rounded=0;whiteSpace=wrap;html=1;' vertex='1' parent='1'><mxGeometry x='335' y='690' width='120' height='60' as='geometry'/></mxCell></object><mxCell id='25' value='' style='ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;' vertex='1' parent='1'><mxGeometry x='380' y='920' width='30' height='30' as='geometry'/></mxCell></root></mxGraphModel>")

tree = ET.parse()
activity_full_name = "dd_5#act2"
project_name = activity_full_name.split('_')[0]
activity_name = activity_full_name.split('#')[1]
activity_id = activity_full_name.split('#')[0][-1]

flow_dict_value= data[activity_full_name+'_flowDict']
except_start_end= [value for key, value in flow_dict_value.items() if key not in [0000, 9999]]
# values = list(flow_dict_value.values())
set_values = first_values_set = set(x[0] for x in except_start_end) 
# step의 depth
depth = len(set_values)+1

# depth만큼 배열 초기화
templates = [['' for j in range(1)] for i in range(depth)]

xml_data = data[activity_full_name]
xml_data = re.sub(r'<mxGraphModel><root>', '', xml_data)
xml_data = re.sub(r'</root></mxGraphModel>', '', xml_data)
xml_data = xml_data.split('</mxCell>')


frame = OrderedDict()
workflow = OrderedDict()
spec = OrderedDict()

frame['namespace'] = 'argo'
frame['serverDryRun'] = 'false'
frame['workflow'] = workflow

workflow['apiVersion'] = 'argoproj.io/v1alpha1'
workflow['kind'] = 'Workflow'
workflow['metadata'] = {'name': activity_name}
workflow['spec'] = spec

spec['entrypoint'] = activity_name
spec['templates'] = templates


templates.append(data)



print(json.dumps(frame, ensure_ascii=False, indent="\t"))

with open('{filename}.json', 'w', encoding='utf=8') as make_file:
    json.dump(frame, make_file, ensure_ascii=False, indent='\t')