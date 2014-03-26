/*
 * macsyview.view
 * view module for macsyview
 */

/* jslint   browser : true, continue : true,
  devel  : true, indent  : 4,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

/*global $, macsyview, Mustache, console*/

macsyview.view = (function () {
    'use strict';

    var config = {
        viewContainer: "#mainView",
        directory: "#directory",
        homeLink: "#homeLink",
        systemMatchesLinkList: "#systemMatchesLinkList"
    },

        viewContainer = $(config.viewContainer),

        displayView = function (viewName, context) {
            viewContainer.html('');
            var template = $('#' + viewName).text();
            viewContainer.html(Mustache.render(template, context));
        },

        sortByKeys = function (keys) {
            return function(item1, item2) {
                var cmpRes = 0,
                    keysHere = keys.slice(),
                    currentKey;
                while(cmpRes === 0 && keysHere.length>0){
                    currentKey = keysHere.shift();
                    cmpRes = item1[currentKey].localeCompare(item2[currentKey]);
                }
                return cmpRes;
            }
        },
        
        displaySystemMatchFileDetail = function (doc) {
            doc.matchedGenes = doc.genes.filter(function (gene) {
                return ('match' in gene);
            });
            displayView('systemMatchDetail', doc);
        },

        initSystemMatchSelectionHandler = function () {
            $(config.viewContainer + " .txsview-systemmatchtablerow td").click(function (e) {
                var id = $(e.currentTarget).parent().attr('data-systemmatchid');
                macsyview.go('detail:' + macsyview.data.list().macsyviewId + ":" + id);
            });
        },

        displaySystemMatches = function (sortKeys) {
            var list = macsyview.data.list();
            list.sort(sortByKeys(sortKeys));
            var tplData = {
                'files': list,
                'sortKey': sortKeys[0]
            };
            switch(sortKeys[0]){
                case "repliconName":
                    tplData["sortBySystemLink"] = "list:" + macsyview.data.list().macsyviewId + ":by_system";
                    break;
                case "systemName":
                    tplData["sortByRepliconLink"] = "list:" + macsyview.data.list().macsyviewId + ":by_replicon";
                    break;
            }
            displayView('systemMatchesList', tplData);
            initSystemMatchSelectionHandler();
        },

        fileSelectionHandler = function (e) {
            var jsonFile = e.target.files[0];
            macsyview.data.load(jsonFile, function () {
                macsyview.go("list:" + macsyview.data.list().macsyviewId + ":by_replicon");
            });
        },

        displaySelectForm = function () {
            macsyview.data.reset();
            $(config.systemMatchesLinkList).hide();
            displayView('runSelectForm', {});
            $(config.directory).change(fileSelectionHandler);
        },
    
        init = function () {
            $(config.homeLink).click(displaySelectForm);
            $(config.systemMatchesLinkList).click(displaySystemMatches);
            displaySelectForm();
        };
    
    return {
        'config': config,
        'init': init,
        'displaySelectForm': displaySelectForm,
        'displaySystemMatches': displaySystemMatches,
        'displaySystemMatchFileDetail': displaySystemMatchFileDetail
    };

}());