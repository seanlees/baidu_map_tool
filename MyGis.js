if (typeof jQuery === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires jQuery')
}

+function ($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.')
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('MyGis\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
    }
}(jQuery);

;(function ($, window, document, undefined) {

    var pluginName = "myGis";
    var defaults = {
        positoin: {
            enable: false
        },
        mapArea: {
            enable: false,
            dataUrl: "",
            type: "POST",
            data: "",
            initCallback: function (data) {
            }
        },
        monitor: {
            url: "",
            type: "POST",
            data: "",
            dataFormat: function (data) {
                return data;
            },
            interval: 10
        },
        url: false,
        fomratData: function (data) {
            return data
        },
        marker: {
            title: true,
            label: true,
            boxInfo: {
                enable: false,
                url: "",
                btnEvent: function () {
                }
            }
        },
        enableMarkerCluster: false,
        tooltip: true,
        tools: {
            autoZoom: true,
            distince: true,
            regionZoom: true,
            trafficState: false,
            panorama: false,
            satellite: false
        },
        rightMenu: []
    };
    //工具类，内部使用
    var inner_tool = {
        isString: function (obj) {
            return "[object String]" == Object.prototype.toString.call(obj)
        },
        isFunction: function (obj) {
            return "[object Function]" == Object.prototype.toString.call(obj)
        },
        isArray: function (obj) {
            return (typeof obj == 'object') && obj.constructor == Array;
        },
        isJson: function (obj) {
            return typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]"
                && !obj.length;
        }
    };

    //内部数据定义
    var data = {
        markerClusterer: {},
        markers: {},
        infoBoxs: {},
        menu: 0,
        bdmapInstance: "",
        points: {},
        pointsData: {},
    };
    //tooltip工具箱对象
    var tooltip = {
        elementId: "divshadow",
        labelCss: "flex-grow: 1;position: relative;text-align: center;cursor:pointer;",
        __registerNum: 0,
        register: function (div) {
            var $root = $("#" + tooltip.elementId);
            tooltip.__registerNum++;
            $root.css("width", (tooltip.__registerNum * 50) + "px");
            $root.children().first().append(div);
        },
        rootElement: function () {
            var css = `   position: fixed;
                        opacity:0.85;
                        top: 20px;
                        right: 50px;
                        height: 30px;
                        width: 250px;
                        border-radius: 5px;
                        line-height: 30px;
                        z-index: 6;
                        background: rgba(255,255,255,1);`;
            var labelCss = `  flex-grow: 1;
                            position: relative;
                            text-align: center;`;
            var div = `
                <div class="divshadow" id="${tooltip.elementId}" style="${css}">
                    <div id="divtoolbox" style="height: 30px;display:flex;">
                    </div>
                </div>`;

            //进行拼接
            $("body").append(div);
            return div;
        },
        toolsElement: function (distince, regionZoom, callback) {
            if (!distince && !regionZoom) {
                return;
            }
            var distinceDiv = "", regionZoomDiv = "";
            if (distince) {
                distinceDiv = `<div id="ceju" data-status="false">开启测距</div>`;
                //注册测距事件
                $(document).on("click", "#ceju", function () {
                    if ($(this).data("status") == false) {
                        $(this).data("status", true);
                        $(this).text("关闭测距");
                        $(this).parent().parent().toggle();
                    } else {
                        $(this).data("status", false);
                        $(this).text("开启测距");
                        $(this).parent().parent().toggle();
                    }
                    callback && callback(this, "distince");
                    return false;
                })
            }
            if (regionZoom) {
                regionZoomDiv = `<div id="fangda" data-status="false">开启区域放大</div>`;
                $(document).on("click", "#fangda", function () {
                    if ($(this).data("status") == false) {
                        $(this).data("status", true);
                        $(this).text("关闭区域放大");
                        $(this).parent().parent().toggle();
                    } else {
                        $(this).data("status", false);
                        $(this).text("开启区域放大");
                        $(this).parent().parent().toggle();
                    }
                    callback && callback($(this), "regionZoom");
                    return false;
                })
            }

            var css = `float: left;
                    position: absolute;
                    border: 1px solid #ccc;
                    top: 30px;
                    overflow: hidden;
                    background-color: #fff;
                    left: -10px;
                    width: 100px;
                    text-align: center;`;
            var div = `<label id="btn" style="${tooltip.labelCss}">
                            工具箱
                            <div id="xab" style="display: none;${css}">
                                <div id="uljia">
                                    ${distinceDiv}
                                    ${regionZoomDiv}
                                </div>
                            </div>
                        </label>`;

            //注册事件
            $(document).on("click", "#btn", function () {
                $("#xab").toggle();
                return false;
            });
            this.register(div);
        },
        trafficStateElement: function (callback) {
            var div = `<label id="btn_lq" tooltip="未开启路况" placement="bottom" effect="light"
                        data-status="false" style="${tooltip.labelCss}">路况</label>`;
            $(document).on("click", "#btn_lq", function () {
                if ($(this).data("status") == false) {
                    $(this).data("status", true);
                    $(this).attr("tooltip", "已开启路况");
                } else {
                    $(this).data("status", false);
                    $(this).attr("tooltip", "未开启路况");
                }
                callback && callback(this);
                return false;
            });
            this.register(div);
        },
        panoramaElement: function (callback) {
            var div = ` <label id="btn_qj" tooltip="未开启全景" placement="bottom" effect="light" 
                        data-status="false" style="${tooltip.labelCss}">全景</label>`;
            $(document).on("click", "#btn_qj", function () {
                if ($(this).data("status") == false) {
                    $("div[title='进入全景']").click(); //点击百度地图的div
                    $(this).data("status", true);
                    $(this).attr("tooltip", "已开启全景,请开启Flash");
                } else {
                    $("div[title='退出全景']").click();
                    $(this).data("status", false);
                    $(this).attr("tooltip", "未开启全景");
                }
                return false;
            });
            callback && callback($(div));
            this.register(div);
        },
        satelliteElement: function (callback) {
            var div = `<label id="btn_wx" tooltip="已显示普通地图" placement="bottom" effect="light"  
                        data-status="false"  style="${tooltip.labelCss}">卫星</label>`;
            $(document).on("click", "#btn_wx", function () {
                if ($(this).data("status") == false) {
                    $("div[title='显示带有街道的卫星影像']").click(); //点击百度地图的div
                    $(this).data("status", true);
                    $(this).text("普通");
                    $(this).attr("tooltip", "已显示卫星地图");
                } else {
                    $("div[title='显示普通地图']").click();
                    $("div[title='']").hide();
                    $(this).data("status", false);
                    $(this).text("卫星");
                    $(this).attr("tooltip", "已显示普通地图");
                }
                return false;
            });
            callback && callback($(div));
            this.register(div);
        },
        autoZoom: function (callback) {
            var div = `<label id="btn_autozoom" tooltip="自动缩放最佳视野" placement="bottom" effect="light"  
                            data-status="false"  style="${tooltip.labelCss}">
                        <span style="font-size: 20px">☉</span>
                       </label>`;
            $(document).on("click", "#btn_autozoom", function () {
                callback && callback();
                return false;
            });
            this.register(div);
        }
    };

    function MyGis(element, options) {
        this.options = $.extend(true, {}, defaults, options);
        this.element = $(element);
        //this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.data = $.extend({}, data)
        //初始化
        this.init();
    }

    //占位符：%1，%2...
    MyGis.prototype.debugLog = function (string) {
        if (this.options.debug) {
            if (arguments.length <= 0) {
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            var pattern = new RegExp("%([1-" + args.length + "])", "g");
            var log = String(string).replace(pattern, function (match, index) {
                var tmp = args[index];
                if (!inner_tool.isString(tmp)) {
                    tmp = JSON.stringify(tmp);
                }
                return tmp;
            });
            console.log(log);
            /*  for (var j = 0; j < args.length; j++) {
                  if (!inner_tool.isString(args[i])) {
                      args[i] = JSON.stringify(args[i]);
                  }
              }
              console["log"].apply(console, args);*/
        }
    };

    /**
     * 初始化地图函数
     * @returns {*}
     */
    MyGis.prototype.init = function () {
        var that = this;
        var url = this.options.url;
        var isString = (typeof url == 'string') && url.constructor == String;

        var dtd = $.Deferred(); // 新建一个延迟对象
        if (!url || !isString) {
            that.__init();
            dtd.resolve();
            return dtd.promise();
        }

        //加载层
        var index = layer.load(1, {
            shade: [0.4, '#fff'] //0.1透明度的白色背景
        });

        //发送异步请求，接受数据
        $.get(url).done(function (data) {  //格式 [{lat:1,lng:1,label:xxx}]
            layer.close(index);
            data = that.fomratData(data);
            that.__init(data);    //初始化地图
            if (data) {
                //TODO 调用初始化地图Points
            }
            dtd.resolve();
        }).fail(function () {
            layer.close(index);
            layer.alert('请求数据失败');
            dtd.reject();
        });
        return dtd.promise();
    };

    //内部私有方法
    MyGis.prototype.__init = function () {
        var id = this.element.attr("id");
        var map = new BMap.Map(id);    // 创建Map实例

        //初始化地图定位
        this.__init_position(map);

        map.enableScrollWheelZoom();
        //map.disableDoubleClickZoom();
        //添加地图类型控件
        map.addControl(new BMap.MapTypeControl({
            mapTypes: [
                BMAP_NORMAL_MAP,
                BMAP_HYBRID_MAP
            ]
        }));
        //创建比例尺控件
        var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
        var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
        map.addControl(top_left_control);
        map.addControl(top_left_navigation);
        top_left_control.setOffset(new BMap.Size(40, 70));
        top_left_navigation.setOffset(new BMap.Size(40, 100));

        //地图加载完成
        map.addEventListener("tilesloaded", function (e) {
            $("div[title='显示普通地图']").hide();
            $("div[title='显示带有街道的卫星影像']").hide();
            $("div[title='进入全景']").hide();
        });

        //改变浏览器大小后，地图自动最佳视野
        /* map.addEventListener("resize", function () {
            that.autoZoom(); //和下面相同，会频繁调用
        });*/
        var resizeTimer = null;
        var that = this;
        $(window).bind('resize', function () {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { //延迟一下，不然鼠标拖动浏览器窗口会频繁调用此方法，cpu high
                that.autoZoom();
            }, 1000);
        });
        //注册为全局
        this.data.bdmapInstance = map;

        //是否启用工具条
        if (this.options.tooltip) {
            //初始化工具栏DOM
            tooltip.rootElement();
            //自动最佳视野
            if (this.options.tools.autoZoom) {
                var that = this;
                tooltip.autoZoom(function () {
                    that.autoZoom();
                });
            }

            //初始化工具箱
            var distince, regionZoom;
            tooltip.toolsElement(this.options.tools.distince, this.options.tools.regionZoom, function (e, type) {
                if (type == "distince") {
                    if (!distince) {
                        distince = new BMapLib.DistanceTool(map);
                    }
                    if ($(e).data("status")) {
                        distince.open(); //开启鼠标测距
                    } else {
                        distince.close();
                    }
                } else if (type == "regionZoom") {
                    if (!regionZoom) {
                        regionZoom = new BMapLib.RectangleZoom(map, {
                            followText: "拖拽鼠标进行操作"
                        });
                    }
                    if ($(e).data("status")) {
                        regionZoom.open();  //开启拉框放大
                    } else {
                        regionZoom.close();  //开启拉框放大
                    }
                }
            });

            if (this.options.tools.trafficState) {
                var trafficState;
                tooltip.trafficStateElement(function (e) {
                    if (!trafficState) {
                        trafficState = new BMap.TrafficLayer();
                    }
                    if ($(e).data("status")) {
                        map.addTileLayer(trafficState);
                    } else {
                        map.removeTileLayer(trafficState);
                    }
                });
            }
            if (this.options.tools.panorama) {
                var panorama;
                tooltip.panoramaElement(function (e) {
                    if (!panorama) {
                        // 覆盖区域图层测试
                        //map.addTileLayer(new BMap.PanoramaCoverageLayer());
                        panorama = new BMap.PanoramaControl();
                        //设置全景控件偏移量
                        panorama.setOffset(new BMap.Size(4, 68));
                        //添加全景控件
                        map.addControl(panorama);
                    }
                });
            }
            if (this.options.tools.satellite) {
                tooltip.satelliteElement();
            }
        }

        //添加右键菜单
        this.rightMenu();

        //实时数据
        if (this.options.monitor.url) {
            this.monitor();
        }

        //是否引入MapArea
        if (this.MapArea) {
            //初始化MapArea
            this.MapArea.init(this, this.options.mapArea.initCallback);
        }

        //是否引入Search
        if (this.Search) {
            this.Search.init(this);
        }

        //是否引入MarkerInfobox
        if (this.MarkerInfoBox) {
            this.MarkerInfoBox.init(this);
        }
    };

    MyGis.prototype.__init_position = function (map) {
        var data = this.options.position;
        if (!data || !data.enable) {
            return;
        }
        var city_position = {
            lng: 116.404,
            lat: 39.915,
            level: 11,
            city: "北京"
        };
        if (!data.city) {
            //使用IP普通定位，也可使用 new BMap.Geolocation(); Geolocation使用多为定位来返回的具体位置，所以这里使用LocalCity
            var localCity = new BMap.LocalCity();//(Bmap.LocalCityOptions.renderOptions.map);
            localCity.get(function (city) {
                if (city) {
                    map.setCurrentCity(city.name);
                    map.centerAndZoom(city.center, city.level);
                } else {
                    map.setCurrentCity(city_position.name);
                    map.centerAndZoom(new BMap.Point(city_position.lng, city_position.lat), city_position.level);
                }
            });
        } else {
            $.extend(city_position, data);
            map.setCurrentCity(city_position.name);
            map.centerAndZoom(new BMap.Point(city_position.lng, city_position.lat), city_position.level);
        }
    };

    MyGis.prototype.test = function (xx) {
        $.when(this.init()).done(function () {
            alert("初始化地图成功！" + xx);
        })
    };

    MyGis.prototype.getPointArray = function () {
        var points = [];
        $.each(this.data.points, function (name, item) {
            points.push(item);
        });
        return points;
    };

    MyGis.prototype.autoZoom = function (pointArray) {
        var map = this.data.bdmapInstance;
        var points = this.getPointArray();
        if (pointArray && pointArray.length > 0) {
            points = pointArray;
        }
        var view = map.getViewport(points);
        var mapZoom = view.zoom - 1;  //级别减1，更适合显示所有overlay
        var centerPoint = view.center;
        map.centerAndZoom(centerPoint, mapZoom);
    }

    //聚集点
    MyGis.prototype.newMarkerClusterer = function () {
        if (!this.data.markerClusterer) {
            return this.data.markerClusterer;
        }
        var markerClusterer = new BMapLib.MarkerClusterer(this.data.bdmapInstance, {
            //markers: m_marke,
            borderPadding: 20,
            maxZoom: 15,
            trackMarkers: true,
            minClusterSize: 10
        });
        return this.data.markerClusterer = markerClusterer;
    };

    //添加覆盖物
    MyGis.prototype.addMarker = function (gisPoint) {
        //lat, lng, iconpath
        var points = gisPoint;
        if ((typeof gisPoint == 'object') && gisPoint.constructor == Object) {
            points = new Array();
            points.push(gisPoint)
        }
        var that = this;
        for (var p of points) {
            //没有坐标直接跳过
            if (!p.lat || !p.lng || !p.name || !p.uid) {
                continue;
            }

            var point = new BMap.Point(p.lng, p.lat);
            // 初始化icon
            var marker;
            if (p.iconpath) {
                var icon = new BMap.Icon(p.iconpath, new BMap.Size(26, 42), {
                    imageSize: new BMap.Size(26, 42)
                });
                marker = new BMap.Marker(point, {icon: icon});
            } else {
                marker = new BMap.Marker(point);
            }

            marker.setRotation(p.direction);  //角度

            //是否设置title
            if (this.options.marker.title && p.title) {
                marker.setTitle(p.title);
            }

            //是否设置label TODO: label样式自定义扩展
            if (this.options.marker.label) {
                var label = new BMap.Label(p.name, {offset: new BMap.Size(20, 10)});
                label.setStyle({
                    padding: "2px",
                    fontSize: "12px",
                    height: "20px",
                    backgroundColor: "#fbffd7",
                    color: "#333333",
                    fontWeight: "bold",
                    fontFamily: "微软雅黑",
                    border: "1px solid #999999",
                    maxWidth: "none",
                    position: "relative",
                });
                marker.setLabel(label);
                label.addEventListener('click', function () {
                    that.autoZoom([this.point]);    //点击调整视野
                });
            }

            //this.data.bdmapInstance.centerAndZoom(point, 16);
            this.data.bdmapInstance.addOverlay(marker);
            //重新set, 百度BUG. 第二次set会有偏移量
            var icon = marker.getIcon();
            marker.setIcon(icon);

            //添加到集合，进行缓存
            this.data.points[p.uid] = point;
            this.data.pointsData[p.uid] = p;
            this.data.markers[p.uid] = marker;

            //infoBox
            if (this.options.marker.boxInfo.enable) {
                marker.uid = p.uid;
                that.MarkerInfoBox.addMarkerInfoBox(p.uid);
                marker.addEventListener('click', function () {
                    that.showMarkerInfoBox(this.uid);
                });
            }
        }

        if (this.options.enableMarkerCluster) {
            $.each(this.data.markers, function (i, marker) {
                this.newMarkerClusterer().addMarker(marker);
            });
            //定时，当marker变化是，重新计算聚合点
            /*setInterval(function () {
                //清除以前的点
                markerClusterer.clearMarkers();
                $.each(this.data.markers, function (i, marker) {
                    this.newMarkerClusterer().addMarker(marker);
                });
            }, 2000);*/
        }
    };

    //移除覆盖物
    MyGis.prototype.removeMarker = function (nodes) {
        if (!inner_tool.isArray(nodes)) {
            return;
        }

        var that = this;
        $.each(nodes, function (i, item) {
            //没有uid唯一标识,继续
            var uid = item.uid;
            if (!uid) {
                return true;
            }
            //删除缓存,不删也行重新添加会覆盖
            delete that.data.points[uid];
            delete that.data.pointsData[uid];

            //移除标注
            var marker = that.data.markers[uid];
            if (!marker) {
                return true;
            }
            that.data.bdmapInstance.removeOverlay(marker);
            delete that.data.markers[uid];

            //如果有簇集点，移除
            if (that.options.enableMarkerCluster) {
                that.newMarkerClusterer().removeMarker(marker);
            }
            //如果有弹出框关闭弹出框
            var infobox = that.data.infoBoxs[uid];
            if (infobox) {
                infobox.close();
            }
        });
    };
    //更新覆盖物
    MyGis.prototype.updateMarker = function (data) {
        if (!data || !data.uid) {
            return;
        }
        var key = data.uid;
        var point = this.data.points[key];
        //this.debugLog("[updateMarker]-进行实时位置更新-ID:%1,oldPoint:%2", key, point)
        if (!point) {
            return;
        }

        var marker = this.data.markers[key];
        if (!marker) {
            return;
        }

        //新的位置
        var newPoint = new BMap.Point(data.lng, data.lat);

        //位置变化
        if (point.equals(newPoint) && marker.getRotation() != data.direction) {
            this.debugLog("[updateMarker]-位置没有变化-oldPoint:%1,newPoint:%2", point, newPoint)
            this.debugLog("[updateMarker]-位置有变化-ID:%1,oldPoint:%2,newPoint:%3", key, point, newPoint)
            this.data.points[key] = newPoint;
            /*  如果使用move,则infobox跟随移动,性能开销应该比较大,没有测试.先注释
            if (marker) {
                //marker.setPosition(point);
                var oldPoint = marker.getPosition();
                this.debugLog("[updateMarker]-位置有变化,进行移动-ID:%1,oldPoint:%2,newPoint:%3", key, newPoint, oldPoint)
                this.Move(marker, oldPoint, newPoint);
            }*/
            marker.setPosition(newPoint);   //新的位置

            //坐标变化了，infoBox才刷新。其他变化先不考虑
            if (this.options.marker.boxInfo.enable) {
                if (this.MarkerInfoBox.isOpen(data.uid)) {
                    this.MarkerInfoBox.updateOpenMarkerInfoBox(data.uid);
                }
            }
        }

        var icon = marker.getIcon();
        if (data.iconpath && data.iconpath != icon.imageUrl) {
            //新的图标*/
            var size = new BMap.Size(26, 42);
            icon.setSize(size);
            icon.setImageSize(size);
            icon.setImageUrl(data.iconpath);
            marker.setIcon(icon);
            marker.setRotation(data.direction);  //新的角度
            /*  this.removeMarker([data])
              this.addMarker(data);*/
        }

        if (marker.getRotation() != data.direction) {
            marker.setRotation(data.direction);  //新的角度
        }


        //簇集点
        //this.data.markerClusterer
    };

    MyGis.prototype.showMarkerInfoBox = function (uid) {
        this.MarkerInfoBox.showMarkerInfoBox(uid);
    }

    /*MyGis.prototype.showMarkerInfoBox = function (uid) {
       var infoWindow = this.data.infoBoxs[uid];
       var marker = this.data.markers[uid];
       if (!marker) {
           alert("未选中或该设备暂无信息");
           return;
       }
       marker.openInfoWindow(infoWindow);
   };*/

    //右键菜单
    MyGis.prototype.rightMenu = function () {
        if (this.options.rightMenu.length <= 0) {
            return;
        }
        if (!this.data.menu) {
            this.data.menu = new BMap.ContextMenu();
            this.data.bdmapInstance.addContextMenu(this.data.menu);
        }
        var that = this;
        $.each(this.options.rightMenu, function (i, item) {
            that.data.menu.addItem(new BMap.MenuItem(item.text, item.callback, 1000));
            if (i != that.options.rightMenu.length - 1) {
                that.data.menu.addSeparator();  //添加右键菜单的分割线
            }
        });
    }

    //实时数据
    MyGis.prototype.monitor = function () {
        //设置实时数据的最小时间，默认10秒，最小3秒
        if (this.options.monitor.interval < 10) {
            this.options.monitor.interval = 3;
        }
        if (!this.options.monitor.url) {
            return;
        }
        var that = this;
        setInterval(function () {
            var keys = Object.keys(that.data.pointsData); //key为vehicleid
            if (keys.length <= 0) {
                return;
            }
            $.ajax({
                type: that.options.monitor.type || "GET",
                url: that.options.monitor.url || "/vehicle/monitor/car",
                data: that.options.monitor.data || JSON.stringify(keys),
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    data = that.options.monitor.dataFormat(data);
                    $.each(data, function (i, item) {
                        that.updateMarker(item)
                    });
                }
            });
        }, that.options.monitor.interval * 1000);
    };

    /**
     * 参考：https://www.jianshu.com/p/99364d400c61、https://blog.csdn.net/a0405221/article/details/90485417、http://xieze.gitee.io/baiduslidemove/
     *覆盖物移动
     *@param {Point} prvePoint 开始坐标(PrvePoint)
     *@param {Point} newPoint 目标点坐标
     *@param {Function} 动画效果
     *@return  无返回值
     */
    MyGis.prototype.Move = function (marker, prvePoint, newPoint) {
        var map = this.data.bdmapInstance,
            timer = 10,
            //当前帧数
            currentCount = 0,
            //初始坐标
            _prvePoint = map.getMapType().getProjection().lngLatToPoint(prvePoint),//将球面坐标转换为平面坐标
            //获取结束点的(x,y)坐标
            _newPoint = map.getMapType().getProjection().lngLatToPoint(newPoint),
            //两点之间要循环定位的次数
            count = (this.options.monitor.interval - 2) * 1000 / timer;

        //不使用这种计算方式，有问题
        /*  var step = 400 / (1000 / timer),//步长，米/秒
         count = Math.round(this._getDistance(_prvePoint, _newPoint) / step);*/
        //两点之间匀速移动
        var _intervalFlag = setInterval(function () {
            //两点之间当前帧数大于总帧数的时候，则说明已经完成移动
            if (currentCount >= count) {
                clearInterval(_intervalFlag);
                return;
            } else {
                //动画移动
                currentCount++;//计数
                var x = effect(_prvePoint.x, _newPoint.x, currentCount, count),
                    y = effect(_prvePoint.y, _newPoint.y, currentCount, count);
                //根据平面坐标转化为球面坐标
                var pos = map.getMapType().getProjection().pointToLngLat(new BMap.Pixel(x, y));
                //设置marker角度(两点之间的距离车的角度保持一致)
                if (currentCount == 1) {
                    //转换角度
                    var proPos = null;
                    //this._setRotation(proPos, prvePoint, newPoint, marker);  有点问题，先不调用
                }
                //正在移动
                marker.setPosition(pos);
            }
        }, timer);


        function effect(initPos, targetPos, currentCount, count) {
            var b = initPos, c = targetPos - initPos, t = currentCount,
                d = count;
            return c * t / d + b;
        }
    }

    /**
     * 计算两点间的距离
     * @param {Point} poi 经纬度坐标A点.
     * @param {Point} poi 经纬度坐标B点.
     */
    MyGis.prototype._getDistance = function (pxA, pxB) {
        return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
    }

    /**
     *在每个点的真实步骤中设置小车转动的角度
     *@param{BMap.Point} curPos 起点
     *@param{BMap.Point} targetPos 终点
     */
    MyGis.prototype._setRotation = function (prePos, curPos, targetPos, marker) {
        var map = this.data.bdmapInstance;
        var deg = 0;
        curPos = map.pointToPixel(curPos);
        targetPos = map.pointToPixel(targetPos);
        if (targetPos.x != curPos.x) {
            var tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x),
                atan = Math.atan(tan);
            deg = atan * 360 / (2 * Math.PI);
            if (targetPos.x < curPos.x) {
                deg = -deg + 90 + 90;
            } else {
                deg = -deg;
            }
            marker.setRotation(-deg);
        } else {
            var disy = targetPos.y - curPos.y;
            var bias = 0;
            if (disy > 0)
                bias = -1
            else
                bias = 1
            marker.setRotation(-bias * 90);
        }
        return;
    }

    $.fn[pluginName] = function (options) {
        var args = $.makeArray(arguments), after = args.slice(1);
        return this.each(function () {
            var mygis = $.data(this, pluginName);
            // 如果该元素没有初始化过(可能是新添加的元素), 就初始化它.
            if (!mygis) {
                var opts = $.extend(true, {}, defaults, typeof options === "object" ? options : {});
                mygis = new MyGis(this, opts);
                // 缓存插件
                $.data(this, pluginName, mygis);

                //暴露到全局
                if (opts.windowid) {
                    var wingis = window.mygis;
                    if (!wingis) {
                        window.mygis = {};
                    }
                    window.mygis[opts.windowid] = mygis;
                }
            }
            // 调用方法
            if (typeof options === "string" && typeof mygis[options] == "function") {
                // 执行插件的方法
                return mygis[options].apply(mygis, after);
            }/* else if (typeof options === "object" && mygis.data[options["data"]]) {
            return mygis.data[options];
        }*/
        });
    };

    $.fn[pluginName].Constructor = MyGis;   //暴漏，用来扩展
})(jQuery, window, document);