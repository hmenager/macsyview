/*global $, FileReader, Mustache */

(function () {
    'use strict';
    function loadFile(textFile, loadedCallback) {
        var result = "";
        var chunkSize = 20000;
        var fileSize = textFile.size;

        function readBlob(file, offset) {
            var stop = offset + chunkSize - 1;
            if (stop > (fileSize - 1)) {
                stop = fileSize - 1;
            }
            var reader = new FileReader();
            // If we use onloadend, we need to check the readyState.
            reader.onloadend = function (evt) {
                if (evt.target.readyState === FileReader.DONE) { // DONE == 2
                    result += evt.target.result;
                    if (stop < fileSize - 1) {
                        offset = offset + chunkSize;
                        evt = null;
                        readBlob(file, offset);
                    } else {
                        loadedCallback(result);
                    }
                }
            };
            var blob = file.slice(offset, stop + 1);
            reader.readAsBinaryString(blob);
        }
        readBlob(textFile, 0);
    }

    var viewContainer = $("#mainView");

    var displayView = function (viewName, context) {
        viewContainer.html('');
        var template = $('#' + viewName).text();
        viewContainer.html(Mustache.render(template, context));
    };

    var displaySelectForm = function () {
        displayView('runSelectForm', {});
        $('#systemMatchesLinkList').hide();
        $('#directory').change(directorySelectionHandler);
    };

    var listSystemMatchFiles = function (files) {
        var systemMatchRE = /([A-Za-z0-9]+)_([A-Za-z0-9]+)_([A-Za-z0-9]+)\.json/;
        var systemMatchFiles = [];
        for (var i = 0, len = files.length; i < len; i++) {
            var match = systemMatchRE.exec(files[i].name)
            if (match) {
                systemMatchFiles.push({
                    'file': files[i],
                    'replicon_name': match[1],
                    'system_name': match[2],
                    'occurence_number': match[3],
                    'id': files[i].name
                });
            }
        }
        return systemMatchFiles;
    };

    var displaySystemMatchFileDetail = function (systemMatch) {
        loadFile(systemMatch.file, function (contentsText) {
            var doc = JSON.parse(contentsText);
            doc.matchedGenes = doc.genes.filter(function (gene) {
                return ('match' in gene);
            });
            displayView('systemMatchDetail', doc);
        });
    };



    var initSystemMatchSelectionHandler = function (systemMatchFiles) {
        $(".txsview-systemmatchtablerow td").click(function (e) {
            var id = $(e.currentTarget).parent().attr('data-systemmatchid');
            var selectedSystemMatchFile = systemMatchFiles.filter(function (systemMatchFile) {
                return systemMatchFile.id == id;
            })[0];
            displaySystemMatchFileDetail(selectedSystemMatchFile);
        });
    };

    var directorySelectionHandler = function (e) {
        var files = e.target.files;
        var systemMatchFiles = listSystemMatchFiles(files);
        displayView('systemMatchesList', {
            'files': systemMatchFiles
        });
        initSystemMatchSelectionHandler(systemMatchFiles);
    };

    $(document).ready(function () {
        displaySelectForm();
        $('#homeLink').click(displaySelectForm);

    });
}());