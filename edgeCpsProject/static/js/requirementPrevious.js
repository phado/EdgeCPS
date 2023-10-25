function subContent1(projectName){
    var xmlData = localStorage.getItem(projectName+'_requirementsProcessXml')
    var container = document.getElementById('graphContainer');
    var graph = new Graph(container);
    var doc = mxUtils.parseXml(xmlData);
    var codec = new mxCodec(doc);
    codec.decode(doc.documentElement, graph.getModel());
    // graph.addListener(mxEvent.CLICK, subContent1ClickHandler);
    // var svg = document.getElementsByTagName('svg');
    // svg.style.width = "70%";
    // graph.refresh();
}