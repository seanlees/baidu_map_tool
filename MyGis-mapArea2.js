if (typeof jQuery === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires jQuery')
}

if (typeof layer === 'undefined') {
    throw new Error('MyGis\'s JavaScript requires Layer')
}

//插件
(function ($, window, document) {

    var that = $.fn.myGis.Constructor.prototype.MapArea = new MapArea();

    //内部对象
    function MapArea() {
        this.parent = {};
        this.postData = {};
        this.callback = function () {
        };
    }

    //组件初始化
    MapArea.prototype.init = function (parent, callback) {
        this.parent = parent;
        if (callback) {
            this.callback = callback;
        }

        if (!(this.parent.options.mapArea && this.parent.options.mapArea.enable)) {
            return;
        }

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
                    scale: 0.5,
                    anchor: BMAP_ANCHOR_TOP_RIGHT, //设置位置
                    offset: new BMap.Size(-30, 40), //设置偏离值
                    drawingModes: [BMAP_DRAWING_POLYLINE, BMAP_DRAWING_POLYGON, BMAP_DRAWING_RECTANGLE, BMAP_DRAWING_CIRCLE, BMAP_DRAWING_MARKER]//选择绘制模式
                },
                markerOptions: styleOptions, //点的样式
                lineOptions: styleOptions, //线的样式
                circleOptions: styleOptions, //圆的样式
                polygonOptions: styleOptions, //多边形的样式
                rectangleOptions: styleOptions //矩形的样式
            });
            drawingManager._drawingTool.panel.addEventListener("mousedown", function (e) {
                if (!$.isEmptyObject(that.postData)) {
                    layer.confirm('已经绘制围栏,再次绘制会清除上次图形', {
                        btn: ['确定', '关闭'] //按钮
                    }, function (index) {
                        that.postData = {};
                        that.parent.data.bdmapInstance.clearOverlays();
                        e.toElement.click();
                        layer.close(index);
                    }, function (index) {
                        layer.close(index);
                    });
                }
            });

            drawingManager.addEventListener('overlaycomplete', function (e) {
                that.overlayEnableEditMode(e.overlay, e.drawingMode);

                //填充数据
                that.__fillDataCommon(e.drawingMode, e.overlay);

                /*e.overlay.addEventListener("mouseout", function (event) {
                    that.postData = {}; //清除以前的数据
                    that.__fillDataCommon(e.drawingMode, e.overlay);
                    alert(JSON.stringify(that.postData));
                    callback && callback(that.postData);
                });*/
                //添加overlay的事件
                that.overlayEvent(e.overlay, e.drawingMode);

                that.__mapAreaDrawing.close();
                setTimeout(function () {
                    that.parent.data.bdmapInstance.disableDoubleClickZoom();
                }, 2100);
            });
            this.__mapAreaDrawing = drawingManager;
            this.__mapAreaDrawing.close();  //关闭，使用的时候再开启

            that.initDraw();
        }

    }

    MapArea.prototype.initDraw = function () {
        if (!this.parent.options.mapArea.dataUrl) {
            return;
        }

        that.post(function (data) {
            if (!data || data.code != 0) {
                return;
            }
            that.draw(data.data);
        });

    };

    MapArea.prototype.draw = function (data) {
        var overlay = {};
        var points = [];
        if (!data.points || data.points.length <= 0) {
            return;
        }
        for (var i = 0; i < data.points.length; i++) {
            points.push(new BMap.Point(data.points[i].lng, data.points[i].lat));
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

        that.postData = data;
        //开启编辑模式
        that.overlayEnableEditMode(overlay, data.areaType);
        that.overlayEvent(overlay, data.areaType);
        var opts = {position: new BMap.Point(data.centerLng, data.centerLat)};
        var label = new BMap.Label(data.name, opts);
        label.setStyle({"backgroundColor": "yellow", "max-width": "none"});
        label.addEventListener('click', function () {
            that.parent.data.bdmapInstance.setViewport(points);    //调整视野
        });
        that.parent.data.bdmapInstance.addOverlay(overlay);
        that.parent.data.bdmapInstance.addOverlay(label);

        that.parent.autoZoom(points);
    };

    MapArea.prototype.overlayEvent = function (overlay, drawingMode) {
        overlay.addEventListener("mouseout", function (event) {
            that.postData = {}; //清除以前的数据
            //填充新数据
            that.__fillDataCommon(drawingMode, overlay);
            //回调
            that.callback && that.callback(that.postData);
        });
    };

    MapArea.prototype.overlayEnableEditMode = function (overlay, drawingMode) {
        if (drawingMode == BMAP_DRAWING_MARKER) {
            overlay.enableDragging();
        } else {
            overlay.enableEditing();
        }
    };

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

            //大于4个点，为多边形
            if (paths.length > 4) {
                that.postData["areaType"] = BMAP_DRAWING_POLYGON;
            }

            that.postData["centerLng"] = overlay.getBounds().getCenter().lng;
            that.postData["centerLat"] = overlay.getBounds().getCenter().lat;
        }
    };

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
})
(jQuery, window, document);