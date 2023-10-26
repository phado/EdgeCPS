let actionList = ['none', 'Container', 'Script', 'Resource', 'Sensor', 'Suspend', 'Operator']


// function createTypeSelectbox(){ // mxutil 에 넣어야함


//         var buttons = document.querySelectorAll('[title="Select Requirement Satisfaction"]');

//         buttons.forEach(function(button) {
//             var parent = button.parentElement;

//             var br = document.createElement('br');
//             parent.appendChild(br);

//             var selectBox = document.createElement('select');
//             selectBox.style.width = '202px';
//             selectBox.style.marginBottom = '2px';

//             var options = ['none', 'Container', 'Script', 'Resource', 'Sensor', 'Suspend', 'Operator'];

//             for (var i = 0; i < options.length; i++) {
//                 var option = document.createElement('option');
//                 option.value = options[i];
//                 option.text = options[i];
//                 selectBox.appendChild(option);
//             }

//             parent.appendChild(selectBox);
//         });
// }


//universalGraph.model.setValue(cell, 'kid'); 값을 변경 하는 방식
/**
 * var xmlKey = localStorage.getItem('nowWorkflow') // 필요하면 워크플로우 프로세스의 항목을 가져온다.
 * xml = localStorage.getItem(xmlKey);
 * let doc = mxUtils.parseXml(xml);
 * let codec = new mxCodec(doc);
 * let cell =  codec.decode(doc.documentElement, universalGraph.getModel()).cells[3];
 * universalGraph.model.setValue(cell, 'kid');
 *
 * 값 가져오는 방식
 * 문제는 실행시 클릭을 한번 해야만 데이터가 업데이트 된다. 왜그러지....
 *
 *
 * 이건 초기화 하는 과정(미 완벅)
 *
 * universalGraph.getChildVertices(universalGraph.getDefaultParent())
 *
 *
 * universalGraph.getModel().beginUpdate();
 * universalGraph.removeCells(universalGraph.getChildVertices(universalGraph.getDefaultParent()));
 * universalGraph.getModel().endUpdate();
 *
 *
 * universalGraph.getSelectionCells()
 *
 *
 *
 * xml = processGraphxml;
 * doc = mxUtils.parseXml(xml);
 * codec = new mxCodec(doc);
 * codec.decode(doc.documentElement, universalGraph.getModel()).cells
 *
 *
 * Object.values(graph.getModel().cells)
 */