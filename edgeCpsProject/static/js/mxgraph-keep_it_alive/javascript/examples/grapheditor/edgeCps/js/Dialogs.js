/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs a new open dialog.
 */

/**
 *  생성된 오브젝트의 edit의 값을 가져오는 민수 이사필요
 *
 */
function searchDockerImage(){
    var searchInput = document.querySelector('.keyword'); // 검색 입력 필드의 클래스 이름에 맞게 선택자 설정
    var inputValue = searchInput.value;

    var selectBox = document.querySelector('.searchType');
    var selectedValue = selectBox.value;
	let url = ''

	if (selectedValue == 'docker'){
		url = '/search'
	}else {
		url = '/localsearch'
	}

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputValue, selectedValue }),
    })
    .then(response => response.json())
    .then(data => {

        var dockerSearchResult = document.querySelector('.dockerSearchResult');

        var selectBox = document.createElement('select');
		selectBox.multiple = true;
        selectBox.className = 'docker-select-box';
		selectBox.style.width = '540px';
		selectBox.style.height = '200px'
		selectBox.style.borderRadius = '10px';
		
        data.images.forEach(function(image) {
            var option = document.createElement('option');
            option.value = image;
            option.text = image;
			option.style.paddingLeft = "8px";
            selectBox.appendChild(option);
        });

        // 이미 동일한 클래스를 가진 select box가 있으면 제거
        var existingSelectBox = dockerSearchResult.querySelector('.docker-select-box');
        if (existingSelectBox) {
            dockerSearchResult.removeChild(existingSelectBox);
        }

        dockerSearchResult.appendChild(selectBox);

        selectBox.addEventListener('change', function() {
            var selectedImage = selectBox.value;
            var dockerLinkInput = document.querySelector('.dockerLink');
            dockerLinkInput.value = selectedImage;
        });
    })
    .catch(error => {
        alert('검색 실패',);
    });
}
function getObjectPropertyValue(input,id, mxObjId) {
	let htmlTag = input.outerHTML;

	let tempElement = document.createElement('div');
	tempElement.innerHTML = htmlTag;

	let attributes = tempElement.firstChild.attributes;

	let desiredAttributes = [];
	for (let i = 0; i < attributes.length; i++) {
	let attribute = attributes[i];
	if (attribute.name !== 'label') {
		desiredAttributes.push(attribute.name + '="' + attribute.value + '"');
	}
	}
	objValueDict[id +'_'+ mxObjId] = desiredAttributes
	// console.log(desiredAttributes); // 민수 edit property값 출력
	// console.log(objValueDict)
	// return desiredAttributes
}

var OpenDialog = function()
{
	var iframe = document.createElement('iframe');
	iframe.style.backgroundColor = 'transparent';
	iframe.allowTransparency = 'true';
	iframe.style.borderStyle = 'none';
	iframe.style.borderWidth = '0px';
	iframe.style.overflow = 'hidden';
	iframe.frameBorder = '0';
	
	// Adds padding as a workaround for box model in older IE versions
	var dx = (mxClient.IS_VML && (document.documentMode == null || document.documentMode < 8)) ? 20 : 0;
	
	iframe.setAttribute('width', (((Editor.useLocalStorage) ? 640 : 320) + dx) + 'px');
	iframe.setAttribute('height', (((Editor.useLocalStorage) ? 480 : 220) + dx) + 'px');
	iframe.setAttribute('src', OPEN_FORM);
	
	this.container = iframe;
};

/**
 * Constructs a new color dialog.
 */
