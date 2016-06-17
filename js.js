var Main = angular.module('ArikkariHelper', []);

Main.controller('ArikkariHelperCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.Status = {0:'notstarted', 1:'ongoing', 2:'cleared'};
	
	$scope.Quests = [];
	$scope.Maps = [];

	$scope.mapShown = true;
	$http.get('https://koinichi.github.io/MS2DailiesHelper/maps.json').success( function (map_res) {
		$scope.Maps = map_res;
		for (var map in $scope.Maps) {
			$scope.Maps[map].quests = [];
            if (map[1] == '2') {
                if (map[3] == '0') { $scope.Maps[map].cont = 0; } // victoria island
                if (map[3] == '1') { $scope.Maps[map].cont = 2; } // karkar island
            }
            if (map[1] == '3') { $scope.Maps[map].cont = 1; } // darkness island
		}
		$http.get('https://koinichi.github.io/MS2FishingHelper/quests.json').success( function (quest_res) {
			$scope.Quests = quest_res;
			for (i=0; i<$scope.Quests.length; i++) {
				var status = getCookie($scope.Quests[i].id);
                $scope.Quests[i].status = 0;
				if (status == 0 || status == 'notstarted') { $scope.Quests[i].status = 0; }
				if (status == 1 || status == 'ongoing') {
					$scope.Quests[i].status = 1;
					for (j=0; j<$scope.Quests[i].map.length; j++) {
						$scope.Maps[$scope.Quests[i].map[j]].quests.push($scope.Quests[i].desc);
					}
				}
				if (status == 2 || status == 'cleared') { $scope.Quests[i].status = 2; }
			}
		});
	});
	
	$scope.Quests.sort( function(a, b) {
        var a_k, b_k;
        for (var i=0;;i++) {
    		a_k = a.desc.charCodeAt(i);
		    b_k = b.desc.charCodeAt(i);
            if (a_k != b_k) {
                break;
            }
        }
		return (a_k > b_k ? 1 : -1);
	});
	
	$scope.init = function () {
		if (getCookie('visited') < 11) {
			$scope.currentScreen = 2;
			setCookie('visited', '11', 365);
		}
        else {
			$scope.currentScreen = 0;
        }
	}
	
	$scope.currentScreen = 0;
	$scope.viewMap = function(e) {
        if ($scope.mapShown) {
            $('#my-quest-wrap').hide();
            $('#worldmap-wrap').css('width', '98%');
        }
        else {
            $('#my-quest-wrap').show();
            $('#worldmap-wrap').css('width', '85%');
        }
        $scope.mapShown = !$scope.mapShown;
	}
	
	
	$scope.keydownHandler = function(e) {
		if (e.keyCode == 27) { // ESC
			$scope.currentScreen = 0;
		}
		if (e.keyCode == 72) { // H
			if ($scope.currentScreen == 2) {
				$scope.currentScreen = 0;
			}
			else { 
				$scope.currentScreen = 2;
			}
		}
        if (e.keyCode == 77) { // M
            $scope.viewMap();
        }
	}
	
	$scope.toggleQuest = function(e) {
		e.stopPropagation();
		var id = parseInt(e.target.attributes['name'].value)
		for (i=0; i<$scope.Quests.length; i++) {
			if ($scope.Quests[i].id == id) {
				if ($scope.Quests[i].status == 0) {
					$scope.Quests[i].status = 1;
					setCookie(id, '1', 365);
				}
				else if ($scope.Quests[i].status == 1) {
					$scope.Quests[i].status = 0;
					setCookie(id, '0', 365);
				}
				break;
			}
		}
	};
	$scope.confirmClearAll = true;
    $scope.clearAllQuests = function(e) {
		if ($scope.confirmClearAll) {
            e.currentTarget.innerHTML = '진짜로?';
        	$scope.confirmClearAll = false;    
        }
        else {
		    for (i=0; i<$scope.Quests.length; i++) {
                if ($scope.Quests[i].status == 1) {
                    $scope.Quests[i].status = 2;
                    setCookie($scope.Quests[i].id, '2', 365);
                }
            }
            e.target.innerHTML = '모든 퀘스트 완료하기';
        	$scope.confirmClearAll = true;
        }
    };
	$scope.confirmRemoveAll = true;
    $scope.removeClearedQuests = function(e) {
		if ($scope.confirmRemoveAll) {
            e.currentTarget.innerHTML = '진짜로?';
        	$scope.confirmRemoveAll = false;    
        }
        else {
		    for (i=0; i<$scope.Quests.length; i++) {
                if ($scope.Quests[i].status == 2) {
                    $scope.Quests[i].status = 0;
                    setCookie($scope.Quests[i].id, '0', 365);
                }
            }
            e.target.innerHTML = '완료한 퀘스트 정리하기';
        	$scope.confirmRemoveAll = true;
        }
    };
	
	$scope.showMapList = function(e) {
		e.stopPropagation();
		$('#my-quest-map-list').remove();
		var id = parseInt(e.target.attributes['name'].value);
		var $mapList = $('<ul id="my-quest-map-list">');
		for (i=0; i<$scope.Quests.length; i++) {
			if ($scope.Quests[i].id == id) {
				for (j=0; j<$scope.Quests[i].map.length; j++) {
					var $li = $('<li class="my-quest-map-list-item">').text($scope.Maps[$scope.Quests[i].map[j]].name);
					$mapList.append($li);
					console.log($scope.Maps[$scope.Quests[i].map[j]].name);
				}
            break;
			}
		}
		$(e.target).parent().append($mapList);
	}
	
	$scope.hideMapList = function(e) {
		e.stopPropagation();
		$('#my-quest-map-list').remove();
	}
}]);

