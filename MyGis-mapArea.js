if (typeof jQuery === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires jQuery')
}

if (typeof layer === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires Layer')
}

if (typeof $.fn.zTree === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires zTree')
}

//重写百度组件CSS
(function () {
    /*var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = "./baidu/DrawingManager_min.css";
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);*/
    var style = document.createElement("style");
    style.type = "text/css";
    try {
        var css = ` .BMapLib_Drawing_panel{
                            position: fixed;
                            height: 230px;
                            width: 40px;
                            box-shadow: none;
                            left: 100%;
                            bottom: 0px;
                            display:none;
                            margin-left: -340px;
                            margin-bottom: 80px;
                        }
                    .BMapLib_Drawing_panel a{
                            display: block;
                            height: 30px !important;
                            width: 40px !important;
                            background-color: rgba(255, 255, 255, 0.9);
                            display: block;
                            margin-bottom: 10px;
                            border-top-right-radius: 0px !important;
                            border-bottom-right-radius: 0px !important;
                            border-bottom-left-radius: 30px;
                            border-top-left-radius: 30px;
                            background-repeat: no-repeat;
                            background-size: 16px;
                            background-position: 50% !important;
                        }
                    .BMapLib_Drawing_panel a:hover{
                            background-color: rgba(128,128,128,.9);
                        }
                    .BMapLib_Drawing_panel a:nth-child(1){
                            background-image: url("/js/myGis/img/car_fuwei_icon.png");
                        }
                    .BMapLib_Drawing_panel a:nth-child(2){
                            background-image: url("/js/myGis/img/car_zhexian_icon.png");
                        }
                    .BMapLib_Drawing_panel a:nth-child(3){
                            background-image: url("/js/myGis/img/car_duobianx_icon.png");
                        }
                    .BMapLib_Drawing_panel a:nth-child(4){
                            background-image: url("/js/myGis/img/car_fangx_icon.png");
                        }
                    .BMapLib_Drawing_panel a:nth-child(5){
                            background-image: url("/js/myGis/img/car_yuanx_icon.png");
                        }
                    .BMapLib_Drawing_panel a:nth-child(6){
                            display:none;
                            background-image: url("/js/myGis/img/car_dian_icon.png");
                    }`;

        style.appendChild(document.createTextNode(css));
    } catch (ex) {
        style.styleSheet.cssText = css;//针对IE
    }
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(style);
})();