var ColorDialog = function(editorUi, color, apply, cancelFn)
{
	this.editorUi = editorUi;
	
	var input = document.createElement('input');
	input.style.marginBottom = '10px';
	input.style.width = '216px';
	
	// Required for picker to render in IE
	if (mxClient.IS_IE)
	{
		input.style.marginTop = '10px';
		document.body.appendChild(input);
	}
	
	var applyFunction = (apply != null) ? apply : this.createApplyFunction();
	
	function doApply()
	{
		var color = input.value;
		
		// Blocks any non-alphabetic chars in colors
		if (/(^#?[a-zA-Z0-9]*$)/.test(color))
		{
			if (color != 'none' && color.charAt(0) != '#')
			{
				color = '#' + color;
			}

			ColorDialog.addRecentColor((color != 'none') ? color.substring(1) : color, 12);
			applyFunction(color);
			editorUi.hideDialog();
		}
		else
		{
			editorUi.handleError({message: mxResources.get('invalidInput')});	
		}
	};
	
	this.init = function()
	{
		if (!mxClient.IS_TOUCH)
		{
			input.focus();
		}
	};

	var picker = new mxJSColor.color(input);
	picker.pickerOnfocus = false;
	picker.showPicker();

	var div = document.createElement('div');
	mxJSColor.picker.box.style.position = 'relative';
	mxJSColor.picker.box.style.width = '230px';
	mxJSColor.picker.box.style.height = '100px';
	mxJSColor.picker.box.style.paddingBottom = '10px';
	div.appendChild(mxJSColor.picker.box);

	var center = document.createElement('center');
	
	function createRecentColorTable()
	{
		var table = addPresets((ColorDialog.recentColors.length == 0) ? ['FFFFFF'] :
					ColorDialog.recentColors, 11, 'FFFFFF', true);
		table.style.marginBottom = '8px';
		
		return table;
	};
	
	function addPresets(presets, rowLength, defaultColor, addResetOption)
	{
		rowLength = (rowLength != null) ? rowLength : 12;
		var table = document.createElement('table');
		table.style.borderCollapse = 'collapse';
		table.setAttribute('cellspacing', '0');
		table.style.marginBottom = '20px';
		table.style.cellSpacing = '0px';
		var tbody = document.createElement('tbody');
		table.appendChild(tbody);

		var rows = presets.length / rowLength;
		
		for (var row = 0; row < rows; row++)
		{
			var tr = document.createElement('tr');
			
			for (var i = 0; i < rowLength; i++)
			{
				(function(clr)
				{
					var td = document.createElement('td');
					td.style.border = '1px solid black';
					td.style.padding = '0px';
					td.style.width = '16px';
					td.style.height = '16px';
					
					if (clr == null)
					{
						clr = defaultColor;
					}
					
					if (clr == 'none')
					{
						td.style.background = 'url(\'' + Dialog.prototype.noColorImage + '\')';
					}
					else
					{
						td.style.backgroundColor = '#' + clr;
					}
					
					tr.appendChild(td);

					if (clr != null)
					{
						td.style.cursor = 'pointer';
						
						mxEvent.addListener(td, 'click', function()
						{
							if (clr == 'none')
							{
								picker.fromString('ffffff');
								input.value = 'none';
							}
							else
							{
								picker.fromString(clr);
							}
						});
						
						mxEvent.addListener(td, 'dblclick', doApply);
					}
				})(presets[row * rowLength + i]);
			}
			
			tbody.appendChild(tr);
		}
		
		if (addResetOption)
		{
			var td = document.createElement('td');
			td.setAttribute('title', mxResources.get('reset'));
			td.style.border = '1px solid black';
			td.style.padding = '0px';
			td.style.width = '16px';
			td.style.height = '16px';
			td.style.backgroundImage = 'url(\'' + Dialog.prototype.closeImage + '\')';
			td.style.backgroundPosition = 'center center';
			td.style.backgroundRepeat = 'no-repeat';
			td.style.cursor = 'pointer';
			
			tr.appendChild(td);

			mxEvent.addListener(td, 'click', function()
			{
				ColorDialog.resetRecentColors();
				table.parentNode.replaceChild(createRecentColorTable(), table);
			});
		}
		
		center.appendChild(table);
		
		return table;
	};

	div.appendChild(input);
	mxUtils.br(div);
	
	// Adds recent colors
	createRecentColorTable();
		
	// Adds presets
	var table = addPresets(this.presetColors);
	table.style.marginBottom = '8px';
	table = addPresets(this.defaultColors);
	table.style.marginBottom = '16px';

	div.appendChild(center);

	var buttons = document.createElement('div');
	buttons.style.textAlign = 'right';
	buttons.style.whiteSpace = 'nowrap';
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';

	if (editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	var applyBtn = mxUtils.button(mxResources.get('apply'), doApply);
	applyBtn.className = 'geBtn gePrimaryBtn';
	buttons.appendChild(applyBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		buttons.appendChild(cancelBtn);
	}
	
	if (color != null)
	{
		if (color == 'none')
		{
			picker.fromString('ffffff');
			input.value = 'none';
		}
		else
		{
			picker.fromString(color);
		}
	}
	
	div.appendChild(buttons);
	this.picker = picker;
	this.colorInput = input;

	// LATER: Only fires if input if focused, should always
	// fire if this dialog is showing.
	mxEvent.addListener(div, 'keydown', function(e)
	{
		if (e.keyCode == 27)
		{
			editorUi.hideDialog();
			
			if (cancelFn != null)
			{
				cancelFn();
			}
			
			mxEvent.consume(e);
		}
	});
	
	this.container = div;
};

/**
 * Creates function to apply value
 */
ColorDialog.prototype.presetColors = ['E6D0DE', 'CDA2BE', 'B5739D', 'E1D5E7', 'C3ABD0', 'A680B8', 'D4E1F5', 'A9C4EB', '7EA6E0', 'D5E8D4', '9AC7BF', '67AB9F', 'D5E8D4', 'B9E0A5', '97D077', 'FFF2CC', 'FFE599', 'FFD966', 'FFF4C3', 'FFCE9F', 'FFB570', 'F8CECC', 'F19C99', 'EA6B66']; 

/**
 * Creates function to apply value
 */
ColorDialog.prototype.defaultColors = ['none', 'FFFFFF', 'E6E6E6', 'CCCCCC', 'B3B3B3', '999999', '808080', '666666', '4D4D4D', '333333', '1A1A1A', '000000', 'FFCCCC', 'FFE6CC', 'FFFFCC', 'E6FFCC', 'CCFFCC', 'CCFFE6', 'CCFFFF', 'CCE5FF', 'CCCCFF', 'E5CCFF', 'FFCCFF', 'FFCCE6',
		'FF9999', 'FFCC99', 'FFFF99', 'CCFF99', '99FF99', '99FFCC', '99FFFF', '99CCFF', '9999FF', 'CC99FF', 'FF99FF', 'FF99CC', 'FF6666', 'FFB366', 'FFFF66', 'B3FF66', '66FF66', '66FFB3', '66FFFF', '66B2FF', '6666FF', 'B266FF', 'FF66FF', 'FF66B3', 'FF3333', 'FF9933', 'FFFF33',
		'99FF33', '33FF33', '33FF99', '33FFFF', '3399FF', '3333FF', '9933FF', 'FF33FF', 'FF3399', 'FF0000', 'FF8000', 'FFFF00', '80FF00', '00FF00', '00FF80', '00FFFF', '007FFF', '0000FF', '7F00FF', 'FF00FF', 'FF0080', 'CC0000', 'CC6600', 'CCCC00', '66CC00', '00CC00', '00CC66',
		'00CCCC', '0066CC', '0000CC', '6600CC', 'CC00CC', 'CC0066', '990000', '994C00', '999900', '4D9900', '009900', '00994D', '009999', '004C99', '000099', '4C0099', '990099', '99004D', '660000', '663300', '666600', '336600', '006600', '006633', '006666', '003366', '000066',
		'330066', '660066', '660033', '330000', '331A00', '333300', '1A3300', '003300', '00331A', '003333', '001933', '000033', '190033', '330033', '33001A'];

/**
 * Creates function to apply value
 */
ColorDialog.prototype.createApplyFunction = function()
{
	return mxUtils.bind(this, function(color)
	{
		var graph = this.editorUi.editor.graph;
		
		graph.getModel().beginUpdate();
		try
		{
			graph.setCellStyles(this.currentColorKey, color);
			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [this.currentColorKey],
				'values', [color], 'cells', graph.getSelectionCells()));
		}
		finally
		{
			graph.getModel().endUpdate();
		}
	});
};

/**
 * 
 */
ColorDialog.recentColors = [];

/**
 * Adds recent color for later use.
 */
ColorDialog.addRecentColor = function(color, max)
{
	if (color != null)
	{
		mxUtils.remove(color, ColorDialog.recentColors);
		ColorDialog.recentColors.splice(0, 0, color);
		
		if (ColorDialog.recentColors.length >= max)
		{
			ColorDialog.recentColors.pop();
		}
	}
};

/**
 * Adds recent color for later use.
 */
ColorDialog.resetRecentColors = function()
{
	ColorDialog.recentColors = [];
};

/**
 * Constructs a new about dialog.
 */
var AboutDialog = function(editorUi)
{
	var div = document.createElement('div');
	div.setAttribute('align', 'center');
	var h3 = document.createElement('h3');
	mxUtils.write(h3, mxResources.get('about') + ' GraphEditor');
	div.appendChild(h3);
	var img = document.createElement('img');
	img.style.border = '0px';
	img.setAttribute('width', '176');
	img.setAttribute('width', '151');
	img.setAttribute('src', IMAGE_PATH + '/logo.png');
	div.appendChild(img);
	mxUtils.br(div);
	mxUtils.write(div, 'Powered by mxGraph ' + mxClient.VERSION);
	mxUtils.br(div);
	var link = document.createElement('a');
	link.setAttribute('href', 'http://www.jgraph.com/');
	link.setAttribute('target', '_blank');
	mxUtils.write(link, 'www.jgraph.com');
	div.appendChild(link);
	mxUtils.br(div);
	mxUtils.br(div);
	var closeBtn = mxUtils.button(mxResources.get('close'), function()
	{
		editorUi.hideDialog();
	});
	closeBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(closeBtn);
	
	this.container = div;
};

/**
 * Constructs a new textarea dialog.
 */
var TextareaDialog = function(editorUi, title, url, fn, cancelFn, cancelTitle, w, h,
	addButtons, noHide, noWrap, applyTitle, helpLink, customButtons)
{
	w = (w != null) ? w : 300;
	h = (h != null) ? h : 120;
	noHide = (noHide != null) ? noHide : false;
	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	td.style.width = '100px';
	mxUtils.write(td, title);
	
	row.appendChild(td);
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');

	var nameInput = document.createElement('textarea');
	
	if (noWrap)
	{
		nameInput.setAttribute('wrap', 'off');
	}
	
	nameInput.setAttribute('spellcheck', 'false');
	nameInput.setAttribute('autocorrect', 'off');
	nameInput.setAttribute('autocomplete', 'off');
	nameInput.setAttribute('autocapitalize', 'off');
	
	mxUtils.write(nameInput, url || '');
	nameInput.style.resize = 'none';
	nameInput.style.width = w + 'px';
	nameInput.style.height = h + 'px';
	
	this.textarea = nameInput;

	this.init = function()
	{
		nameInput.focus();
		nameInput.scrollTop = 0;
	};

	td.appendChild(nameInput);
	row.appendChild(td);
	
	tbody.appendChild(row);

	row = document.createElement('tr');
	td = document.createElement('td');
	td.style.paddingTop = '14px';
	td.style.whiteSpace = 'nowrap';
	td.setAttribute('align', 'right');
	
	if (helpLink != null)
	{
		var helpBtn = mxUtils.button(mxResources.get('help'), function()
		{
			editorUi.editor.graph.openLink(helpLink);
		});
		helpBtn.className = 'geBtn';
		
		td.appendChild(helpBtn);
	}
	
	if (customButtons != null)
	{
		for (var i = 0; i < customButtons.length; i++)
		{
			(function(label, fn)
			{
				var customBtn = mxUtils.button(label, function(e)
				{
					fn(e, nameInput);
				});
				customBtn.className = 'geBtn';
				
				td.appendChild(customBtn);
			})(customButtons[i][0], customButtons[i][1]);
		}
	}
	
	var cancelBtn = mxUtils.button(cancelTitle || mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
		
		if (cancelFn != null)
		{
			cancelFn();
		}
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}
	
	if (addButtons != null)
	{
		addButtons(td, nameInput);
	}
	
	if (fn != null)
	{
		var genericBtn = mxUtils.button(applyTitle || mxResources.get('apply'), function()
		{
			if (!noHide)
			{
				editorUi.hideDialog();
			}
			
			fn(nameInput.value);
		});
		
		genericBtn.className = 'geBtn gePrimaryBtn';	
		td.appendChild(genericBtn);
	}
	
	if (!editorUi.editor.cancelFirst)
	{
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	this.container = table;
};

/**
 * Constructs a new edit file dialog.
 */
var EditDiagramDialog = function(editorUi)
{
	var div = document.createElement('div');
	div.style.textAlign = 'right';
	var textarea = document.createElement('textarea');
	textarea.setAttribute('wrap', 'off');
	textarea.setAttribute('spellcheck', 'false');
	textarea.setAttribute('autocorrect', 'off');
	textarea.setAttribute('autocomplete', 'off');
	textarea.setAttribute('autocapitalize', 'off');
	textarea.style.overflow = 'auto';
	textarea.style.resize = 'none';
	textarea.style.width = '600px';
	textarea.style.height = '360px';
	textarea.style.marginBottom = '16px';
	
	textarea.value = mxUtils.getPrettyXml(editorUi.editor.getGraphXml());
	div.appendChild(textarea);
	
	this.init = function()
	{
		textarea.focus();
	};
	
	// Enables dropping files
	if (Graph.fileSupport)
	{
		function handleDrop(evt)
		{
		    evt.stopPropagation();
		    evt.preventDefault();
		    
		    if (evt.dataTransfer.files.length > 0)
		    {
    			var file = evt.dataTransfer.files[0];
    			var reader = new FileReader();
				
				reader.onload = function(e)
				{
					textarea.value = e.target.result;
				};
				
				reader.readAsText(file);
    		}
		    else
		    {
		    	textarea.value = editorUi.extractGraphModelFromEvent(evt);
		    }
		};
		
		function handleDragOver(evt)
		{
			evt.stopPropagation();
			evt.preventDefault();
		};

		// Setup the dnd listeners.
		textarea.addEventListener('dragover', handleDragOver, false);
		textarea.addEventListener('drop', handleDrop, false);
	}
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}
	
	var select = document.createElement('select');
	select.style.width = '180px';
	select.className = 'geBtn';

	if (editorUi.editor.graph.isEnabled())
	{
		var replaceOption = document.createElement('option');
		replaceOption.setAttribute('value', 'replace');
		mxUtils.write(replaceOption, mxResources.get('replaceExistingDrawing'));
		select.appendChild(replaceOption);
	}

	var newOption = document.createElement('option');
	newOption.setAttribute('value', 'new');
	mxUtils.write(newOption, mxResources.get('openInNewWindow'));
	
	if (EditDiagramDialog.showNewWindowOption)
	{
		select.appendChild(newOption);
	}

	if (editorUi.editor.graph.isEnabled())
	{
		var importOption = document.createElement('option');
		importOption.setAttribute('value', 'import');
		mxUtils.write(importOption, mxResources.get('addToExistingDrawing'));
		select.appendChild(importOption);
	}

	div.appendChild(select);

	var okBtn = mxUtils.button(mxResources.get('ok'), function()
	{
		// Removes all illegal control characters before parsing
		var data = Graph.zapGremlins(mxUtils.trim(textarea.value));
		var error = null;
		
		if (select.value == 'new')
		{
			editorUi.hideDialog();
			editorUi.editor.editAsNew(data);
		}
		else if (select.value == 'replace')
		{
			editorUi.editor.graph.model.beginUpdate();
			try
			{
				editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
				// LATER: Why is hideDialog between begin-/endUpdate faster?
				editorUi.hideDialog();
			}
			catch (e)
			{
				error = e;
			}
			finally
			{
				editorUi.editor.graph.model.endUpdate();				
			}
		}
		else if (select.value == 'import')
		{
			editorUi.editor.graph.model.beginUpdate();
			try
			{
				var doc = mxUtils.parseXml(data);
				var model = new mxGraphModel();
				var codec = new mxCodec(doc);
				codec.decode(doc.documentElement, model);
				
				var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
				editorUi.editor.graph.setSelectionCells(editorUi.editor.graph.importCells(children));
				
				// LATER: Why is hideDialog between begin-/endUpdate faster?
				editorUi.hideDialog();
			}
			catch (e)
			{
				error = e;
			}
			finally
			{
				editorUi.editor.graph.model.endUpdate();				
			}
		}
			
		if (error != null)
		{
			mxUtils.alert(error.message);
		}
	});
	okBtn.className = 'geBtn gePrimaryBtn';
	div.appendChild(okBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		div.appendChild(cancelBtn);
	}

	this.container = div;
};

/**
 * 
 */
EditDiagramDialog.showNewWindowOption = true;

/**
 * Constructs a new export dialog.
 */
var ExportDialog = function(editorUi)
{
	var graph = editorUi.editor.graph;
	var bounds = graph.getGraphBounds();
	var scale = graph.view.scale;
	
	var width = Math.ceil(bounds.width / scale);
	var height = Math.ceil(bounds.height / scale);

	var row, td;
	
	var table = document.createElement('table');
	var tbody = document.createElement('tbody');
	table.setAttribute('cellpadding', (mxClient.IS_SF) ? '0' : '2');
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	td.style.width = '100px';
	mxUtils.write(td, mxResources.get('filename') + ':');
	
	row.appendChild(td);
	
	var nameInput = document.createElement('input');
	nameInput.setAttribute('value', editorUi.editor.getOrCreateFilename());
	nameInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(nameInput);
	row.appendChild(td);
	
	tbody.appendChild(row);
		
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('format') + ':');
	
	row.appendChild(td);
	
	var imageFormatSelect = document.createElement('select');
	imageFormatSelect.style.width = '180px';

	var pngOption = document.createElement('option');
	pngOption.setAttribute('value', 'png');
	mxUtils.write(pngOption, mxResources.get('formatPng'));
	imageFormatSelect.appendChild(pngOption);

	var gifOption = document.createElement('option');
	
	// if (ExportDialog.showGifOption)
	// {
	// 	gifOption.setAttribute('value', 'gif');
	// 	mxUtils.write(gifOption, mxResources.get('formatGif'));
	// 	imageFormatSelect.appendChild(gifOption);
	// }
	
	// var jpgOption = document.createElement('option');
	// jpgOption.setAttribute('value', 'jpg');
	// mxUtils.write(jpgOption, mxResources.get('formatJpg'));
	// imageFormatSelect.appendChild(jpgOption);

	// var pdfOption = document.createElement('option');
	// pdfOption.setAttribute('value', 'pdf');
	// mxUtils.write(pdfOption, mxResources.get('formatPdf'));
	// imageFormatSelect.appendChild(pdfOption);
	
	var svgOption = document.createElement('option');
	svgOption.setAttribute('value', 'svg');
	mxUtils.write(svgOption, mxResources.get('formatSvg'));
	imageFormatSelect.appendChild(svgOption);
	
	if (ExportDialog.showXmlOption)
	{
		var xmlOption = document.createElement('option');
		xmlOption.setAttribute('value', 'xml');
		mxUtils.write(xmlOption, mxResources.get('formatXml'));
		imageFormatSelect.appendChild(xmlOption);
	}

	td = document.createElement('td');
	td.appendChild(imageFormatSelect);
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('zoom') + ' (%):');
	
	row.appendChild(td);
	
	var zoomInput = document.createElement('input');
	zoomInput.setAttribute('type', 'number');
	zoomInput.setAttribute('value', '100');
	zoomInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(zoomInput);
	row.appendChild(td);

	tbody.appendChild(row);

	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('width') + ':');
	
	row.appendChild(td);
	
	var widthInput = document.createElement('input');
	widthInput.setAttribute('value', width);
	widthInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(widthInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('height') + ':');
	
	row.appendChild(td);
	
	var heightInput = document.createElement('input');
	heightInput.setAttribute('value', height);
	heightInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(heightInput);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('dpi') + ':');
	
	row.appendChild(td);
	
	var dpiSelect = document.createElement('select');
	dpiSelect.style.width = '180px';

	var dpi100Option = document.createElement('option');
	dpi100Option.setAttribute('value', '100');
	mxUtils.write(dpi100Option, '100dpi');
	dpiSelect.appendChild(dpi100Option);

	var dpi200Option = document.createElement('option');
	dpi200Option.setAttribute('value', '200');
	mxUtils.write(dpi200Option, '200dpi');
	dpiSelect.appendChild(dpi200Option);
	
	var dpi300Option = document.createElement('option');
	dpi300Option.setAttribute('value', '300');
	mxUtils.write(dpi300Option, '300dpi');
	dpiSelect.appendChild(dpi300Option);
	
	var dpi400Option = document.createElement('option');
	dpi400Option.setAttribute('value', '400');
	mxUtils.write(dpi400Option, '400dpi');
	dpiSelect.appendChild(dpi400Option);
	
	var dpiCustOption = document.createElement('option');
	dpiCustOption.setAttribute('value', 'custom');
	mxUtils.write(dpiCustOption, mxResources.get('custom'));
	dpiSelect.appendChild(dpiCustOption);

	var customDpi = document.createElement('input');
	customDpi.style.width = '180px';
	customDpi.style.display = 'none';
	customDpi.setAttribute('value', '100');
	customDpi.setAttribute('type', 'number');
	customDpi.setAttribute('min', '50');
	customDpi.setAttribute('step', '50');
	
	var zoomUserChanged = false;
	
	mxEvent.addListener(dpiSelect, 'change', function()
	{
		if (this.value == 'custom')
		{
			this.style.display = 'none';
			customDpi.style.display = '';
			customDpi.focus();
		}
		else
		{
			customDpi.value = this.value;
			
			if (!zoomUserChanged) 
			{
				zoomInput.value = this.value;
			}
		}
	});
	
	mxEvent.addListener(customDpi, 'change', function()
	{
		var dpi = parseInt(customDpi.value);
		
		if (isNaN(dpi) || dpi <= 0)
		{
			customDpi.style.backgroundColor = 'red';
		}
		else
		{
			customDpi.style.backgroundColor = '';

			if (!zoomUserChanged) 
			{
				zoomInput.value = dpi;
			}
		}	
	});
	
	td = document.createElement('td');
	td.appendChild(dpiSelect);
	td.appendChild(customDpi);
	row.appendChild(td);

	tbody.appendChild(row);
	
	row = document.createElement('tr');
	
	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('background') + ':');
	
	row.appendChild(td);
	
	var transparentCheckbox = document.createElement('input');
	transparentCheckbox.setAttribute('type', 'checkbox');
	transparentCheckbox.checked = graph.background == null || graph.background == mxConstants.NONE;

	td = document.createElement('td');
	td.appendChild(transparentCheckbox);
	mxUtils.write(td, mxResources.get('transparent'));
	
	row.appendChild(td);
	
	tbody.appendChild(row);
	
	row = document.createElement('tr');

	td = document.createElement('td');
	td.style.fontSize = '10pt';
	mxUtils.write(td, mxResources.get('borderWidth') + ':');
	
	row.appendChild(td);
	
	var borderInput = document.createElement('input');
	borderInput.setAttribute('type', 'number');
	borderInput.setAttribute('value', ExportDialog.lastBorderValue);
	borderInput.style.width = '180px';

	td = document.createElement('td');
	td.appendChild(borderInput);
	row.appendChild(td);

	tbody.appendChild(row);
	table.appendChild(tbody);
	
	// Handles changes in the export format
	function formatChanged()
	{
		var name = nameInput.value;
		var dot = name.lastIndexOf('.');
		
		if (dot > 0)
		{
			nameInput.value = name.substring(0, dot + 1) + imageFormatSelect.value;
		}
		else
		{
			nameInput.value = name + '.' + imageFormatSelect.value;
		}
		
		if (imageFormatSelect.value === 'xml')
		{
			zoomInput.setAttribute('disabled', 'true');
			widthInput.setAttribute('disabled', 'true');
			heightInput.setAttribute('disabled', 'true');
			borderInput.setAttribute('disabled', 'true');
		}
		else
		{
			zoomInput.removeAttribute('disabled');
			widthInput.removeAttribute('disabled');
			heightInput.removeAttribute('disabled');
			borderInput.removeAttribute('disabled');
		}
		
		if (imageFormatSelect.value === 'png' || imageFormatSelect.value === 'svg' || imageFormatSelect.value === 'pdf')
		{
			transparentCheckbox.removeAttribute('disabled');
		}
		else
		{
			transparentCheckbox.setAttribute('disabled', 'disabled');
		}
		
		if (imageFormatSelect.value === 'png')
		{
			dpiSelect.removeAttribute('disabled');
			customDpi.removeAttribute('disabled');
		}
		else
		{
			dpiSelect.setAttribute('disabled', 'disabled');
			customDpi.setAttribute('disabled', 'disabled');
		}
	};
	
	mxEvent.addListener(imageFormatSelect, 'change', formatChanged);
	formatChanged();

	function checkValues()
	{
		if (widthInput.value * heightInput.value > MAX_AREA || widthInput.value <= 0)
		{
			widthInput.style.backgroundColor = 'red';
		}
		else
		{
			widthInput.style.backgroundColor = '';
		}
		
		if (widthInput.value * heightInput.value > MAX_AREA || heightInput.value <= 0)
		{
			heightInput.style.backgroundColor = 'red';
		}
		else
		{
			heightInput.style.backgroundColor = '';
		}
	};

	mxEvent.addListener(zoomInput, 'change', function()
	{
		zoomUserChanged = true;
		var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
		zoomInput.value = parseFloat((s * 100).toFixed(2));
		
		if (width > 0)
		{
			widthInput.value = Math.floor(width * s);
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	mxEvent.addListener(widthInput, 'change', function()
	{
		var s = parseInt(widthInput.value) / width;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			heightInput.value = Math.floor(height * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});

	mxEvent.addListener(heightInput, 'change', function()
	{
		var s = parseInt(heightInput.value) / height;
		
		if (s > 0)
		{
			zoomInput.value = parseFloat((s * 100).toFixed(2));
			widthInput.value = Math.floor(width * s);
		}
		else
		{
			zoomInput.value = '100';
			widthInput.value = width;
			heightInput.value = height;
		}
		
		checkValues();
	});
	
	row = document.createElement('tr');
	td = document.createElement('td');
	td.setAttribute('align', 'right');
	td.style.paddingTop = '22px';
	td.colSpan = 2;
	
	var saveBtn = mxUtils.button(mxResources.get('export'), mxUtils.bind(this, function()
	{
		if (parseInt(zoomInput.value) <= 0)
		{
			mxUtils.alert(mxResources.get('drawingEmpty'));
		}
		else
		{
	    	var name = nameInput.value;
			var format = imageFormatSelect.value;
	    	var s = Math.max(0, parseFloat(zoomInput.value) || 100) / 100;
			var b = Math.max(0, parseInt(borderInput.value));
			var bg = graph.background;
			var dpi = Math.max(1, parseInt(customDpi.value));
			
			if ((format == 'svg' || format == 'png' || format == 'pdf') && transparentCheckbox.checked)
			{
				bg = null;
			}
			else if (bg == null || bg == mxConstants.NONE)
			{
				bg = '#ffffff';
			}
			
			ExportDialog.lastBorderValue = b;
			ExportDialog.exportFile(editorUi, name, format, bg, s, b, dpi);
		}
	}));
	saveBtn.className = 'geBtn gePrimaryBtn';
	
	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		td.appendChild(saveBtn);
		td.appendChild(cancelBtn);
		
	}
	else
	{
		td.appendChild(saveBtn);
		td.appendChild(cancelBtn);
	}

	row.appendChild(td);
	tbody.appendChild(row);
	table.appendChild(tbody);
	table.style.margin = "10px";
	this.container = table;
};

/**
 * Remembers last value for border.
 */
ExportDialog.lastBorderValue = 0;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showGifOption = true;

/**
 * Global switches for the export dialog.
 */
ExportDialog.showXmlOption = true;

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.exportFile = function(editorUi, name, format, bg, s, b, dpi)
{
	var graph = editorUi.editor.graph;
	
	if (format == 'xml')
	{
		editorUi.editor.getGraphXml(name,name)
    	// ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(editorUi.editor.getGraphXml()), name, format);
	}
    else if (format == 'svg'||format=='png') // png일 경우도 일단 svg로 받아서 app.py에서 svg2png로 변환해서 저장
	{
		ExportDialog.saveLocalFile(editorUi, mxUtils.getXml(graph.getSvg(bg, s, b)), name, format);
	}
    else
    {
    	var bounds = graph.getGraphBounds();
    	
		// New image export
		var xmlDoc = mxUtils.createXmlDocument();
		var root = xmlDoc.createElement('output');
		xmlDoc.appendChild(root);
		
	    // Renders graph. Offset will be multiplied with state's scale when painting state.
		var xmlCanvas = new mxXmlCanvas2D(root);
		xmlCanvas.translate(Math.floor((b / s - bounds.x) / graph.view.scale),
			Math.floor((b / s - bounds.y) / graph.view.scale));
		xmlCanvas.scale(s / graph.view.scale);
		
		var imgExport = new mxImageExport()
	    imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
	    
		// Puts request data together
		var param = 'xml=' + encodeURIComponent(mxUtils.getXml(root));
		var w = Math.ceil(bounds.width * s / graph.view.scale + 2 * b);
		var h = Math.ceil(bounds.height * s / graph.view.scale + 2 * b);
		
		// Requests image if request is valid
		if (param.length <= MAX_REQUEST_SIZE && w * h < MAX_AREA)
		{
			editorUi.hideDialog();
			var req = new mxXmlRequest(EXPORT_URL, 'format=' + format +
				'&filename=' + encodeURIComponent(name) +
				'&bg=' + ((bg != null) ? bg : 'none') +
				'&w=' + w + '&h=' + h + '&' + param +
				'&dpi=' + dpi);
			req.simulate(document, '_blank');
		}
		else
		{
			mxUtils.alert(mxResources.get('drawingTooLarge'));
		}
	}
};

/**
 * Hook for getting the export format. Returns null for the default
 * intermediate XML export format or a function that returns the
 * parameter and value to be used in the request in the form
 * key=value, where value should be URL encoded.
 */
ExportDialog.saveLocalFile = function(editorUi, data, filename, format)
{
	if (data.length < MAX_REQUEST_SIZE)
	{
		editorUi.hideDialog();
		var req = new mxXmlRequest(SAVE_URL, 'xml=' + encodeURIComponent(data) + '&filename=' +
			encodeURIComponent(filename) + '&format=' + format);
		// req.simulate(document, '_blank'); //페이지 이동 할 때마다 새창 열리는 부분. 근데 주석처리하면 이미지 저장이 안됨 
		req.simulate(document);
	}
	else
	{
		mxUtils.alert(mxResources.get('drawingTooLarge'));
		mxUtils.popup(xml);
	}
};

/**
 * Constructs a new metadata dialog.
 */
function addEditDataTableShapeName(clickedCellId, cell, graph){
	var reqName = '';
	var reqId = '';
	var cellDict = graph.getModel().cells;
	var keysArray = Object.keys(cellDict);
	for (const key of keysArray) {
		try{
			if(graph.getModel().cells[key].parent.parent.id == clickedCellId){
				try{
					if(graph.getModel().cells[key].class == 'reqName'){
						reqName = graph.getModel().cells[key].value;
						reqId = graph.getModel().cells[key].id;
						if(process_name == 'businessProcess'){
							reqName = reqId+'#'+reqName;
						}
						break;
					}
					else if(graph.getModel().cells[key].class == 'nonReqName'){
						reqName = graph.getModel().cells[key].value;
						break;
					}
				}catch{
				}
			}
		}catch{}
	}
	return reqName;
}
var EditDataDialog = function(ui, cell)
{
	var graph = ui.editor.graph;

	var value = graph.getModel().getValue(cell);
	if(process_name == 'requirementsProcess'|| process_name =='businessProcess') {
		var selectedCellName = addEditDataTableShapeName(cell.id, cell, graph);
		if(selectedCellName.includes('#')){
			selectedCellName = selectedCellName.split('#')[1];
		}

	}
	if(process_name == 'workflowProcess'){
		var activityNameString = value.getAttribute('label');
	
		var match = activityNameString.match(/bold;">(.*?)<\/div/g);
		if (match) {
			// 추출된 문자열에서 [ 나 ] 제거 (있을 경우)
			var activityName = match[0].replace(/bold;">(.*?)<\/div/, '$1');
			 activityName = activityName.replace(/\[|\]/g, '');
		} else {
			match = activityNameString.match(/bold">(.*?)<\/div/g);
			if (match) {
				// 추출된 문자열에서 [ 나 ] 제거 (있을 경우)
				var activityName = match[0].replace(/bold">(.*?)<\/div/, '$1');
				if(activityName =='<br>'){
					activityName = '';
				}
				activityName = activityName.replace(/\[|\]/g, '');
			}
		}
		var selectedCellName = activityName;
	}
	// if(process_name =='workflowProcess'){
	//
	// 	var activityNameString = value.getAttribute('label');
	// 	var match = activityNameString.match(/&gt;<br>(.*?)<\/div/);
	//
	// 	if (match) {
	// 		var extractedString = match[1];
	//
	// 		// [와]를 없애고 저장 (있을 경우)
	// 		var selectedCellName = extractedString.replace(/\[|\]/g, '');
	//
	// 		// 결과 출력 또는 다른 작업 수행
	// 	}
	// }

	var div = document.createElement('div');
	var editDataTitle = document.createElement('div');
	editDataTitle.textContent = 'Edit Data   ' + '('+ selectedCellName +')';
	editDataTitle.style.cssText='color: #353535;font-size: 24px;font-style: normal;font-weight: 500;line-height: normal; padding:20px;'
	div.appendChild(editDataTitle);
	div.style.cssText = 'height:70px;border-radius: 5px 5px 0px 0px;background: #E8F3FF;'



	// try{
		value.removeAttribute('xmlns');
	// }
	// catch(e){
		// console.log(e);
	// }
	
	// Converts the value to an XML node
	if (!mxUtils.isNode(value))
	{
		var doc = mxUtils.createXmlDocument();
		var obj = doc.createElement('object');
		obj.setAttribute('label', value || '');
		value = obj;
	}
	
	var meta = {};
	
	try
	{
		var temp = mxUtils.getValue(ui.editor.graph.getCurrentCellStyle(cell), 'metaData', null);
		
		if (temp != null)
		{
			meta = JSON.parse(temp);
		}
	}
	catch (e) 
	{
		// ignore
	}

	var form = document.createElement('div');
	form.className='properties';
	form.style.width = '100%';
	form.style.padding = '2%';

	var attrs = value.attributes; // 순우 property 값 저장 되어있는 변수
	var names = [];
	var texts = [];
	var count = 0;

	var id = (EditDataDialog.getDisplayIdForCell != null) ?
		EditDataDialog.getDisplayIdForCell(ui, cell) : null; // 민수 고유한 인덱스 아이디 찾는 곳

	var addRemoveButton = function(text, name) {
		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative';
		wrapper.style.paddingRight = '20px';
		wrapper.style.boxSizing = 'border-box';
		wrapper.style.width = '100%';
	  
		var removeAttr = document.createElement('a');
		var img = mxUtils.createImage(Dialog.prototype.closeImage);
		img.style.height = '9px';
		img.style.fontSize = '9px';
		img.style.marginBottom = (mxClient.IS_IE11) ? '-1px' : '5px';
	  
		removeAttr.className = 'geButton';
		removeAttr.setAttribute('title', mxResources.get('delete'));
		removeAttr.style.position = 'absolute';
		removeAttr.style.top = '4px';
		removeAttr.style.right = '0px';
		removeAttr.style.margin = '0px';
		removeAttr.style.width = '9px';
		removeAttr.style.height = '9px';
		removeAttr.style.cursor = 'pointer';
		removeAttr.appendChild(img);
	  
		var removeAttrFn = function() {
			// 해당하는 이름과 텍스트를 찾아 제거
			var index = names.indexOf(name);
			if (index !== -1) {
			  names.splice(index, 1);
			  texts.splice(index, 1);
			}
		
			// wrapper를 찾아서 삭제
			var parent = wrapper.parentNode;
			if (parent) {
			  parent.removeChild(wrapper);
			}
		  };
		
		  mxEvent.addListener(removeAttr, 'click', removeAttrFn);
	  
		mxEvent.addListener(removeAttr, 'click', removeAttrFn);
		var parent = text.parentNode;
		// 텍스트와 버튼을 wrapper에 추가
		wrapper.appendChild(name);
		wrapper.appendChild(text);
		wrapper.appendChild(removeAttr);
		parent.appendChild(wrapper);
	  
		// wrapper를 어딘가에 추가
		// 예를 들어, 특정 폼에 추가하려면 해당 폼의 참조가 필요합니다.
		// 아래는 예시일 뿐이므로 실제 코드에 맞게 수정해야 합니다.
		// document.body.appendChild(wrapper);
	  };
	  

	var addTextArea = function(name, value) {
		var label = document.createElement('div');
		label.textContent = name;
		label.style.cssText = 'color: #353535;font-size: 18px;font-style: normal;font-weight: 500;line-height: normal;'
		form.appendChild(label);
	
		var textarea = document.createElement('textarea');
		textarea.value = value;
		// textarea.style.width = '100%';
		textarea.style.cssText ='color: #353535;font-size: 16px;font-style: normal;font-weight: 400; width:100%;border-radius: 5px;background: #F7F7F7;box-shadow: 1px 1px 3px 0px rgba(0, 0, 0, 0.15);    border-color:#F7F7F7;padding-top: 10px;padding-left: 10px;width: 679px;'
	
		if (value.indexOf('\n') > 0) {
			textarea.setAttribute('rows', '5');
		}
		form.appendChild(textarea);

		var blank = document.createElement('div');
		blank.innerHTML = '<br>';
		form.appendChild(blank);
	
		// addRemoveButton(textarea, label);
	
		if (meta[name] != null && meta[name].editable == false) {
			textarea.setAttribute('disabled', 'disabled');
		}
	};

	
	var temp = [];
	var isLayer = graph.getModel().getParent(cell) == graph.getModel().getRoot();

	var extracted = extractObjects(id)
	
	
	clicked.push(id)


	console.log(attrs)
	// for (var i = 0; i < attrs.length; i++) // 순우 다이어그램 노드에 property 값을 하나하나 추가하는 부분
	// {
	// 	if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders')
	// 	{
	// 		temp.push({name: attrs[i].nodeName, value: attrs[i].nodeValue});
	// 	}
	// }
	for (var i = 0; i < attrs.length; i++) {
		if ((isLayer || attrs[i].nodeName != 'label') && attrs[i].nodeName != 'placeholders') {
			temp.push({ name: attrs[i].nodeName, value: attrs[i].nodeValue });
		}
	}

	for (var i = 0; i < temp.length; i++) {
		addTextArea(temp[i].name, temp[i].value);
	}
	
	var top = document.createElement('div');
	top.style.cssText = 'position:absolute;left:30px;right:30px;overflow-y:auto;top:40px;bottom:80px;overflow-x:hidden;';
	// 순우 editdata css반영
	top.className = 'editDataDialog';
	top.style.borderRadius = '10px';
	top.style.border = '1px solid #9B9B9B';
	top.style.top = '20%';

	// top.appendChild(form.table);
	top.appendChild(form);

	var newProp = document.createElement('div');
	newProp.style.boxSizing = 'border-box';
	newProp.style.paddingRight = '160px';
	newProp.style.whiteSpace = 'nowrap';
	newProp.style.marginTop = '6px';
	newProp.style.width = '100%';
	
	var nameInput = document.createElement('input');
	// nameInput.setAttribute('placeholder', mxResources.get('enterPropertyName'));
	// nameInput.setAttribute('type', 'text');
	// nameInput.setAttribute('size', (mxClient.IS_IE || mxClient.IS_IE11) ? '36' : '40');
	// nameInput.style.boxSizing = 'border-box';
	// nameInput.style.marginLeft = '2px';
	// nameInput.style.width = '100%';
	
	// newProp.appendChild(nameInput);
	top.appendChild(newProp);
	div.appendChild(top);
	

	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		ui.hideDialog.apply(ui, arguments);
	});
	
	cancelBtn.className = 'geBtn';
	
	var applyBtn = mxUtils.button(mxResources.get('apply'), function()
	{
		try
		{
			try{
				// req editdata에서 selectbox로 선택 한 값 로컬스토리지에 저장
				if (cell.value.includes('non functional')) {
					var selectedReqKind = reqSelectBox.value
					var reqId = cell.id;
					localStorage.setItem(projectName +'_'+reqId+ '#requirementKind', selectedReqKind)
				}
			}catch{
				if (cell.value.outerHTML.includes('non functional')) {
					var selectedReqKind = reqSelectBox.value
					var reqId = cell.id;
					localStorage.setItem(projectName +'_'+reqId+ '#requirementKind', selectedReqKind)
				}
			}
			

			ui.hideDialog.apply(ui, arguments);
			
			// Clones and updates the value
			value = value.cloneNode(true);
			var removeLabel = false;
			var removeLength = value.attributes.length;

			if (value.attributes[0].nodeName == 'label'){
				for (var i = 0; i < removeLength-2; i++)
				{
					const name = value.attributes[2].nodeName;
					const text = value.attributes[2].textContent;
					value.removeAttribute(name);
				}
            }else{
				for (var i = 0; i < removeLength; i++)
				{
					const name = value.attributes[0].nodeName;
					const text = value.attributes[0].textContent;
					value.removeAttribute(name);
				}
			}

			for (var i = 0; i < form.querySelectorAll('textarea').length; i++)
			{
				const name = form.querySelectorAll('textarea')[i].value;
				const text = form.getElementsByTagName('div')[i*2].textContent;

				if (text == null)
				{
					value.removeAttribute(name);
				}
				else
				{
					
					value.setAttribute(text,name);
					removeLabel = removeLabel 
					|| (names[i] == 'placeholder' && value.getAttribute('placeholders') == '1');
				}
			}
			
			// Removes label if placeholder is assigned
			if (removeLabel)
			{
				value.removeAttribute('label');
			}
			
			// Updates the value of the cell (undoable)
			graph.getModel().setValue(cell, value);
			value.removeAttribute('xmlns');
			getObjectPropertyValue(value,cell.id,cell.mxObjectId) // 민수 property 값을 바인딩 하는 곳

		}
		catch (e)
		{
			mxUtils.alert(e);
		}
	});
	applyBtn.className = 'geBtn gePrimaryBtn minsoo'; // 민수 property입력 버튼 

	function updateAddBtn()
	{
		if (nameInput.value.length > 0)
		{
			addBtn.removeAttribute('disabled');
		}
		else
		{
			addBtn.setAttribute('disabled', 'disabled');
		}
	};

	mxEvent.addListener(nameInput, 'keyup', updateAddBtn);
	
	// Catches all changes that don't fire a keyup (such as paste via mouse)
	mxEvent.addListener(nameInput, 'change', updateAddBtn);
	
	var buttons = document.createElement('div');
	buttons.id = 'editData'//순우
	buttons.style.cssText = 'position:absolute;left:30px;right:30px;text-align:right;bottom:30px;height:40px;'

	// var applyBtn = mxUtils.button(mxResources.get('apply'), function()
	const svgPlusIcon = '<svg style = "vertical-align :sub", xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8337 10.8317H10.8337V15.8317H9.16699V10.8317H4.16699V9.16504H9.16699V4.16504H10.8337V9.16504H15.8337V10.8317Z" fill="white"/></svg>';
	// svgPlusIcon.style.verticalAlign = 'text-top';
	const reqName = mxResources.get('selectReq');
	const reqTitle = svgPlusIcon+reqName
	var reqBtn = mxUtils.button(mxResources.get('selectReq'), mxUtils.bind(this, function(evt)
		{
			ui.actions.get('selectReq').funct();

		}));
		reqBtn.innerHTML = reqTitle;
		reqBtn.setAttribute('title', mxResources.get('selectReq'));
		reqBtn.style.width = '128px;';
		reqBtn.style.marginRight = '10px';
		reqBtn.className = 'geAddBtn';

	const DockerName = mxResources.get('editLink');
	const DockerTitle = svgPlusIcon+DockerName
	var DockerBtn = mxUtils.button(mxResources.get('editLink'), mxUtils.bind(this, function(evt)
		{
			ui.actions.get('editLink').funct();
		}));
		DockerBtn.innerHTML = DockerTitle;
		DockerBtn.setAttribute('title', mxResources.get('editLink'));
		DockerBtn.style.width = '126px';
		DockerBtn.style.marginRight = '10px';
		DockerBtn.className = 'geAddBtn';

	const nodeBtnName = mxResources.get('nodeSelector');
	const nodeBtnTitle = svgPlusIcon+nodeBtnName
	var nodeBtn = mxUtils.button(mxResources.get('nodeSelector'), mxUtils.bind(this, function(evt)
		{
			ui.actions.get('nodeSelector').funct();
		}));
		nodeBtn.innerHTML = nodeBtnTitle;
		nodeBtn.setAttribute('title', mxResources.get('nodeSelector'));
		nodeBtn.style.width = '144px';
		nodeBtn.style.marginRight = '139px';
		nodeBtn.className = 'geAddBtn';

	if (ui.editor.cancelFirst)
	{
		if(process_name != 'requirementsProcess'){
			reqBtn.style.marginRight = '432px';
			buttons.appendChild(reqBtn);
		}
		if (process_name == 'workflowProcess'){
			reqBtn.style.width = '128px;';
			reqBtn.style.marginRight = '10px';
			buttons.appendChild(DockerBtn);
			buttons.appendChild(nodeBtn);
		}
		buttons.appendChild(applyBtn);
		buttons.appendChild(cancelBtn);

	}
	else
	{
		if(process_name != 'requirementsProcess'){
			reqBtn.style.marginRight = '432px';
			buttons.appendChild(reqBtn);
		}
		if (process_name == 'workflowProcess'){
			reqBtn.style.marginRight = '0px';
			buttons.appendChild(DockerBtn);
			buttons.appendChild(nodeBtn);
		}
		buttons.appendChild(applyBtn);
		buttons.appendChild(cancelBtn);

	}

	div.appendChild(buttons);
	this.container = div;
};

/**
 * Optional help link.
 */
EditDataDialog.getDisplayIdForCell = function(ui, cell)
{
	var id = null;
	
	if (ui.editor.graph.getModel().getParent(cell) != null)
	{
		id = cell.getId();
	}
	
	return id;
};
/**
 * Optional help link.
 */
EditDataDialog.getDisplayIdForCell = function(ui, cell)
{
	var id = null;
	
	if (ui.editor.graph.getModel().getParent(cell) != null)
	{
		id = cell.getId();
	}
	
	return id;
};

/**
 * Optional help link.
 */
EditDataDialog.placeholderHelpLink = null;

// 순우 req 다이어로그
var ReqDialog = function(editorUi, ui, cell) {
	var selectedCellName = '';
	if (process_name =='businessProcess'){
		// var actId = cell.id
		// var valueString = cell.value.outerHTML;
		// // var regex = /&quot;&gt;(.+?)&lt;/;
		// var regex = /&quot;>(.*?)<\/div>/;
		// // var matches = [];
		// // var match;
		// var match = regex.exec(valueString);
		// if (match==null){
		// 	regex = /&quot;&gt;(.+?)&lt;/;
		// 	match = regex.exec(valueString);
		// }
		// var extractedString = match ? match[1] : null;
		// if(extractedString.includes('['||']')){
		// 	extractedString=extractedString.substring(1,extractedString.length -1);
		// }
		// // matches.push(extractedString);
		// var actName = actId+'#'+extractedString
		// selectedCellName = actName;

		var graph = editorUi.editor.graph;
		selectedCellName = addEditDataTableShapeName(cell.id, cell, graph)
		// var actName = localStorage.getItem(projectName+'_nowWorkflow');
		var actName = selectedCellName

		try{
			var stepNameHtml = cell.value;

			// label 속성 값 가져오기
			for(var i=0 ; i<stepNameHtml.attributes.length; i++){
				try{
					if(stepNameHtml.attributes[i].nodeName=='label'){
						var labelValue = stepNameHtml.attributes[i].textContent;
					}
				}catch{}
			}
		}catch{
		}


	}
	else if (process_name == 'workflowProcess'){
		var actId = cell.id
		var valueString = cell.value.outerHTML;
		// var regex = /&quot;&gt;(.+?)&lt;/;
		var regex = /&quot;>(.*?)<\/div>/;
		// var matches = [];
		// var match;
		var match = regex.exec(valueString);
		if (match==null){
			regex = /&quot;&gt;(.+?)&lt;/;
			match = regex.exec(valueString);
		}
		var extractedString = match ? match[1] : null;
		var actName = actId+'#'+extractedString
		selectedCellName = actName;
		var stepId = cell.id;
		var stepName = actName

	}
	var reqList = extractReq();

	var div = document.createElement('div');
	var reqTitle = document.createElement('div');
	reqTitle.textContent = 'Select Requirement   ' +'('+selectedCellName.split("#").pop()+')';
	reqTitle.style.cssText='color: #353535;font-size: 24px;font-style: normal;font-weight: 500;line-height: normal; padding:20px;'
	div.appendChild(reqTitle);
	div.style.cssText = 'height:70px;border-radius: 5px 5px 0px 0px;background: #E8F3FF;'

	
	var inner = document.createElement('div');
	inner.className = 'geTitle';
	inner.style = 'flex';

	if (!mxClient.IS_VML) {
	  inner.style.padding = '20px';
	}

	var leftContainer = document.createElement("div");
	leftContainer.style.display = "flex";
	leftContainer.style.flexDirection = "column";

	var leftListLabel = document.createElement("div");
	leftListLabel.textContent = "Requirement pool";
	leftListLabel.style.cssText='color: #353535;font-size: 20px;font-style: normal;font-weight: 500;line-height: normal;    margin-bottom: 3%;'


	var leftList = document.createElement("select");
	leftList.id = "leftList";
	leftList.multiple = true;
	leftList.style.cssText='border-radius: 5px;border: 1px solid #9B9B9B;'
	

	var rightContainer = document.createElement("div");
	rightContainer.style.display = "flex";
	rightContainer.style.flexDirection = "column";

	var rightListLabel = document.createElement("div");
	rightListLabel.textContent = "Target requirement";
	rightListLabel.style.cssText='color: #353535;font-size: 20px;font-style: normal;font-weight: 500;line-height: normal;margin-bottom: 3%;'


	var rightList = document.createElement("select");
	rightList.id = "rightList";
	rightList.multiple = true;
	rightList.style.cssText='border-radius: 5px;border: 1px solid #9B9B9B;'
	

	var listContainer = document.createElement('div');
	listContainer.style.display = 'flex';
	listContainer.style.marginBottom = '3%';


	leftList.style.width = "300px"; 
	rightList.style.width = "300px"; 
	leftList.style.height = "300px";
	rightList.style.height = '300px';
	leftContainer.style.width = "300px";
	rightContainer.style.width = "300px";

	var moveButton = document.createElement("button");
	moveButton.id = "moveButton";
	moveButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"; style="margin-bottom:100%;"><circle cx="20" cy="20" r="20" fill="#2E5686"/><path d="M28 18.2679C29.3333 19.0377 29.3333 20.9623 28 21.7321L17.5 27.7942C16.1667 28.564 14.5 27.6018 14.5 26.0622L14.5 13.9378C14.5 12.3982 16.1667 11.436 17.5 12.2058L28 18.2679Z" fill="white"/ ></svg>'
	moveButton.style.display = 'contents';

	// moveButton.textContent = "Move Selected";

	var moveBackButton = document.createElement("button");
	moveBackButton.id = "moveBackButton";
	// moveBackButton.textContent = "Move Back Selected";
	moveBackButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" transform="matrix(-1 0 0 1 40 0)" fill="#2E5686"/><path d="M12 18.2679C10.6667 19.0377 10.6667 20.9623 12 21.7321L22.5 27.7942C23.8333 28.564 25.5 27.6018 25.5 26.0622L25.5 13.9378C25.5 12.3982 23.8333 11.436 22.5 12.2058L12 18.2679Z" fill="white"/></svg>'
	moveBackButton.style.display = 'contents';

	var leftListOptions = reqList;

	moveBackButton.addEventListener("click", function() {
		var selectedOptions = Array.from(rightList.selectedOptions);
		selectedOptions.forEach(function(selectedOption) {
			var exists = Array.from(leftList.options).some(function(option) {
				return option.value === selectedOption.value;
			});
			if (!exists) {
				var newOption = document.createElement("option");
				newOption.value = selectedOption.value;
				newOption.text = selectedOption.text;
				newOption.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;'

				leftList.appendChild(newOption);
			}
		});
		selectedOptions.forEach(function(selectedOption) {
			rightList.removeChild(selectedOption);
		});
	});

	moveButton.addEventListener("click", function() {
		var selectedOptions = Array.from(leftList.selectedOptions);
		selectedOptions.forEach(function(selectedOption) {
			var exists = Array.from(rightList.options).some(function(option) {
				return option.value === selectedOption.value;
			});
			if (!exists) {
				var newOption = document.createElement("option");
				newOption.value = selectedOption.value; 
				newOption.text = selectedOption.text;
				newOption.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;'

				rightList.appendChild(newOption);
			}
		});
		selectedOptions.forEach(function(selectedOption) {
			leftList.removeChild(selectedOption);
		});
	});

	// 저장 되어 있는 값이 있는지 확인해서 왼쪽 오른쪽 배치
	if(process_name == 'businessProcess'){
		var check = localStorage.getItem(projectName+'_'+actName+'_requirement');
		if (check != null){
			leftListOptions.forEach(function(optionText, index) {
				if(check.includes(optionText)){
					var option = document.createElement("option");
					option.value = index; 
					option.text = optionText;
					option.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'
					
					rightList.appendChild(option)
				}
				else{
					var option = document.createElement("option");
					option.value = index; 
					option.text = optionText;
					option.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'

					leftList.appendChild(option);
				}
			});
		}else if(check ==null){
			leftListOptions.forEach(function(optionText, index) {
				var option = document.createElement("option");
				option.value = index; 
				option.text = optionText;
				option.style.cssText='color: #353535;font-family: Inter;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'

				leftList.appendChild(option);
			});
		}
	}
	else if(process_name == 'workflowProcess'){
		// var check = localStorage.getItem(actName +'_'+ stepId+'#'+stepName + '_requirement');
		var check = localStorage.getItem(localStorage.getItem(projectName+'_nowWorkflow')+'_'+stepName + '_requirement');
		if (check != null){
			leftListOptions.forEach(function(optionText, index) {
				if(check.includes(optionText)){
					var option = document.createElement("option");
					option.value = index; 
					option.text = optionText;
					option.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'

					rightList.appendChild(option)
				}
				else{
					var option = document.createElement("option");
					option.value = index; 
					option.text = optionText;
					option.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'

					leftList.appendChild(option);
				}
			});
		}else if(check ==null){
			leftListOptions.forEach(function(optionText, index) {
				var option = document.createElement("option");
				option.value = index; 
				option.text = optionText;
				option.style.cssText='color: #353535;font-size: 18px;font-style: normal;font-weight: 400;line-height: normal;margin-left:3px;'

				leftList.appendChild(option);
			});
		}
	}

	var applyBtn = mxUtils.button(mxResources.get('apply'), function(ui)
	{
		var targetList = [];
		rightListValue = document.querySelector('#rightList').options;
		for (i=0; i<rightListValue.length; i++){
			targetList.push(rightListValue[i].textContent);
		}
		if(process_name=='businessProcess'){
			localStorage.setItem(projectName+'_' + actName + '_requirement',targetList); 
		}
		else if(process_name =='workflowProcess'){
			localStorage.setItem( localStorage.getItem(projectName+'_nowWorkflow')+'_'+stepName +  '_requirement',targetList);
		}
		console.log('apply btn clicked')
		editorUi.hideDialog();
	});
	applyBtn.className = 'geBtn gePrimaryBtn minsoo'; // 민수 property입력 버튼 

	var cancelButton = mxUtils.button(mxResources.get('cancel'), function() {
	editorUi.hideDialog();
	mxEvent.release(cancelButton);
	});
	cancelButton.className = 'geBtn';

	var buttonsContainer = document.createElement("div");
	buttonsContainer.style.display = "flex";
	buttonsContainer.style.flexDirection = "column";  // 세로로 배치하도록 설정
	buttonsContainer.style.padding="2%";
	buttonsContainer.style.marginTop="15%";
	

	buttonsContainer.appendChild(moveButton);
	buttonsContainer.appendChild(moveBackButton);

	leftContainer.appendChild(leftListLabel); 
	leftContainer.appendChild(leftList); 
	rightContainer.appendChild(rightListLabel); 
	rightContainer.appendChild(rightList);

	listContainer.appendChild(leftContainer);
	listContainer.appendChild(buttonsContainer);
	listContainer.appendChild(rightContainer);
	inner.appendChild(listContainer);

	
	// inner.appendChild(buttonsContainer);

	inner.appendChild(applyBtn);
	inner.appendChild(cancelButton);

	div.appendChild(inner);

	// Show 
	editorUi.showDialog(div, 700, 500, true, true);
	editorUi.dialog.container.style.overflow = 'hidden';
	mxEvent.addListener(window, 'resize', function() {
	editorUi.dialog.container.style.overflow = 'hidden';
	});
};

// 순우 node selector 다이어로그
var nodeSelectorDialog = function(editorUi, ui, cell,fn) {
	var graph = editorUi.editor.graph;
	var value = graph.getModel().getValue(ui);

	var labelValue = value.attributes[0].nodeValue
	var matchResult = labelValue.match(/bold">(.*?)<\/div>/);
		if(matchResult == null){
			matchResult = labelValue.match(/bold;">(.*?)<\/div>/);
		}
	var selectedCellName = matchResult[1]
	var div = document.createElement('div');
	// mxUtils.write(div, mxResources.get('editLink') + ':');
	var reqTitle = document.createElement('div');
	reqTitle.textContent = 'Node Selector   ' + '(' + selectedCellName + ')';
	reqTitle.style.cssText='color: #353535;font-size: 24px;font-style: normal;font-weight: 500;line-height: normal; padding:20px;'
	div.appendChild(reqTitle);
	div.style.cssText = 'height:70px;border-radius: 5px 5px 0px 0px;background: #E8F3FF;'

	var innerInputContainer = document.createElement('div');
	innerInputContainer.style.paddingLeft='8%';

	var innerInput1Title = document.createElement('div');
	innerInput1Title.textContent = 'Select label key';
	innerInput1Title.style.marginTop = '20px'; // 필요한 경우 상단 여백 추가
	innerInput1Title.style.cssText = 'color: #353535;font-size: 20px;font-style: normal;font-weight: 500;line-height: normal; margin-top:20px;'

	var innerInput1 = document.createElement('div');
	innerInput1.className = 'geTitle';
	innerInput1.style.backgroundColor = 'transparent';
	innerInput1.style.borderColor = 'transparent';
	innerInput1.style.whiteSpace = 'nowrap';
	innerInput1.style.textOverflow = 'clip';
	innerInput1.style.cursor = 'default';
	innerInput1.style.cssText = 'color: #353535;font-size: 15px;font-style: normal;font-weight: 500;line-height: normal;'
	
	var innerInput2Title = document.createElement('div');
	innerInput2Title.textContent = 'Select label value';
	innerInput2Title.style.marginTop = '10px';
	innerInput2Title.style.cssText = 'color: #353535;font-size: 20px;font-style: normal;font-weight: 500;line-height: normal; margin-top:20px;'

	var innerInput2 = document.createElement('div');
	innerInput2.className = 'geTitle';
	innerInput2.style.backgroundColor = 'transparent';
	innerInput2.style.borderColor = 'transparent';
	innerInput2.style.whiteSpace = 'nowrap';
	innerInput2.style.textOverflow = 'clip';
	innerInput2.style.cursor = 'default';
	innerInput2.style.cssText = 'color: #353535;font-size: 15px;font-style: normal;font-weight: 500;line-height: normal;'
	
	innerInputContainer.appendChild(innerInput1Title);
	innerInputContainer.appendChild(innerInput1);
	innerInputContainer.appendChild(innerInput2Title);
	innerInputContainer.appendChild(innerInput2);
	
	// if (!mxClient.IS_VML) {
	//   innerInput.style.paddingRight = '20px';
	// }

	// 키값 선택 창
	var input1 = document.createElement('select');
	input1.id = 'firstListBox';
	input1.multiple = 'true';
	// input1.placeholder = '첫 번째 입력 창';
	// input1.value = 'kubernetes.io/hostname'; // 기본 값을 설정
	input1.style.width = '500px';
	input1.style.height = '200px';
	input1.style.borderColor = 'black';

	//input1에서 선택한 키 값에 따른 벨류 선택 창
	var input2 = document.createElement('select');
	input2.id = 'secondListBox';
	input2.multiple = 'true';
	input2.style.width = '500px'
	input2.style.height = '200px';
	input2.style.borderColor = 'black';

	innerInput1.appendChild(input1);
	innerInput2.appendChild(input2);

	fetch("/get_label", {
		method: 'GET'
		})
		.then(function (response) { return response.json(); })
		.then(function (data) {
			var firstListBox = document.getElementById('firstListBox');
			var secondListBox = document.getElementById('secondListBox');
	
			var uniqueKeys = getUniqueKeys(data);

			uniqueKeys.forEach(function (key) {
				var option = document.createElement('option');
				option.value = key;
				option.text = key;
				option.style.marginLeft= '3px';
				firstListBox.appendChild(option);
			});
	 
			function handleFirstListBoxChange() {
				var selectedOption = firstListBox.options[firstListBox.selectedIndex].value;

				secondListBox.innerHTML = '';
	
				var uniqueValues = [];
	
				for (var key in data) {
					if (data[key][selectedOption] !== undefined && !uniqueValues.includes(data[key][selectedOption])) {
						var option = document.createElement('option');
						option.value = data[key][selectedOption];
						option.text = data[key][selectedOption];
						option.style.marginLeft= '3px';
						secondListBox.appendChild(option);
						uniqueValues.push(data[key][selectedOption]);
					}
				}
			}

			firstListBox.addEventListener("change",handleFirstListBoxChange);
	 
			

			function getUniqueKeys(data) {
				var keys = [];
				for (var key in data) {
					keys = keys.concat(Object.keys(data[key]));
				}
				return [...new Set(keys)];
			}

			var cellId = ui.id;
			// 입력했던 Node Selector 다시 불러오기
			if (localStorage.getItem(localStorage.getItem(projectName + '_nowWorkflow') + '_nodeSelector') != null) {
				
				var selectedData = JSON.parse(localStorage.getItem(localStorage.getItem(projectName + '_nowWorkflow') + '_nodeSelector'));
				var selectedKey = cellId;
				var arrKey = selectedData[selectedKey][0]
				var arrValue = selectedData[selectedKey][1];

				// input1.value = arrKey
				// input2.value = arrValue
				for (var i = 0; i < input1.length; i++) {
					if (input1.options[i].value === arrKey) {
						input1.options[i].selected = true;
						handleFirstListBoxChange();
					  break;
					}
				}
				for (var i = 0; i < input2.length; i++) {
					if (input2.options[i].value === arrValue) {
						input2.options[i].selected = true;
					  break;
					}
				}
				// input2.options[0].value = arrValue;
				// secondListBox.innerHTML = '<option value="'+arrValue+'">'+ arrValue +'</option>';
			}
		})

	div.appendChild(innerInputContainer);
	// div.appendChild(innerInput2);
	
	var innerButtons = document.createElement('div');
	innerButtons.style.marginLeft = '7%';
	innerButtons.style.marginTop = '3%';
	
	var cellId = ui.id;
	// 저장버튼
	var applyBtn = mxUtils.button(mxResources.get('apply'), function(ui)
	{
		var diagram_id = cellId;
		var now_workflow = localStorage.getItem(projectName+'_nowWorkflow');
		var data = JSON.parse(localStorage.getItem(now_workflow+'_nodeSelector')) || {};

		data[diagram_id] = [input1.value, input2.value];
		var cellNodeInfo = input1.value+ ' : ' +input2.value;
		localStorage.setItem(now_workflow+'_nodeSelector', JSON.stringify(data));
		editorUi.hideDialog();
		fn(cellNodeInfo);
	});
	applyBtn.className = 'geBtn gePrimaryBtn minsoo'; // 민수 property입력 버튼 

	// Create Cancel button
	var cancelButton = mxUtils.button(mxResources.get('cancel'), function() {
	editorUi.hideDialog();
	mxEvent.release(cancelButton);
	});
	cancelButton.className = 'geBtn';
	// Append buttons to the inner div
	innerButtons.appendChild(applyBtn);
	innerButtons.appendChild(cancelButton);

	div.appendChild(innerButtons);

	// Show the dialog
	editorUi.showDialog(div, 600, 650, true, true);
	editorUi.dialog.container.style.overflow = 'hidden';
	mxEvent.addListener(window, 'resize', function() {
	editorUi.dialog.container.style.overflow = 'hidden';
	});

	
};

/**
 * Constructs a new link dialog.
 */
// 도커 다이어로그
var LinkDialog = function(editorUi, initialValue, btnLabel, dumpfn, fn)
{
	if(process_name =='workflowProcess'){
		var actName = localStorage.getItem(projectName+'_nowWorkflow');

		try{
			var stepNameHtml = btnLabel.value;
			for(var i=0 ; i<stepNameHtml.attributes.length; i++){
				try{
					if(stepNameHtml.attributes[i].nodeName=='label'){
						var labelValue = stepNameHtml.attributes[i].textContent;
					}
				}catch{}
			}
		}catch{
		}
		var matchResult = labelValue.match(/bold">(.*?)<\/div>/);
		if(matchResult == null){
			matchResult = labelValue.match(/bold;">(.*?)<\/div>/);
		}
		// 찾은 문자열 출력
		if (matchResult && matchResult[1]) {
			var stepName = matchResult[1];
			var selectedCellName = stepName;

		}
	}
	var graph = editorUi.editor.graph
	// selectedCellName = addEditDataTableShapeName(btnLabel.id, btnLabel, graph)
	var div = document.createElement('div');
	// mxUtils.write(div, mxResources.get('editLink') + ':');
	var reqTitle = document.createElement('div');
	reqTitle.textContent = 'Docker Image   ' + '('+ selectedCellName +')';
	reqTitle.style.cssText='color: #353535;font-size: 24px;font-style: normal;font-weight: 500;line-height: normal; padding:20px;'
	div.appendChild(reqTitle);
	div.style.cssText = 'height:70px;border-radius: 5px 5px 0px 0px;background: #E8F3FF;'

	
	var inner = document.createElement('div');
	inner.className = 'geTitle dockerHubLink'; // 민수 도커허브
	inner.style.backgroundColor = 'transparent';
	inner.style.borderColor = 'transparent';
	inner.style.whiteSpace = 'nowrap';
	inner.style.textOverflow = 'clip';
	inner.style.cursor = 'default';
	
	if (!mxClient.IS_VML)
	{
		inner.style.padding = '3%';
	}
	
	var linkInput = document.createElement('input');
	linkInput.setAttribute('value', initialValue);
	linkInput.setAttribute('placeholder', 'http://www.example.com/');
	linkInput.setAttribute('type', 'text');
	linkInput.style.marginTop = '6px';
	linkInput.style.width = '540px';
	linkInput.style.backgroundImage = 'url(\'' + Dialog.prototype.clearImage + '\')';
	linkInput.style.backgroundRepeat = 'no-repeat';
	linkInput.style.backgroundPosition = '100% 50%';
	linkInput.style.paddingRight = '14px';
	linkInput.className = 'dockerLink';

	var cross = document.createElement('div');
	cross.setAttribute('title', mxResources.get('reset'));
	cross.style.position = 'relative';
	cross.style.left = '-16px';
	cross.style.width = '12px';
	cross.style.height = '14px';
	cross.style.cursor = 'pointer';

	// Workaround for inline-block not supported in IE
	cross.style.display = (mxClient.IS_VML) ? 'inline' : 'inline-block';
	cross.style.top = ((mxClient.IS_VML) ? 0 : 3) + 'px';
	
	// Needed to block event transparency in IE
	cross.style.background = 'url(' + IMAGE_PATH + '/transparent.gif)';

	mxEvent.addListener(cross, 'click', function()
	{
		linkInput.value = '';
		linkInput.focus();
	});

	var searchInput = document.createElement('input');
	searchInput.setAttribute('placeholder', '검색어를 입력하시오');
	searchInput.setAttribute('type', 'text');
	searchInput.style.marginTop = '6px';
	searchInput.style.marginRight = '10px';
	searchInput.style.width = '340px';
	searchInput.style.opacity = '0.5'; // 투명도 설정
	searchInput.className = 'keyword'; // 클래스 이름 설정

	var selectBox = document.createElement('select');
	selectBox.style.marginTop = '6px';
	selectBox.style.marginRight = '6px';
	selectBox.style.width = '100px';
	selectBox.className = 'searchType';

	var option1 = document.createElement('option');
	option1.text = 'docker';
	option1.value = 'docker';
	option1.className = 'docker';
	selectBox.appendChild(option1);

	var option2 = document.createElement('option');
	option2.text = 'local';
	option2.value = 'local';
	option1.className = 'local';
	selectBox.appendChild(option2);

	var searchButton = document.createElement('button');
	searchButton.innerHTML = '검색';
	searchButton.style.marginTop = '6px';
	searchButton.style.marginRight = '6px';
	searchButton.style.marginLeft = '10px';
	searchButton.className = 'geBtn gePrimaryBtn';
	searchButton.onclick = searchDockerImage; // 클릭 이벤트 설정


	var newDiv = document.createElement('div');
	newDiv.className = 'new-container'; // 클래스 이름 설정
	newDiv.style.paddingLeft = '3%';
	// 검색 결과
	var newDiv2 = document.createElement('div');
	newDiv2.className = 'dockerSearchResult'; // 클래스 이름 설정
	newDiv2.style.paddingLeft = '3%';
	newDiv2.style.paddingTop = '1%';
	

	inner.appendChild(linkInput);
	inner.appendChild(cross);

	newDiv.appendChild(searchInput);
	newDiv.appendChild(selectBox);
	newDiv.appendChild(searchButton);

	div.appendChild(inner);
	div.appendChild(newDiv);
	div.appendChild(newDiv2);

	this.init = function()
	{
		linkInput.focus();
		
		if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5 || mxClient.IS_QUIRKS)
		{
			linkInput.select();
		}
		else
		{
			document.execCommand('selectAll', false, null);
		}
	};
	
	var btns = document.createElement('div');
	btns.style.marginTop = '18px';
	btns.style.textAlign = 'right';
	btns.style.paddingRight = '5%';

	mxEvent.addListener(linkInput, 'keypress', function(e)
	{
		if (e.keyCode == 13)
		{
			editorUi.hideDialog();
			fn(linkInput.value);
		}
	});

	var cancelBtn = mxUtils.button(mxResources.get('cancel'), function()
	{
		editorUi.hideDialog();
	});
	cancelBtn.className = 'geBtn';
	
	if (editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}
	
	var mainBtn = mxUtils.button('Apply', function()
	{
		editorUi.hideDialog();
		fn(linkInput.value);
	});
	mainBtn.className = 'geBtn gePrimaryBtn';
	btns.appendChild(mainBtn);
	
	if (!editorUi.editor.cancelFirst)
	{
		btns.appendChild(cancelBtn);
	}

	div.appendChild(btns);

	this.container = div;
};

/**
 * 
 */
var OutlineWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;

	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.border = '1px solid whiteSmoke';
	div.style.overflow = 'hidden';

	this.window = new mxWindow(mxResources.get('outline'), div, x, y, w, h, true, true);
	this.window.minimumSize = new mxRectangle(0, 0, 80, 80);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
	
	this.window.setLocation = function(x, y)
	{
		var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
		
		x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
		y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

		if (this.getX() != x || this.getY() != y)
		{
			mxWindow.prototype.setLocation.apply(this, arguments);
		}
	};
	
	var resizeListener = mxUtils.bind(this, function()
	{
		var x = this.window.getX();
		var y = this.window.getY();
		
		this.window.setLocation(x, y);
	});
	
	mxEvent.addListener(window, 'resize', resizeListener);
	
	var outline = editorUi.createOutline(this.window);

	this.destroy = function()
	{
		mxEvent.removeListener(window, 'resize', resizeListener);
		this.window.destroy();
		outline.destroy();
	}

	this.window.addListener(mxEvent.RESIZE, mxUtils.bind(this, function()
   	{
		outline.update(false);
		outline.outline.sizeDidChange();
   	}));
	
	this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
	{
		this.window.fit();
		outline.suspended = false;
		outline.outline.refresh();
		outline.update();
	}));
	
	this.window.addListener(mxEvent.HIDE, mxUtils.bind(this, function()
	{
		outline.suspended = true;
	}));
	
	this.window.addListener(mxEvent.NORMALIZE, mxUtils.bind(this, function()
	{
		outline.suspended = false;
		outline.update();
	}));
			
	this.window.addListener(mxEvent.MINIMIZE, mxUtils.bind(this, function()
	{
		outline.suspended = true;
	}));

	var outlineCreateGraph = outline.createGraph;
	outline.createGraph = function(container)
	{
		var g = outlineCreateGraph.apply(this, arguments);
		g.gridEnabled = false;
		g.pageScale = graph.pageScale;
		g.pageFormat = graph.pageFormat;
		g.background = (graph.background == null || graph.background == mxConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;
		g.pageVisible = graph.pageVisible;

		var current = mxUtils.getCurrentStyle(graph.container);
		div.style.backgroundColor = current.backgroundColor;
		
		return g;
	};
	
	function update()
	{
		outline.outline.pageScale = graph.pageScale;
		outline.outline.pageFormat = graph.pageFormat;
		outline.outline.pageVisible = graph.pageVisible;
		outline.outline.background = (graph.background == null || graph.background == mxConstants.NONE) ? graph.defaultPageBackgroundColor : graph.background;;
		
		var current = mxUtils.getCurrentStyle(graph.container);
		div.style.backgroundColor = current.backgroundColor;

		if (graph.view.backgroundPageShape != null && outline.outline.view.backgroundPageShape != null)
		{
			outline.outline.view.backgroundPageShape.fill = graph.view.backgroundPageShape.fill;
		}
		
		outline.outline.refresh();
	};

	outline.init(div);

	editorUi.editor.addListener('resetGraphView', update);
	editorUi.addListener('pageFormatChanged', update);
	editorUi.addListener('backgroundColorChanged', update);
	editorUi.addListener('backgroundImageChanged', update);
	editorUi.addListener('pageViewChanged', function()
	{
		update();
		outline.update(true);
	});
	
	if (outline.outline.dialect == mxConstants.DIALECT_SVG)
	{
		var zoomInAction = editorUi.actions.get('zoomIn');
		var zoomOutAction = editorUi.actions.get('zoomOut');
		
		mxEvent.addMouseWheelListener(function(evt, up)
		{
			var outlineWheel = false;
			var source = mxEvent.getSource(evt);
	
			while (source != null)
			{
				if (source == outline.outline.view.canvas.ownerSVGElement)
				{
					outlineWheel = true;
					break;
				}
	
				source = source.parentNode;
			}
	
			if (outlineWheel)
			{
				if (up)
				{
					zoomInAction.funct();
				}
				else
				{
					zoomOutAction.funct();
				}
			}
		});
	}
};

/**
 * 
 */
var LayersWindow = function(editorUi, x, y, w, h)
{
	var graph = editorUi.editor.graph;
	
	var div = document.createElement('div');
	div.style.userSelect = 'none';
	div.style.background = (Dialog.backdropColor == 'white') ? 'whiteSmoke' : Dialog.backdropColor;
	div.style.border = '1px solid whiteSmoke';
	div.style.height = '100%';
	div.style.marginBottom = '10px';
	div.style.overflow = 'auto';

	var tbarHeight = (!EditorUi.compactUi) ? '30px' : '26px';
	
	var listDiv = document.createElement('div')
	listDiv.style.backgroundColor = (Dialog.backdropColor == 'white') ? '#dcdcdc' : Dialog.backdropColor;
	listDiv.style.position = 'absolute';
	listDiv.style.overflow = 'auto';
	listDiv.style.left = '0px';
	listDiv.style.right = '0px';
	listDiv.style.top = '0px';
	listDiv.style.bottom = (parseInt(tbarHeight) + 7) + 'px';
	div.appendChild(listDiv);
	
	var dragSource = null;
	var dropIndex = null;
	
	mxEvent.addListener(div, 'dragover', function(evt)
	{
		evt.dataTransfer.dropEffect = 'move';
		dropIndex = 0;
		evt.stopPropagation();
		evt.preventDefault();
	});
	
	// Workaround for "no element found" error in FF
	mxEvent.addListener(div, 'drop', function(evt)
	{
		evt.stopPropagation();
		evt.preventDefault();
	});

	var layerCount = null;
	var selectionLayer = null;
	var ldiv = document.createElement('div');
	
	ldiv.className = 'geToolbarContainer';
	ldiv.style.position = 'absolute';
	ldiv.style.bottom = '0px';
	ldiv.style.left = '0px';
	ldiv.style.right = '0px';
	ldiv.style.height = tbarHeight;
	ldiv.style.overflow = 'hidden';
	ldiv.style.padding = (!EditorUi.compactUi) ? '1px' : '4px 0px 3px 0px';
	ldiv.style.backgroundColor = (Dialog.backdropColor == 'white') ? 'whiteSmoke' : Dialog.backdropColor;
	ldiv.style.borderWidth = '1px 0px 0px 0px';
	ldiv.style.borderColor = '#c3c3c3';
	ldiv.style.borderStyle = 'solid';
	ldiv.style.display = 'block';
	ldiv.style.whiteSpace = 'nowrap';
	
	if (mxClient.IS_QUIRKS)
	{
		ldiv.style.filter = 'none';
	}
	
	var link = document.createElement('a');
	link.className = 'geButton';
	
	if (mxClient.IS_QUIRKS)
	{
		link.style.filter = 'none';
	}
	
	var removeLink = link.cloneNode();
	removeLink.innerHTML = '<div class="geSprite geSprite-delete" style="display:inline-block;"></div>';

	mxEvent.addListener(removeLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			try
			{
				var index = graph.model.root.getIndex(selectionLayer);
				graph.removeCells([selectionLayer], false);
				
				// Creates default layer if no layer exists
				if (graph.model.getChildCount(graph.model.root) == 0)
				{
					graph.model.add(graph.model.root, new mxCell());
					graph.setDefaultParent(null);
				}
				else if (index > 0 && index <= graph.model.getChildCount(graph.model.root))
				{
					graph.setDefaultParent(graph.model.getChildAt(graph.model.root, index - 1));
				}
				else
				{
					graph.setDefaultParent(null);
				}
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		removeLink.className = 'geButton mxDisabled';
	}
	
	ldiv.appendChild(removeLink);

	var insertLink = link.cloneNode();
	insertLink.setAttribute('title', mxUtils.trim(mxResources.get('moveSelectionTo', ['...'])));
	insertLink.innerHTML = '<div class="geSprite geSprite-insert" style="display:inline-block;"></div>';
	
	mxEvent.addListener(insertLink, 'click', function(evt)
	{
		if (graph.isEnabled() && !graph.isSelectionEmpty())
		{
			var offset = mxUtils.getOffset(insertLink);
			
			editorUi.showPopupMenu(mxUtils.bind(this, function(menu, parent)
			{
				for (var i = layerCount - 1; i >= 0; i--)
				{
					(mxUtils.bind(this, function(child)
					{
						var item = menu.addItem(graph.convertValueToString(child) ||
								mxResources.get('background'), null, mxUtils.bind(this, function()
						{
							graph.moveCells(graph.getSelectionCells(), 0, 0, false, child);
						}), parent);
						
						if (graph.getSelectionCount() == 1 && graph.model.isAncestor(child, graph.getSelectionCell()))
						{
							menu.addCheckmark(item, Editor.checkmarkImage);
						}
						
					}))(graph.model.getChildAt(graph.model.root, i));
				}
			}), offset.x, offset.y + insertLink.offsetHeight, evt);
		}
	});

	ldiv.appendChild(insertLink);
	
	var dataLink = link.cloneNode();
	dataLink.innerHTML = '<div class="geSprite geSprite-dots" style="display:inline-block;"></div>';
	dataLink.setAttribute('title', mxResources.get('rename'));

	mxEvent.addListener(dataLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			editorUi.showDataDialog(selectionLayer);
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		dataLink.className = 'geButton mxDisabled';
	}

	ldiv.appendChild(dataLink);
	
	function renameLayer(layer)
	{
		if (graph.isEnabled() && layer != null)
		{
			var label = graph.convertValueToString(layer);
			var dlg = new FilenameDialog(editorUi, label || mxResources.get('background'), mxResources.get('rename'), mxUtils.bind(this, function(newValue)
			{
				if (newValue != null)
				{
					graph.cellLabelChanged(layer, newValue);
				}
			}), mxResources.get('enterName'));
			editorUi.showDialog(dlg.container, 300, 100, true, true);
			dlg.init();
		}
	};
	
	var duplicateLink = link.cloneNode();
	duplicateLink.innerHTML = '<div class="geSprite geSprite-duplicate" style="display:inline-block;"></div>';
	
	mxEvent.addListener(duplicateLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			var newCell = null;
			graph.model.beginUpdate();
			try
			{
				newCell = graph.cloneCell(selectionLayer);
				graph.cellLabelChanged(newCell, mxResources.get('untitledLayer'));
				newCell.setVisible(true);
				newCell = graph.addCell(newCell, graph.model.root);
				graph.setDefaultParent(newCell);
			}
			finally
			{
				graph.model.endUpdate();
			}

			if (newCell != null && !graph.isCellLocked(newCell))
			{
				graph.selectAll(newCell);
			}
		}
	});
	
	if (!graph.isEnabled())
	{
		duplicateLink.className = 'geButton mxDisabled';
	}

	ldiv.appendChild(duplicateLink);

	var addLink = link.cloneNode();
	addLink.innerHTML = '<div class="geSprite geSprite-plus" style="display:inline-block;"></div>';
	addLink.setAttribute('title', mxResources.get('addLayer'));
	
	mxEvent.addListener(addLink, 'click', function(evt)
	{
		if (graph.isEnabled())
		{
			graph.model.beginUpdate();
			
			try
			{
				var cell = graph.addCell(new mxCell(mxResources.get('untitledLayer')), graph.model.root);
				graph.setDefaultParent(cell);
			}
			finally
			{
				graph.model.endUpdate();
			}
		}
		
		mxEvent.consume(evt);
	});
	
	if (!graph.isEnabled())
	{
		addLink.className = 'geButton mxDisabled';
	}
	
	ldiv.appendChild(addLink);
	div.appendChild(ldiv);	
	
	function refresh()
	{
		layerCount = graph.model.getChildCount(graph.model.root)
		listDiv.innerHTML = '';

		function addLayer(index, label, child, defaultParent)
		{
			var ldiv = document.createElement('div');
			ldiv.className = 'geToolbarContainer';

			ldiv.style.overflow = 'hidden';
			ldiv.style.position = 'relative';
			ldiv.style.padding = '4px';
			ldiv.style.height = '22px';
			ldiv.style.display = 'block';
			ldiv.style.backgroundColor = (Dialog.backdropColor == 'white') ? 'whiteSmoke' : Dialog.backdropColor;
			ldiv.style.borderWidth = '0px 0px 1px 0px';
			ldiv.style.borderColor = '#c3c3c3';
			ldiv.style.borderStyle = 'solid';
			ldiv.style.whiteSpace = 'nowrap';
			ldiv.setAttribute('title', label);
			
			var left = document.createElement('div');
			left.style.display = 'inline-block';
			left.style.width = '100%';
			left.style.textOverflow = 'ellipsis';
			left.style.overflow = 'hidden';
			
			mxEvent.addListener(ldiv, 'dragover', function(evt)
			{
				evt.dataTransfer.dropEffect = 'move';
				dropIndex = index;
				evt.stopPropagation();
				evt.preventDefault();
			});
			
			mxEvent.addListener(ldiv, 'dragstart', function(evt)
			{
				dragSource = ldiv;
				
				// Workaround for no DnD on DIV in FF
				if (mxClient.IS_FF)
				{
					// LATER: Check what triggers a parse as XML on this in FF after drop
					evt.dataTransfer.setData('Text', '<layer/>');
				}
			});
			
			mxEvent.addListener(ldiv, 'dragend', function(evt)
			{
				if (dragSource != null && dropIndex != null)
				{
					graph.addCell(child, graph.model.root, dropIndex);
				}

				dragSource = null;
				dropIndex = null;
				evt.stopPropagation();
				evt.preventDefault();
			});

			var btn = document.createElement('img');
			btn.setAttribute('draggable', 'false');
			btn.setAttribute('align', 'top');
			btn.setAttribute('border', '0');
			btn.style.padding = '4px';
			btn.setAttribute('title', mxResources.get('lockUnlock'));

			var style = graph.getCurrentCellStyle(child);

			if (mxUtils.getValue(style, 'locked', '0') == '1')
			{
				btn.setAttribute('src', Dialog.prototype.lockedImage);
			}
			else
			{
				btn.setAttribute('src', Dialog.prototype.unlockedImage);
			}
			
			if (graph.isEnabled())
			{
				btn.style.cursor = 'pointer';
			}
			
			mxEvent.addListener(btn, 'click', function(evt)
			{
				if (graph.isEnabled())
				{
					var value = null;
					
					graph.getModel().beginUpdate();
					try
					{
			    		value = (mxUtils.getValue(style, 'locked', '0') == '1') ? null : '1';
			    		graph.setCellStyles('locked', value, [child]);
					}
					finally
					{
						graph.getModel().endUpdate();
					}

					if (value == '1')
					{
						graph.removeSelectionCells(graph.getModel().getDescendants(child));
					}
					
					mxEvent.consume(evt);
				}
			});

			left.appendChild(btn);

			var inp = document.createElement('input');
			inp.setAttribute('type', 'checkbox');
			inp.setAttribute('title', mxResources.get('hideIt', [child.value || mxResources.get('background')]));
			inp.style.marginLeft = '4px';
			inp.style.marginRight = '6px';
			inp.style.marginTop = '4px';
			left.appendChild(inp);
			
			if (graph.model.isVisible(child))
			{
				inp.setAttribute('checked', 'checked');
				inp.defaultChecked = true;
			}

			mxEvent.addListener(inp, 'click', function(evt)
			{
				graph.model.setVisible(child, !graph.model.isVisible(child));
				mxEvent.consume(evt);
			});

			mxUtils.write(left, label);
			ldiv.appendChild(left);
			
			if (graph.isEnabled())
			{
				// Fallback if no drag and drop is available
				if (mxClient.IS_TOUCH || mxClient.IS_POINTER || mxClient.IS_VML ||
					(mxClient.IS_IE && document.documentMode < 10))
				{
					var right = document.createElement('div');
					right.style.display = 'block';
					right.style.textAlign = 'right';
					right.style.whiteSpace = 'nowrap';
					right.style.position = 'absolute';
					right.style.right = '6px';
					right.style.top = '6px';
		
					// Poor man's change layer order
					if (index > 0)
					{
						var img2 = document.createElement('a');
						
						img2.setAttribute('title', mxResources.get('toBack'));
						
						img2.className = 'geButton';
						img2.style.cssFloat = 'none';
						img2.innerHTML = '&#9660;';
						img2.style.width = '14px';
						img2.style.height = '14px';
						img2.style.fontSize = '14px';
						img2.style.margin = '0px';
						img2.style.marginTop = '-1px';
						right.appendChild(img2);
						
						mxEvent.addListener(img2, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index - 1);
							}
							
							mxEvent.consume(evt);
						});
					}
		
					if (index >= 0 && index < layerCount - 1)
					{
						var img1 = document.createElement('a');
						
						img1.setAttribute('title', mxResources.get('toFront'));
						
						img1.className = 'geButton';
						img1.style.cssFloat = 'none';
						img1.innerHTML = '&#9650;';
						img1.style.width = '14px';
						img1.style.height = '14px';
						img1.style.fontSize = '14px';
						img1.style.margin = '0px';
						img1.style.marginTop = '-1px';
						right.appendChild(img1);
						
						mxEvent.addListener(img1, 'click', function(evt)
						{
							if (graph.isEnabled())
							{
								graph.addCell(child, graph.model.root, index + 1);
							}
							
							mxEvent.consume(evt);
						});
					}
					
					ldiv.appendChild(right);
				}
				
				if (mxClient.IS_SVG && (!mxClient.IS_IE || document.documentMode >= 10))
				{
					ldiv.setAttribute('draggable', 'true');
					ldiv.style.cursor = 'move';
				}
			}

			mxEvent.addListener(ldiv, 'dblclick', function(evt)
			{
				var nodeName = mxEvent.getSource(evt).nodeName;
				
				if (nodeName != 'INPUT' && nodeName != 'IMG')
				{
					renameLayer(child);
					mxEvent.consume(evt);
				}
			});

			if (graph.getDefaultParent() == child)
			{
				ldiv.style.background =  (Dialog.backdropColor == 'white') ? '#e6eff8' : '#505759';
				ldiv.style.fontWeight = (graph.isEnabled()) ? 'bold' : '';
				selectionLayer = child;
			}
			else
			{
				mxEvent.addListener(ldiv, 'click', function(evt)
				{
					if (graph.isEnabled())
					{
						graph.setDefaultParent(defaultParent);
						graph.view.setCurrentRoot(null);
					}
				});
			}
			
			listDiv.appendChild(ldiv);
		};
		
		// Cannot be moved or deleted
		for (var i = layerCount - 1; i >= 0; i--)
		{
			(mxUtils.bind(this, function(child)
			{
				addLayer(i, graph.convertValueToString(child) ||
					mxResources.get('background'), child, child);
			}))(graph.model.getChildAt(graph.model.root, i));
		}
		
		var label = graph.convertValueToString(selectionLayer) || mxResources.get('background');
		removeLink.setAttribute('title', mxResources.get('removeIt', [label]));
		duplicateLink.setAttribute('title', mxResources.get('duplicateIt', [label]));
		dataLink.setAttribute('title', mxResources.get('editData'));

		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'geButton mxDisabled';
		}
	};

	refresh();
	graph.model.addListener(mxEvent.CHANGE, refresh);
	graph.addListener('defaultParentChanged', refresh);

	graph.selectionModel.addListener(mxEvent.CHANGE, function()
	{
		if (graph.isSelectionEmpty())
		{
			insertLink.className = 'geButton mxDisabled';
		}
		else
		{
			insertLink.className = 'geButton';
		}
	});

	this.window = new mxWindow(mxResources.get('layers'), div, x, y, w, h, true, true);
	this.window.minimumSize = new mxRectangle(0, 0, 120, 120);
	this.window.destroyOnClose = false;
	this.window.setMaximizable(false);
	this.window.setResizable(true);
	this.window.setClosable(true);
	this.window.setVisible(true);
	
	this.init = function()
	{
		listDiv.scrollTop = listDiv.scrollHeight - listDiv.clientHeight;	
	};

	this.window.addListener(mxEvent.SHOW, mxUtils.bind(this, function()
	{
		this.window.fit();
	}));
	
	// Make refresh available via instance
	this.refreshLayers = refresh;
	
	this.window.setLocation = function(x, y)
	{
		var iw = window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth;
		var ih = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
		
		x = Math.max(0, Math.min(x, iw - this.table.clientWidth));
		y = Math.max(0, Math.min(y, ih - this.table.clientHeight - 48));

		if (this.getX() != x || this.getY() != y)
		{
			mxWindow.prototype.setLocation.apply(this, arguments);
		}
	};
	
	var resizeListener = mxUtils.bind(this, function()
	{
		var x = this.window.getX();
		var y = this.window.getY();
		
		this.window.setLocation(x, y);
	});
	
	mxEvent.addListener(window, 'resize', resizeListener);

	this.destroy = function()
	{
		mxEvent.removeListener(window, 'resize', resizeListener);
		this.window.destroy();
	}
};
