//
// Copyright 2017. Aliasworlds. All rights reserved.
//
// This script exports layers as separate PNG files.
//

#target photoshop
app.bringToFront();

///////////////////////////////////////////////////////////////////////////////
// Hide all layers:
///////////////////////////////////////////////////////////////////////////////
function hideAllLayers(){
    app.runMenuItem(stringIDToTypeID('selectAllLayers'));

    var idHd = charIDToTypeID( "Hd  " );
        var desc3 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var list1 = new ActionList();
                var ref2 = new ActionReference();
                var idLyr = charIDToTypeID( "Lyr " );
                var idOrdn = charIDToTypeID( "Ordn" );
                var idTrgt = charIDToTypeID( "Trgt" );
                ref2.putEnumerated( idLyr, idOrdn, idTrgt );
            list1.putReference( ref2 );
        desc3.putList( idnull, list1 );
    executeAction( idHd, desc3, DialogModes.NO );
}

///////////////////////////////////////////////////////////////////////////////
// Message box:
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// Just count visible layers:
///////////////////////////////////////////////////////////////////////////////
function calcVisibleLayers(){
    var visibleLayers = 0;
    var docLayers = doc.layers; // to spee up the loop
    var docLayersLength = doc.layers.length; // to spee up the loop
    for (i = 0; i < docLayersLength; i++){
        if (docLayers[i].visible){
            visibleLayers++;
        }
    }
    return visibleLayers
}