//插件
(function ($, window, document) {

    var that = $.fn.myGis.Constructor.prototype.MapArea = new MapArea();

    var MapAreaContent = {
        elementId: "mapArea",
        ztreeElementId: "mapAreaZtree",
        contentTreeElementId: "mapAreaContentTree",
        loaddingElementId: "mapAreaContentLoading",
        formId: "form-MapArea",
        register: function (div) {
            var $root = $("#" + this.elementId);
            $root.append(div);
        },
        build: function (div) {
            this.rootElement();
            this.contextElement();
        },
        rootElement: function (callback) {
            var rootCss = `display:none;
                            z-index: 99996;
                            opacity:0.9;
                            position: fixed;
                            left: 100%;
                            bottom: 0px;
                            margin-left: -302px;
                            margin-top: 100%;
                            right: 0%;
                            width: 310px;
                            height: 340px;`;
            var closeCss = `margin-top: 7px;
                            cursor:pointer;
                            display: block;
                            z-index: 6;
                            font-size: 2em;
                            float: left;
                            margin-left: 20px;`;

            var mapAreaHeadCss = `right: 0px;
                            height: 30px;
                            background-color: #0096cb;
                            opacity: 1;
                            width: 300px;
                            z-index: 5;
                            border-top-right-radius: 10px;
                            border-top-left-radius: 10px;`;


            var div = `
                        <a href="javascript:;" id="mapArea_open" 
                                                style="position: absolute; top: 45%; right: 10px; z-index: 5;">
                                    <img src="/js/myGis/img/weilan_open.png">
                        </a>
                        <div id="${this.elementId}" style="${rootCss}">
                            <div id="mapAreaHead" style="${mapAreaHeadCss}">
                                <img id="mapArea_close" style="${closeCss}" src="/js/myGis/img/closeRight.png" />
                                <p style="padding-left:55px;line-height:30px;color: white;height:30px;font-size: 15px">
                                电子围栏</p>
                            </div>
                        </div>`;

            $(document).on("click", "#mapArea_open", function () {
                $("#mapArea").show();
                $(".BMapLib_Drawing_panel").show();
                $(this).hide();
                callback && callback("open");
            });
            $(document).on("click", "#mapArea_close", function () {
                $("#mapArea").hide();
                $(".BMapLib_Drawing_panel").hide();
                $("#mapArea_open").show();
                callback && callback("close");
            });
            $("body").append(div);
        },
        contextElement: function () {
            var mapAreaContentCss = `background-color: white;
                            opacity: 1;
                            width: 300px;
                            height: 310px;`;

            var div = `<div id="mapAreaContent" style="${mapAreaContentCss}">
                                <div id="mapAreaContentTree" style="display:none">
                                    <div style="padding-left: 20px;padding-top:30px;">
                                        <input type="text" placeholder="搜索" id="mapArea_search" autocomplete="off"/>
                                        <button id="mapArea-refresh" class="btn btn-default" 
                                            style="font-size13px;line-height:12px;width: 60px;height: 25px;">刷新</button>
                                    </div>
                                    <div  style="padding-left: 20px;padding-top:10px;">
                                      <ul id="${this.ztreeElementId}" class="ztree" 
                                            style="height: 240px;overflow:auto"></ul>
                                    </div>
                                </div>
                                <div style="padding-left: 20px;padding-top:30%;" id="mapAreaContentLoading">
                                    <span>请稍等,正在加载...</span>
                                </div>
                            </div>`;

            $(document).on("keyup", "#mapArea_search", function (e) {
                var searchTxt = $(this).val();
                e = e ? e : event;
                if (!searchTxt || !$.trim(searchTxt)) {
                    //删除键，删除完毕显示所有节点
                    if (e.keyCode != 8 && !(e.ctrlKey && e.keyCode == 88) && !(e.ctrlKey && e.keyCode == 46)) {
                        return;
                    }
                }
                setTimeout(function () {
                    that.searchTreeNode(searchTxt)
                }, 200);
            });

            $(document).on("click", "#mapArea-refresh", function () {
                layer.confirm('刷新会取消已显示的围栏？', {
                    btn: ['确认', '取消'] //按钮
                }, function (index, layero) {
                    layer.close(index);
                    that.refreshTree();
                    return true;
                }, function () {
                    return true;
                });
            });

            this.register(div);
        },
        windowElement: function (data) {

            var div = `<div class="wrapper wrapper-content animated fadeInRight ibox-content">
                            <form class="form-horizontal m" id="form-MapArea">
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">围栏名称：</label>
                                    <div class="col-sm-8">
                                        <input value="${data.operate != 'add' ? data.name : ''}" 
                                             placeholder="请填写围栏名称" name="name" class="form-control" type="text">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">围栏颜色：</label>
                                    <div class="col-sm-8">
                                        <input value="${data.operate != 'add' ? data.color : ''}" name="color" 
                                            placeholder="请填写围栏颜色,格式:#ccc"  class="form-control" type="text">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">生效时间：</label>
                                    <div class="col-sm-8">
                                        <div class="input-group date">
                                            <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                                            <input name="startDate" class="form-control" placeholder="yyyy-MM-dd" 
                                                value="${data.operate != 'add' ? data.startDate : ''}" type="text">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">失效时间：</label>
                                    <div class="col-sm-8">
                                        <div class="input-group date">
                                            <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
                                            <input name="endDate" class="form-control" placeholder="yyyy-MM-dd"
                                                 value="${data.operate != 'add' ? data.endDate : ''}" type="text">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>`;
            return div;
        }
    };

    //内部对象
    function MapArea() {
        this.parent = {};
        this.postData = {};
        this.overlayCache = {};
        this.tree = {};
        this.infowindow = {};
        this.zoomPoints = [];
    }

    //初始化DOM, 私有方法
    MapArea.prototype._initContent = function (callback) {
        MapAreaContent.build(callback);
        return MapAreaContent;
    };

    //组件初始化，会调用initContent
    MapArea.prototype.init = function (parent, callback) {
        this.parent = parent;

        if (!this.parent.options.mapArea || !this.parent.options.mapArea.enable) {
            return;
        }
        this._initContent(callback); //初始化HTML
        this.initTree();

        if (this.parent.options.mapArea && this.parent.options.mapArea.enable) {
            if (!this.__mapAreaDrawing) {
                var styleOptions = {
                    strokeColor: "blue",     //--//边线颜色。--%>
                    fillColor: "green",        //--//填充颜色。当参数为空时，圆形将没有填充效果。--%>
                    strokeWeight: 1,	        //-- //边线的宽度，以像素为单位。--%>
                    strokeOpacity: 0.8,  	//--  //边线透明度，取值范围0 - 1。--%>
                    fillOpacity: 0.4,         //--//填充的透明度，取值范围0 - 1。--%>
                    strokeStyle: 'solid',      //--//边线的样式，solid或dashed。--%>
                    scale: 2
                }
                drawingManager = new BMapLib.DrawingManager(this.parent.data.bdmapInstance, {
                    isOpen: true, //是否开启绘制模式
                    enableDrawingTool: true, //是否显示工具栏
                    //enableCalculate: true,
                    drawingToolOptions: {
                        anchor: BMAP_ANCHOR_TOP_RIGHT, //设置位置
                        offset: new BMap.Size(-2, 210), //设置偏离值
                        drawingModes: [BMAP_DRAWING_POLYLINE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE, BMAP_DRAWING_CIRCLE, BMAP_DRAWING_MARKER]//选择绘制模式
                    },
                    markerOptions: styleOptions, //点的样式
                    lineOptions: styleOptions, //线的样式
                    circleOptions: styleOptions, //圆的样式
                    polygonOptions: styleOptions, //多边形的样式
                    rectangleOptions: styleOptions //矩形的样式
                });
                var that = this;
                drawingManager.addEventListener('overlaycomplete', function (e) {
                    that.__fillDataCommon(e.drawingMode, e.overlay);
                    that.showWindow("add", function (data) {
                        if (data) {
                            that.addTreeNode(data.data); //增加树节点
                        }
                        that.parent.data.bdmapInstance.removeOverlay(e.overlay);
                    });
                    that.__mapAreaDrawing.close();
                });
                this.__mapAreaDrawing = drawingManager;
                this.__mapAreaDrawing.close();  //关闭，使用的时候再开启
            }

        }
    }

    MapArea.prototype.__fillDataCommon = function (areaType, overlay) {
        that.postData["areaType"] = areaType;
        that.postData["points"] = [];
        if (areaType === BMAP_DRAWING_CIRCLE) {
            //如果为圆形，则直接放入
            that.postData["radius"] = overlay.getRadius() || "";

            var southWestPoint = {
                lng: overlay.getBounds().getSouthWest().lng,
                lat: overlay.getBounds().getSouthWest().lat
            };
            that.postData["points"].push(southWestPoint);

            var northEastPoint = {
                lng: overlay.getBounds().getNorthEast().lng,
                lat: overlay.getBounds().getNorthEast().lat
            }
            that.postData["points"].push(northEastPoint);

            that.postData["centerLng"] = overlay.getBounds().getCenter().lng;
            that.postData["centerLat"] = overlay.getBounds().getCenter().lat;
        } else if (areaType === BMAP_DRAWING_MARKER) {
            var marker = overlay;
            var point = marker.point;
            that.postData["points"].push({lng: point.lng, lat: point.lat});
            that.postData["centerLng"] = point.lng;
            that.postData["centerLat"] = point.lat;
            that.__mapAreaDrawing.close();
            that.parent.data.bdmapInstance.removeOverlay(marker);
            alert("不支持标注点");
            return false;
        } else {
            var paths = overlay.getPath();
            for (var i = 0; i < paths.length; i++) {//其他图形，获取坐标点
                that.postData["points"].push({lng: paths[i].lng, lat: paths[i].lat});
            }
            that.postData["centerLng"] = overlay.getBounds().getCenter().lng;
            that.postData["centerLat"] = overlay.getBounds().getCenter().lat;
        }
    };

    MapArea.prototype.__overEditSetting = function (caches, canEdit) {
        for (var key in caches) {
            var c = caches[key];
            if (BMAP_DRAWING_MARKER == c.data.areaType) {
                if (canEdit) {
                    c.overlay.enableDragging();
                } else {
                    c.overlay.disableDragging();
                }
            } else {
                if (canEdit) {
                    c.overlay.enableEditing();
                } else {
                    c.overlay.disableEditing();
                }
            }
        }
    };

    /**
     * 新增或获取overlay
     * @param data: json
     */
    MapArea.prototype.newOrGetOverlay = function (data) {
        if (!data || !data.length <= 0) {
            return;
        }

        if (!data.areaId) {
            return;
        }

        var cached = that.overlayCache[data.areaId];

        if (cached) {
            return cached;
        }

        var points = [];
        for (var i = 0; i < data.points.length; i++) {
            points.push(new BMap.Point(data.points[i].lng, data.points[i].lat));
        }

        if (points.length <= 0) {
            layer.msg('没有进行围栏绘制');
        }

        switch (data.areaType) {
            case BMAP_DRAWING_MARKER:
                if (!points || points.length <= 0) {
                    return;
                }
                var mPoint = new BMap.Point(data.points[0].lng, data.points[0].lat);
                overlay = new BMap.Marker(mPoint);
                break;
            case BMAP_DRAWING_CIRCLE:
                if (!points || points.length <= 0) {
                    return;
                }
                var mPoint = new BMap.Point(data.centerLng, data.centerLat);
                overlay = new BMap.Circle(mPoint, data.radius, {
                    fillOpacity: 0.3,
                    strokeWeight: 1,
                    strokeColor: data.color,
                    fillColor: "#c4c4c4"
                });
                break;
            case BMAP_DRAWING_RECTANGLE:
            case BMAP_DRAWING_POLYGON:
                overlay = new BMap.Polygon(points, {
                    fillOpacity: 0.3,
                    strokeWeight: 1,
                    strokeColor: data.color,
                    fillColor: "#c4c4c4"
                });
                break;
            case BMAP_DRAWING_POLYLINE:
                verlay = new BMap.Polyline(points, {
                    fillOpacity: 0.3,
                    strokeWeight: 1,
                    strokeColor: data.color,
                    fillColor: "#c4c4c4"
                });
                break;
        }
        if (overlay == {}) {
            return;
        }

        var opts = {position: new BMap.Point(data.centerLng, data.centerLat)};
        var label = new BMap.Label(data.name, opts);
        label.setStyle({"backgroundColor": "yellow", "max-width": "none"});
        label.addEventListener('click', function () {
            that.parent.data.bdmapInstance.setViewport(points);    //调整视野
        });

        //默认隐藏
        overlay.hide();
        label.hide();

        //设置cache对象
        var cache = {};
        cache.label = label;
        cache.overlay = overlay;
        cache.points = points;
        cache.data = data;

        that.overlayCache[data.areaId] = cache;
        that.parent.data.bdmapInstance.addOverlay(overlay);
        that.parent.data.bdmapInstance.addOverlay(label);

        return cache;
    };

    /**
     * 新增或获取overlay
     * @param data: json array
     */
    MapArea.prototype.newOverlays = function (data) {
        if (!data || data.length <= 0) {
            return;
        }
        for (var z = 0; z < data.length; z++) {
            this.newOrGetOverlay(data[z]);
        }
    };

//overlay 显示或隐藏
    MapArea.prototype.toggleOverlay = function (obj, hide) {
        if (!obj || !obj.areaId) {
            return;
        }

        //如果传递的不是overlay,是areaId
        if (typeof obj == 'number' || typeof obj == 'string') {
            obj = that.overlayCache[obj];
        } else if (obj.areaId) {
            var tmp = that.overlayCache[obj.areaId];
            if (!tmp) {
                obj = that.newOrGetOverlay(obj);
            } else {
                obj = tmp;
            }
        }
        if (!obj) {
            return;
        }

        var overlay = obj.overlay;
        var label = obj.label;

        //判断是否传递hide
        var hidden = hide;
        if (typeof hidden == "undefined") {
            hidden = overlay.isVisible();    //否则使用overlay
        }
        if (hidden) {
            overlay.hide();
            label.hide();
            for (var i = 0; i < obj.points.length; i++) {
                that.zoomPoints.remove(obj.points[i]);
            }
        } else {
            overlay.show();
            label.show();
            for (var i = 0; i < obj.points.length; i++) {
                that.zoomPoints.push(obj.points[i]);
            }
        }
        that.parent.autoZoom(that.zoomPoints);
    };

//弹出框
    MapArea.prototype.showWindow = function (operate, callback) {
        if (!operate && !this.postData["operate"]) {
            this.postData["operate"] = "add";
        } else if (operate) {
            this.postData["operate"] = operate;
        }
        //清除Id
        if (this.postData["operate"] == "add") {
            this.postData["areaId"] = null;
        }

        this.infowindow = layer.open({
            type: 1,
            title: "围栏信息",
            maxmin: true,
            shade: 0.3,
            shadeClose: false, //点击遮罩关闭层
            area: ['600px', '400px'],
            btn: ['确定', '关闭'],
            success: function (layero) {
                layero.find('.layui-layer-min').remove();
            },
            yes: function (index, layero) {
                var $form = $("#" + MapAreaContent.formId);
                var $name = $form.find("input[name='name']");
                if (!$name.val()) {
                    layer.tips('请填写围栏名称', $name.selector);
                    return false;
                }
                var $color = $form.find("input[name='color']");
                if (!$color.val()) {
                    layer.tips('请填写围栏颜色', $color.selector);
                    return false;
                }
                var color_pattern = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
                if (!color_pattern.test($color.val())) {
                    layer.tips('围栏颜色填写不正确', $color.selector);
                    return false;
                }
                var $startDate = $form.find("input[name='startDate']");
                if (!$startDate.val()) {
                    layer.tips('请填写开始日期', $startDate.selector);
                    return false;
                }
                var date_pattern = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
                if (!date_pattern.test($startDate.val())) {
                    layer.tips('开始日期填写不正确', $startDate.selector);
                    return false;
                }
                var $endDate = $form.find("input[name='endDate']");
                if (!$endDate.val()) {
                    layer.tips('请填写结束日期', $endDate.selector);
                    return false;
                }
                if (!date_pattern.test($endDate.val())) {
                    layer.tips('结束日期填写不正确', $endDate.selector);
                    return false;
                }
                var date1 = new Date($startDate.val());
                var date2 = new Date($endDate.val());
                if (date1 > date2) {
                    layer.tips('开始时间不能大于结束日期', $endDate.selector);
                    return false;
                }

                that.postData["name"] = $name.val();
                that.postData["color"] = $color.val();
                that.postData["startDate"] = $startDate.val();
                that.postData["endDate"] = $endDate.val();

                that.post(function (data) {
                    if (!data || data.code != 0) {
                        layer.msg("请求失败:" + data.msg);
                        return false;
                    }
                    layer.close(index);
                    callback && callback(data);
                });
                return true;
            },
            cancel: function (index) {
                callback && callback(false);
                return true;
            },
            btn2: function () {
                callback && callback(false);
                return true;
            },
            content: MapAreaContent.windowElement(that.postData)
        });

    };

    MapArea.prototype.editWindow = function (treeNode, redraw) {
        that.postData["operate"] = "udpate";
        that.tree.checkNode(treeNode, true, true, true);
        var cache = that.newOrGetOverlay(treeNode);
        var overlay = cache.overlay;
        if (!overlay) {
            alert("围栏信息异常!");
        }

        if (redraw) {
            that.__overEditSetting(that.overlayCache, false);//关闭所有可编辑
            that.__overEditSetting({areaId: cache}, true);
            overlay.addEventListener("dblclick", function (event) {
                that.__overEditSetting({areaId: cache}, false); //双击后，关闭可编辑
                that.__fillDataCommon(treeNode.areaType, overlay);
                that.showWindow("update", function (data) {
                    if (data) {
                        $.extend(true, treeNode, data.data);
                        that.tree.updateNode(treeNode, false);
                        that.overlayCache[data.areaId] = data.data;
                    }
                });
            });
        } else {
            that.showWindow("update", function (data) {
                if (data) {
                    $.extend(true, treeNode, data.data);
                    that.tree.updateNode(treeNode, false);
                    that.overlayCache[data.areaId] = null;
                }
            });
        }
    };

    //初始化树
    MapArea.prototype.initTree = function () {
        if (!this.parent.options.mapArea.dataUrl) {
            return;
        }
        var that = this;
        that.postData["operate"] = "getAll";

        that.post(function (data) {
            if (!data || data.code != 0) {
                data = data;
                $("#" + MapAreaContent.loaddingElementId).text(data.msg);
                return;
            }

            //加载overlay
            that.newOverlays(data.data);

            //初始化tree
            $("#" + MapAreaContent.loaddingElementId).hide();
            that.tree = $.fn.zTree.init($("#" + MapAreaContent.ztreeElementId), {
                edit: {
                    enable: true,
                    editNameSelectAll: true,
                    removeTitle: "删除",
                    renameTitle: "编辑",
                    showRemoveBtn: function (treeId, treeNode) {
                        if (treeNode.areaId) {
                            return true;
                        }
                        return false;
                    },
                    showRenameBtn: function (treeId, treeNode) {
                        if (treeNode.areaId) {
                            return true;
                        }
                        return false;
                    }
                },
                check: {
                    enable: true
                },
                data: {
                    simpleData: {
                        enable: true
                    }
                },
                async: {
                    enable: true,
                    otherParam: {"operate": "getAll"},
                    contentType: "application/json",
                    url: that.parent.options.mapArea.dataUrl,
                    dataFilter: function (treeId, parentNode, responseData) {
                        if (responseData && responseData.code == 0) {
                            that.newOverlays(responseData.data);    //异步刷新后，重新添加不存在的overlay
                            return responseData.data;
                        }
                        return null;
                    }
                },
                callback: {
                    onCheck: function (event, treeId, treeNode) {
                        if (treeNode.isHidden) {
                            return false;
                        }
                        var nodes = that.getCheckTreeNode(treeNode, treeNode.checked);
                        for (var i = 0; i < nodes.length; i++) {
                            if (!nodes[i].isHidden) {
                                that.toggleOverlay(nodes[i], !treeNode.checked);
                            }
                        }
                    },
                    onClick: function (event, treeId, treeNode) {
                        //如果点击父节节点，则在此节点下添加围栏
                        if (!treeNode.areaId) {
                            that.postData["depId"] = treeNode.id;
                        }
                    },
                    beforeRemove: function (treeId, treeNode) {
                        layer.confirm('确定要删除？', {
                            btn: ['确认', '取消'] //按钮
                        }, function (index, layero) {
                            that.postData["operate"] = "delete";
                            that.postData["areaId"] = treeNode.areaId;
                            that.post(function (data) {
                                if (data) {
                                    layer.close(index);
                                    that.tree.removeNode(treeNode, false);
                                }
                            });
                            return true;
                        }, function () {
                            return true;
                        });
                        return false;
                    },
                    beforeEditName: function (treeId, treeNode, newName, isCancel) {
                        that.postData["operate"] = "update";
                        $.extend(true, that.postData, treeNode);
                        layer.confirm('修改提示？', {
                            btn: ['修改围栏信息', '重画围栏', '关闭'], //按钮
                            btn3: function (index, layero) {
                                layer.close(index);
                            }
                        }, function (index) {
                            layer.close(index);
                            that.editWindow(treeNode, false);
                        }, function (index) {
                            layer.close(index);
                            that.editWindow(treeNode, true);
                        });
                        that.tree.cancelEditName();
                        return false;
                    }
                }
            }, data.data);

            $("#" + MapAreaContent.contentTreeElementId).show();
            that.tree.expandAll(true);
            //清除
            that.clearPostData();
        });
    };

//刷新树
    MapArea.prototype.refreshTree = function () {
        if (!that.tree) {
            return;
        }

        //取消图形
        var nodes = that.tree.transformToArray(that.tree.getNodes());
        for (var i = 0; i < nodes.length; i++) {
            that.toggleOverlay(nodes[i], true);
        }

        //异步刷新tree
        that.tree.reAsyncChildNodes(null, "refresh");
    };

    MapArea.prototype.addTreeNode = function (data) {
        if (!data) {
            return;
        }
        var parentNode = that.tree.getNodeByParam("id", data.pId);
        if (!parentNode) {
            return;
        }
        var newNode = that.tree.addNodes(parentNode, data);
        that.tree.checkNode(newNode[0], true, true, true);
        that.parent.debugLog("add nodes:%1", newNode);
    };

//post提交数据
    MapArea.prototype.post = function (callback) {
        that.parent.debugLog("mapArea postData:%1", that.postData);
        $.ajax({
            type: that.parent.options.mapArea.type || "POST",
            url: that.parent.options.mapArea.dataUrl || "/vehicle/monitor/mapArea",
            data: that.parent.options.mapArea.data || JSON.stringify(that.postData),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                callback && callback(data);
            }, fail: function () {
                callback && callback(false);
            }
        });
    };

//获取OnCheck的数据
    MapArea.prototype.getCheckTreeNode = function (treeNode, checked) {
        var result = [];
        //var checked = treeNode.isParent ? treeNode.checked :
        // 递归，获取所有子节点
        (function getAllChildrenNodes(treeNode, checked, result) {
            if (treeNode.children) {
                var childrenNodes = treeNode.children;
                if (childrenNodes) {
                    for (var i = 0; i < childrenNodes.length; i++) {
                        var node = childrenNodes[i];
                        getAllChildrenNodes(node, checked, result);
                    }
                }
            } else {
                //子获取子节点，如果需要父节点去掉!treeNode.isParent
                if (!treeNode.isParent && checked != treeNode.checkedOld) {
                    result.push(treeNode);
                    treeNode.checkedOld = treeNode.checked;
                }
            }
            return result;
        })(treeNode, checked, result);

        return result;
    };

    MapArea.prototype.searchTreeNode = function (name) {
        var allNodes = that.tree.transformToArray(that.tree.getNodes());    //所有节点
        /*var cloneNodes = jQuery.extend(true, {}, allNodes);
        that.__tree_allNodes = cloneNodes;*/

        that.tree.checkAllNodes(false);
        that.tree.hideNodes(allNodes);

        //取消所有选中和显示的图形
        for (var i = 0; i < allNodes.length; i++) {
            that.toggleOverlay(allNodes[i], true);
        }

        if (!name) {
            that.tree.showNodes(allNodes);
            return;
        }

        var nodes = that.tree.getNodesByParamFuzzy("name", name);
        var newNodes = [];
        (function forParentNodes(nodes) {
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                newNodes.push(node);
                var _nodes = that.tree.getNodesByParam("id", node.pId, null);
                if (_nodes == null || _nodes.length <= 0) {
                    continue;
                }
                forParentNodes(_nodes);
            }
        })(nodes);

        that.tree.showNodes(newNodes);
    };

//清除提交数据
    MapArea.prototype.clearPostData = function () {
        that.postData = {};
    };

})
(jQuery, window, document);