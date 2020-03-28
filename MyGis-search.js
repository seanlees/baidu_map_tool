if (typeof jQuery === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires jQuery')
}

//插件
(function ($, window, document) {

    var that = $.fn.myGis.Constructor.prototype.Search = new Search();

    var _content = {
        elementId: "map-left-panel",
        register: function (div) {
            var $root = $("#" + this.elementId);
            $root.append(div);
        },
        build: function (div) {
            this.rootElement();
        },
        rootElement: function (callback) {
            var div = `
                <div id="${this.elementId}" class="">
                <div id="searchbox" class="clearfix">
                    <div id="searchbox-container">
                        <div id="sole-searchbox-content" class="searchbox-content" style="display: block;">
                            <input id="sole-input" class="searchbox-content-common" type="text" name="word"
                                   autocomplete="off" maxlength="256" placeholder="搜地点、查公交、找路线" value="">
                            <div class="input-clear" title="清空" style="display: none;"></div>
                            <div class="searchbox-content-button right-button route-button loading-button"
                                 data-title="路线" data-tooltip="1">
                            </div>
                        </div>
                        <div id="route-searchbox-content" class="searchbox-content route-searchbox-content bus"
                             style="display: none;">
                            <div class="route-header">
                                <div class="searchbox-content-common route-tabs">
                                    <div class="tab-item bus-tab" data-index="bus"><i></i><span>路线</span></div>
                                    <!--<div class="tab-item bus-tab" data-index="bus"><i></i><span>公交</span></div>
                                    <div class="tab-item drive-tab" data-index="drive"><i></i><span>驾车</span></div>
                                    <div class="tab-item walk-tab" data-index="walk"><i></i><span>步行</span></div>
                                    <div class="tab-item bike-tab" data-index="bike"><i></i><span>骑行</span></div>
                                    <div class="arrow-wrap"></div>-->
                                </div>
                                <div class="searchbox-content-button right-button cancel-button loading-button"
                                     data-title="关闭路线" data-tooltip="2"></div>
                            </div>
                            <div class="routebox">
                                <div class="searchbox-content-common routebox-content">
                                    <div class="routebox-revert" title="切换起终点">
                                        <div class="routebox-revert-icon"></div>
                                    </div>
                                    <div class="routebox-inputs">
                                        <div class="routebox-input route-start">
                                            <div class="route-input-icon"></div>
                                            <input id autocomplete="off" maxlength="256" placeholder="输入起点"
                                                   class="route-start-input" type="text" value="">
                                            <div class="input-clear" title="清空" style="display: none;"></div>
                                            <div class="route-input-add-icon"></div>
                                        </div>
                                        <div class="routebox-input route-end">
                                            <div class="route-input-icon"></div>
                                            <input autocomplete="off" maxlength="256" placeholder="输入终点"
                                                   class="route-end-input" type="text" value="">
                                            <div class="input-clear" title="清空" style="display: none;"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button id="search-button" data-title="搜索" data-tooltip="3"></button>
                    <div id="toast-wrapper">
                        <div id="toast">
                            <img class="info-tip-img" src="//map.baidu.com/wolfman/static/common/images/transparent.gif"
                                 alt="">
                            <span class="info-tip-text"></span>
                        </div>
                    </div>
                </div>
                <ul id="cards-level0" class="cardlist"></ul>
                <ul id="cards-level1" class="cardlist">
                    <li id="card-9" class="card animated-card" data-fold="展开"
                        style="padding: 0px; z-index: 99; max-height: 259px;display: none">
                        <div class="history-route">
                            <ul>
                               <!-- <li title="新乡市 - 郑州市" data-index="0"><i class="his-route-icon">新乡市 - 郑州市</i></li>-->
                            </ul>
                        </div>
                    </li>
                </ul>
                <ul id="cards-level2" class="cardlist" style="display: none;">
                    <li id="card-4" class="card animated-card" data-fold="展开"
                        style="padding: 0px; z-index: 100; max-height: 353px;">
                        <div id="nav_container">
                            <div id="navtrans_content">
                                <div class="nav_routes">
                                    <!--<div class="navtrans-navlist-view active  navtrans-type-nav" data-index="0">
                                        <div class="navtrans-navlist-title">
                                            <div class="navtrans-navlist-label"> 推荐</div>
                                            <span class="navtrans-navlist-arrow"></span>
                                            <p class="navtrans-navlist-title-p title-info"><span>1小时20分钟</span><span
                                                    class="">89.4公里</span><span class="last">9个红绿灯</span></p>
                                            <p class="navtrans-navlist-title-p"><span class="last">途经：京港澳高速、陇海快速路</span>
                                            </p>
                                        </div>
                                        <div class="navtrans-navlist-content">
                                            <div class="navtrans-navlist-actions" style="display:none"></div>
                                            <ul class="navtrans-navlist-list">
                                                <li class="list-start" data-stopindex="0"><a data-name="新乡市"
                                                                                             data-uid="eacdddd0266fb36676e5b6e7"
                                                                                             data-point="12683161.69,4181146.47"
                                                                                             data-poitype="FF0201"
                                                                                             data-direction="0"
                                                                                             href="javascript:void(0);"
                                                                                             class="list_street_view_poi"
                                                                                             style="visibility: visible;"
                                                                                             data-thumbnail="//mapsv0.bdimg.com//pr/?qt=poiprv&amp;uid=eacdddd0266fb36676e5b6e7&amp;width=100&amp;height=75&amp;quality=80&amp;fovx=80&amp;udt=20200113"
                                                                                             data-pid="09028400011607051020586065T"
                                                                                             data-pname="新乡市"
                                                                                             data-px="12683164"
                                                                                             data-py="4180917"
                                                                                             data-paddr="新乡市"
                                                                                             data-pheading="358"
                                                                                             data-pfrom="nav"><img
                                                        src="/wolfman/static/common/images/transparent.gif"></a> <span
                                                        class="navtrans-navlist-icon nav-st"></span>
                                                    <div class="navtrans-navlist-list-content">新乡市</div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>-->
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>`;
            $("body").append(div);
        }
    };

    //内部对象
    function Search() {
        this.parent = null;
        this.localSearch = null;
        this.drivingRoute = null;
        this.searchRouteClick = false;
        this.dragPloyline = [];
    }

    //初始化DOM, 私有方法
    Search.prototype._initContent = function (callback) {
        _content.build(callback);
    };

    //组件初始化，会调用initContent
    Search.prototype.init = function (parent, callback) {
        this.parent = parent;
        if (!this.parent.options.search || !this.parent.options.search.enable) {
            return;
        }
        this._initContent(callback); //初始化HTML
        this.registerEvent();
    }

    Search.prototype.registerEvent = function () {
        if (this.parent.options.search.route && this.parent.options.search.route.enable) {
            $(document).on("click", ".route-button", function () {
                $("#sole-searchbox-content").hide();
                $("#route-searchbox-content").show();
                $(".route-end-input").val($("#sole-input").val());
                $(".history-route").parent().hide();
                $("#cards-level2").hide();
            });
        }
        $(document).on("click", ".cancel-button", function () {
            $("#sole-searchbox-content").show();
            $("#route-searchbox-content").hide();
            $(".route-start-input").val('');
            $(".route-end-input").val('');
            $(".history-route").parent().hide();
            $("#cards-level2").hide();
        });
        $(document).on("input", "#sole-input, .route-end-input, .route-start-input", function () {
            var txt = $(this).val();
            if (txt) {
                $(this).next().show();
            } else {
                $(".history-route").parent().hide();
                $(this).next().hide();
            }
        });
        $(document).on("click", ".routebox-revert", function () {
            var start = $(".route-start-input").val();
            var end = $(".route-end-input").val();
            $(".route-start-input").val(end);
            $(".route-end-input").val(start);
        });
        $(document).on("click", ".input-clear", function () {
            $(this).prev().val('');
            $(".history-route").parent().hide();
        });
        $(document).on("click", "#search-button", function () {
            var map = that.parent.data.bdmapInstance;
            if (!$("#sole-searchbox-content").is(":hidden")) {
                var txt = $("#sole-input").val();
                if (!txt) {
                    $("#sole-input").focus();
                    return;
                }
                that.searchPoi(map, $("#sole-input").val(), function (poi) {
                    that.searchPoiResult(map, poi);
                });
            } else {
                var start = $(".route-start-input").val();
                var end = $(".route-end-input").val();
                if (!start) {
                    $(".route-start-input").focus();
                }
                if (!end) {
                    $(".route-end-input").focus();
                }
                $("#cards-level2").toggle();

                that.searchRouteClick = true;
                $.each(that.dragPloyline, function (i, p) {
                    //map.removeOverlay(p);
                    p.remove();
                });
                that.searchRoute(map, start, end);
            }
        });
    };

    //线路搜索HTML
    Search.prototype.searchPoiResult = function (map, poi) {
        var $historyPanel = $(".history-route");
        //移除老的内容
        $(".history-route").children("ul").children("li").remove();
        $.each(poi, function (i, p) {
            var $li = $('<li title="" data-lat="" data-lng="" data-index="0"><i class="his-route-icon">'
                + p.name + '-' + p.address + '</i></li>');
            $li.data("lat", p.lat);
            $li.data("lng", p.lng);

            $historyPanel.children("ul").append($li);
        });

        $(".history-route").children("ul").on("click", "li", function () {
            var point = new BMap.Point($(this).data("lng"), $(this).data("lat"));
            map.panTo(point);
            var mk = new BMap.Marker(point);
            map.addOverlay(mk);
        });

        if ($historyPanel.parent().is(":hidden")) {
            $historyPanel.parent().show();
        }
    };

    Search.prototype.searchPoi = function (map, address, callback) {
        if (!this.localSearch) {
            var search = new BMap.LocalSearch(map, {
                onSearchComplete: function (result) {
                    if (result != null) {
                        var list = [];
                        for (var i = 0, len = result.getCurrentNumPois(); i < len; i++) {
                            var poi = result.getPoi(i);
                            if (poi.type == BMAP_POI_TYPE_BUSSTOP) {
                                poi.address = poi.title
                            }
                            poi.name = poi.title;
                            poi.lat = poi.point.lat;
                            poi.lng = poi.point.lng;
                            list.push(poi)
                        }
                        callback(list)
                    }
                },
                pageCapacity: 20
            });
            this.localSearch = search;
        }
        this.localSearch.search(address)
    };

    Search.prototype.searchRouteResult = function (result) {
        var $routeNavList = $(".nav_routes");
        //移除老的内容
        $routeNavList.children().remove();
        $.each(result, function (i, p) {
            var ele = `<div class="navtrans-navlist-view active  navtrans-type-nav" data-index="${i + 1}">
                                <div class="navtrans-navlist-title">
                                    <div class="navtrans-navlist-label"> 方案${i + 1}</div>
                                    <span class="navtrans-navlist-arrow"></span>
                                    <p class="navtrans-navlist-title-p title-info">
                                        <span>${p.distance}</span>
                                        <span class="">${p.duration}</span>
                                    </p>
                                </div>
                            </div>`;
            $routeNavList.append(ele);
        });
        /*  $(".history-route").children().on("click", "li", function () {
              var point = new BMap.Point($(this).data("lng"), $(this).data("lat"));
              map.panTo(point);
              var mk = new BMap.Marker(point);
              map.addOverlay(mk);
          });*/
    }

    Search.prototype.searchRoute = function searchRoute(map, start, end, callback) {
        if (!this.drivingRoute) {
            var driving = new BMap.DrivingRoute(map, {
                renderOptions: {
                    map: map,
                    autoViewport: true,
                    enableDragging: true //起终点可进行拖拽
                }
            });
            this.drivingRoute = driving;
            driving.setPolylinesSetCallback(function (routes) {
                if (!that.searchRouteClick) {
                    for (var i = 0; i < routes.length; i++) {
                        that.dragPloyline.push(routes[i].getPolyline())
                    }
                }
            })
            driving.setSearchCompleteCallback(function (results) {
                if (!that.searchRouteClick) {
                    return;
                }
                var result = [];
                if (driving.getStatus() == BMAP_STATUS_SUCCESS) {
                    for (var i = 0; i < results.getNumPlans(); i++) {
                        var plan = results.getPlan(i);
                        for (var j = 0; j < plan.getNumRoutes(); j++) {
                            //距离
                            var distance = plan.getDistance();
                            //耗时
                            var duration = plan.getDuration();
                            var planData = {distance: distance, duration: duration}
                            result.push(planData);
                        }
                    }
                    that.searchRouteResult(result);
                    that.searchRouteClick = false;
                }
            });
        }
        //baidu API 3.0 不支持直接传地址，需要转成Point
        (function (address) {
            var result = [];
            var k = 0, l = address.length;
            if (!that._localSearch) {
                that._localSearch = new BMap.LocalSearch(map);
            }
            that._localSearch.clearResults();
            for (var j = 0; j < address.length; j++) {
                that._localSearch.search(address[j]);
            }
            that._localSearch.setSearchCompleteCallback(function (searchResult) {
                var poi = searchResult.getPoi(0);
                result.push(poi.point);
                k++;
                if (k == l) {
                    that.drivingRoute.search(result[0], result[1]);
                }
            });
        })([start, end]);
    }
})
(jQuery, window, document);