Main.filter('listFilter', [function() {
	return function(list, word) {
		if (word == undefined) {
			word = "";
		}
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].desc.toLowerCase().indexOf(word.toLowerCase()) >= 0) {
				ret.push(list[i]);
			}
		}
		return ret;
	};
}]);

Main.filter('myquestFilter', [function() {
	return function(list) {
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].status == '1' || list[i].status == '2') {
				ret.push(list[i]);
			}
		}
		return ret;
	};
}]);

Main.filter('ongoingFilter', [function() {
	return function(list) {
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].status == 1) {
				ret.push(list[i]);
			}
		}
		return ret;
	};
}]);

Main.filter('clearedFilter', [function() {
	return function(list) {
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].status == 2) {
				ret.push(list[i]);
			}
		}
		return ret;
	};
}]);

Main.filter('notstartedFilter', [function() {
	return function(list) {
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].status == 0) {
				ret.push(list[i]);
			}
		}
		return ret;
	};
}]);


Main.filter('ongoingMapFilter', [function() {
	return function(list) {
		var ret = [];
		for (i=0; i<list.length; i++) {
			if (list[i].status == 1) {
				for (j=0; j<list[i].map.length; j++) {
					if (ret.indexOf(list[i].map[j]) < 0) {
						ret.push(list[i].map[j]);
					}
				}
			}
		}
		return ret
	};
}]);

var tappedOnExcl = false;
Main.directive('hovertoshow', function() {
    return {
        link : function(scope, elem, attrs) {
            elem.bind('mouseenter', function() {
                $('ul[name=' + elem[0].name + ']').css('visibility', 'visible');
            });
            elem.bind('mouseleave', function() {
                $('ul[name=' + elem[0].name + ']').css('visibility', 'hidden');
            });
            elem.bind('touchstart', function(e) {
                $('ul[name=' + elem[0].name + ']').css('visibility', 'visible');
                tappedOnExcl = true;
            });
        }
    };
});

Main.directive('renderExcl', ['$timeout',  function($timeout) {
    return {
        link : function(scope, elem, attrs) {
            $timeout(showExcl, 0);
        }
    };
}]);

String.prototype.getHashCode = function() {
	var hash = 0;
	for (i=0; i<this.length; i++) {
		hash = ((hash<<5) - hash + this.charCodeAt(i)) % 0x7fffffff;
	}
	return hash ;
}
String.prototype.getTail = function() {
	return (this.charCodeAt(0)-44032) % 28;
}

String.prototype.truncate = function(l) {
	return (this.length > l) ? '...' + this.substring(this.length-l,this.length) : this;
};