///////////////////////////////////////////////////////////////////////////////
// Create main form:
///////////////////////////////////////////////////////////////////////////////
function createMainForm(){
    var form = new Window ('dialog', "Export layers as images")
    form.preferredSize.width = 400;
    form.preferredSize.height = 360;
    form.orientation = 'column';
    form.spacing = 12
    form.margins = 12
    //-----------------------------------------------------------------------------
    var pathPanel = form.add('panel', undefined, "Path To Export")
    pathPanel.alignment = 'fill';
    pathPanel.alignChildren = 'left';
    pathPanel.spacing = 0
    pathPanel.margins.top = 16

    var pathExport = pathPanel.add('statictext', undefined, pathToExportCurrent.fsName + "\\Export_" + doc.name + "\\");
    pathExport.preferredSize.height = 22

    var checkPathSame = pathPanel.add('radiobutton', undefined,"Export to the same folder");

    var selectPathGroup = pathPanel.add('group',undefined,"Group")
    selectPathGroup.orientation = 'row'
    var checkPathSelected = selectPathGroup.add('radiobutton', undefined,"");
    var btnSelectPath = selectPathGroup.add('button', undefined,"Brouse...");

    checkPathSame.value = true;
    checkPathSelected.value = false;
    //-----------------------------------------------------------------------------
    var layersPanel = form.add('panel', undefined, "Layers To Export")
    layersPanel.alignment = 'fill';
    layersPanel.alignChildren = 'left';
    layersPanel.spacing = 0
    layersPanel.margins.top = 16
    var checkLayersAll = layersPanel.add('radiobutton', undefined, "All layers (" +doc.artLayers.length + ")");
    var checkLayersVisible = layersPanel.add('radiobutton', undefined, "Visible layers only (" + calcVisibleLayers() + ")");
    checkLayersAll.value = true;
    checkLayersVisible.value = false;
    //-----------------------------------------------------------------------------
    var optionsPanel = form.add("panel", undefined, "Options")
    optionsPanel.alignment = 'fill';
    optionsPanel.alignChildren = 'left';
    optionsPanel.spacing = 0
    optionsPanel.margins.top = 16

    var trimGroup = optionsPanel.add('group')
    selectPathGroup.orientation = 'row'
    var checkTrim = trimGroup.add('checkbox', undefined,"Trim");
    var checkTrimBorder = trimGroup.add('checkbox', undefined,"Add borders");
    checkTrimBorder.enabled = false;
    var editTrimBorder = trimGroup.add('edittext', undefined,1);
    editTrimBorder.enabled = false;
    editTrimBorder.characters = 2
    var checkTrimRound = optionsPanel.add('checkbox', undefined,"Round to even");
     //-----------------------------------------------------------------------------
    var positionPanel = form.add("panel", undefined, "Position")
    positionPanel.alignment = 'fill';
    positionPanel.alignChildren = 'left';
    positionPanel.spacing = 0
    positionPanel.margins.top = 16
    
    var positionGroup = positionPanel.add('group')
    selectPathGroup.orientation = 'row'
    var exportPosition = positionGroup.add('checkbox', undefined,"Export position (top left)");
    var exportPositionCenter = positionGroup.add('checkbox', undefined,"From center");
    exportPositionCenter.enabled = false;
     //-----------------------------------------------------------------------------
     
    var btnRun = form.add ('button', undefined, "Run")
    btnRun.bounds = [0,0,100,40]
    var btnCancel = form.add ('button', undefined, "Cancel")
    btnRun.bounds = [0,0,100,25]

    checkPathSelected.onClick = function(){checkPathSame.value = false; }
    checkPathSame.onClick = function(){
        checkPathSelected.value = false; 
        pathExport.text = pathToExportCurrent.fsName + "\\Export_" + doc.name + "\\";
        pathToexport = pathToExportCurrent;// + "/Export_" + doc.name + "/";
    }
    checkTrim.onClick = function(){
            checkTrimBorder.enabled = checkTrim.value;
            editTrimBorder.enabled = checkTrim.value;   
    }
    exportPosition.onClick = function(){
            exportPositionCenter.enabled = exportPosition.value;
    }
    btnSelectPath.onClick = function(){
        checkPathSame.value = false;
        checkPathSelected.value = true;
        pathToExportSelected = Folder.selectDialog ('Salect Destination');
        if (pathToExportSelected != null){
            pathExport.text = pathToExportSelected.fsName;
            pathToExport = pathToExportSelected;
        }    
    }
    btnRun.onClick = function(){
        form.close();
        exportFiles(pathToExport, checkPathSame.value, checkLayersVisible.value, checkTrim.value, checkTrimBorder.value, editTrimBorder.text, checkTrimRound.value, exportPosition.value, exportPositionCenter.value);
    }
    
    form.show()
}
///////////////////////////////////////////////////////////////////////////////
// Export files:
///////////////////////////////////////////////////////////////////////////////
function exportFiles(path, pathSame, removeHidden, trim, borders, bordersValue, round, saveINI, centered){
    var start = new Date;
    var exportedFiles = 0;
    app.activeDocument.duplicate();
    var doc2 = activeDocument;
    var doc2Layers = activeDocument.artLayers;
    var doc2LayersLength = activeDocument.artLayers.length;
    var positionArray = [];
    //app.runMenuItem(stringIDToTypeID('selectNoLayers'));
    
    // delete hidden layers:
    if(removeHidden){
        for (i = 0; i < activeDocument.layers.length; i++){
            if(!activeDocument.layers[i].visible){
                activeDocument.activeLayer = activeDocument.artLayers[i];
                activeDocument.activeLayer.remove();
                i = i-1;
            }
        }
    doc2Layers = activeDocument.artLayers;
    doc2LayersLength = activeDocument.artLayers.length;
    }

    //Create forlder for the same path:
    if(pathSame){
        var saveToFolder = new Folder(doc.path + "/Export_" + doc.name);
        saveToFolder.create();
        path = saveToFolder;
        //alert(path)
    }
    
    // Set png options
    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.interlaces = false;
    pngSaveOptions.compression = 9;
    
    // Save files:
    for (i = 0; i < doc2LayersLength; i++){
        hideAllLayers();
        doc2Layers[i].visible = true;
        
        // calc centers
        if(saveINI){
            var layerCenterX = (doc2Layers[i].bounds[2] - doc2Layers[i].bounds[0])/2 + doc2Layers[i].bounds[0];
            var layerCenterY = (doc2Layers[i].bounds[3] - doc2Layers[i].bounds[1])/2 + doc2Layers[i].bounds[1];
            if(centered){
                layerCenterX = layerCenterX - doc2.width/2;
                layerCenterY = layerCenterY - doc2.height/2;
            }
            layerCenterX = Math.round (layerCenterX.value);
            layerCenterY = Math.round (layerCenterY.value);
            var deep = doc2LayersLength - i
            positionArray.push ('['+doc2Layers[i].name+']' + '\n' + 'deep = '+deep + '\n' +'position = '+ layerCenterX+', '+layerCenterY + '\n\n');
        }
                                                
        if(trim){
            // save history snapshot
            doc2Layers[i].rasterize(RasterizeType.ENTIRELAYER); // lifehack for smart objects
            doc2.trim (TrimType.TRANSPARENT);
            if(borders){
                doc2.resizeCanvas (doc2.width.value+Number(bordersValue)*2, doc2.height.value+Number(bordersValue)*2)
            }
        }
        if(round){
            if (doc2.width.value % 2 > 0){
                doc2.resizeCanvas (doc2.width.value+1, doc2.height.value)
            }
            if (doc2.height.value % 2 > 0){
                doc2.resizeCanvas (doc2.width.value, doc2.height.value+1)
            }
        }
        var saveToFile = new File (path + "/" + doc2Layers[i].name + ".png"); // file name and path        
        doc2.saveAs (saveToFile, pngSaveOptions, true, Extension.LOWERCASE); // save a copy
        //doc2Layers[i].visible = false;
        //exportedFiles++;
        if(trim){
            // restore snapshot history if trimmed
            doc2.activeHistoryState = doc2.historyStates[1]         
        }
        //doc2Layers[i].visible = false;
        exportedFiles++;
    }

    // Save INI:
    if(saveINI){
        var iniFile = new File (path + "/" + "Positions" + ".ini"); // file name and path        
        iniFile.open('w');
        iniFile.write(positionArray.join(''));
        iniFile.close();
    }

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES)
    var end = new Date;
    alert (exportedFiles + " files exported successfully\n("+(end-start)/1000+")s","Done");
}

if (app.documents.length >0){
    var doc = app.activeDocument;
    var docPathName = app.activeDocument.path.fsName;
    var pathToExportCurrent = doc.path 
    var pathToExportSelected;
    var pathToExport = pathToExportCurrent;
    
    createMainForm ();
    
}else{
    alert ("You must have a document open.\nOpen a document and try again.", "Error")
}