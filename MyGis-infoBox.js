(function ($, window, document) {
    var that = $.fn.myGis.Constructor.prototype.MarkerInfoBox = new MarkerInfoBox();

    function MarkerInfoBox() {
        this.parent = {};
        this.callback = undefined;
        this.btnEvent = {};
    }

    MarkerInfoBox.prototype._initHtml = function (info) {
        var infoBoxContent = {
            element: {},
            register: function (div) {
                var $root = $(this.element);
                this.element = $root.append(div)[0];
            },
            build: function () {
                this.rootElement();
                this.contextElement();
                this.btnElement();
                return this.element;
            },
            rootElement: function () {
                var elementId = "infobox" + info.id;
                var divCss = `border-radius:5px;`;
                var div = `<div id="${elementId}" style="${divCss}">
                        <div style='position: absolute;width: 40px;height: 40px;bottom: -40px;left: 235px;'>
                            <em></em>
                            <span style="border-width: 20px;position: absolute;
                                border-style: solid dashed dashed dashed;
                                border-color:rgba(255,255,255,1) transparent transparent transparent; 
                                top:-1.6px;">
                            </span>
                        </div>
                        <div style="font-size: 16px;text-align: center;vertical-align: middle;">
                            <img class="img_logo" width="20px" height="20px"
                                src="${info.titlePhoto ? info.titlePhoto : '/js/myGis/img/vehicle_title.png'}" />
                            <label style="padding-right:10px;">
                                ${info.type}:
                            </label><font color="black">${info.plateNo}</font>
                        </div>
                        <div style="height: 2px;background-color:#0186e3;margin: 0px 10px "></div>
                    </div>`;
                this.element = div;
            },
            contextElement: function () {
                var divCss = `float:left;
                        width:50%;
                        vertical-align: middle;`;

                var div = "";
                (function (ctx) {
                    div += '<div style="margin-left: 10px;margin-right: 10px;color: #000000;">';
                    $.each(info.context, function (i, item) {
                        var title = item.key;
                        var value = item.value;
                        div += `<div style="${divCss}">
                               <!-- <img class="img_logo" src="admin/imagec/vehicle_time.png">-->
                                <label style="display: inline-block;height: 23px;line-height: 23px;font-weight: 700;">
                                    ${title}：
                                </label>
                                <span>${value}</span>
                            </div>`;
                    });
                    div += "<div style='clear: both;'></div></div>";
                    return div;
                })(info.context);

                this.register(div);
            },
            btnElement: function () {
                var divCss = `float: left;
                        height: 30px;
                        line-height: 30px;
                        display: flex;
                        width: 100%;
                        margin-bottom: 5px;
                        margin-top: 10px;
                        border-radius: 5px;
                        overflow: hidden;`;

                var div = `<div class="infobox_bottom_btn" style="${divCss}">`;
                $.each(info.btns, function (i, item) {
                    item.uid = info.id;
                    var id = "infobox-btn-" + info.id + item.name;
                    $(document).data(id, item);
                    div += `<span  id="${id}"
                                    onMouseOver="this.style.background='#d9e0f6'"
                                    onMouseOut="this.style.background='#f8faff'"
                                    style="flex-grow: 1;background: #f8faff;color: #0f44d9;text-align: center;">
                                    ${item.name}
                                </span>`;

                    $(document).off("click." + id);
                    $(document).on("click." + id, "#" + id, function () {
                        that.callback && that.callback($(document).data($(this).attr("id")));
                        return false;
                    });
                });
                div += `</div>`;
                this.register(div);
            }
        }
        return infoBoxContent.build();
    };

    MarkerInfoBox.prototype.init = function (parent) {
        that.parent = parent;
        this.callback = this.parent.options.marker.boxInfo.btnEvent;
    };

    MarkerInfoBox.prototype.addMarkerInfoBox = function (uid, callback) {
        var marker = that.parent.data.markers[uid];
        if (!marker) {
            return;
        }
        $.ajax({
            url: that.parent.options.marker.boxInfo.url.replace("{id}", uid),
            type: "get",
            cache: false,
            success: function (data) {
                var html = that._initHtml(data);
                var infoWindow = that.parent.data.infoBoxs[uid];
                if (!infoWindow) {
                    //使用infoBox时,需要更新的时候,更新
                    infoWindow = new BMapLib.InfoBox(that.parent.data.bdmapInstance, html, {
                        boxStyle: {
                            background: "rgba(255,255,255,1)",
                            border: "1px solid #c6c6c6",
                            opacity: 0.85,
                            width: "510px",
                        },
                        closeIconMargin: "7px 10px 0 0",
                        enableAutoPan: true,
                        align: INFOBOX_AT_TOP,
                        closeIconUrl: "/js/myGis/img/delete.png",
                        offset: new BMap.Size(25, 25)
                    });
                    infoWindow.addEventListener("close", function (e) {
                        //alert(e.type);
                    });
                } else {
                    if (infoWindow._isOpen) {
                        infoWindow.setContent(html);
                    }
                }
                infoWindow.open(marker);
                infoWindow.hide();
                infoWindow._isOpen = false;
                //that.parent.data.bdmapInstance.addOverlay(infoWindow);
                infoWindow._extra_data = data;
                that.parent.data.infoBoxs[uid] = infoWindow;
                callback && callback(infoWindow);
            }
        });
    };

    MarkerInfoBox.prototype.isOpen = function (uid) {
        var infoWindow = that.parent.data.infoBoxs[uid];
        if (!infoWindow) {
            return false;
        }
        return infoWindow._isOpen;      //api有这个变量,不需自行设置
    };

    MarkerInfoBox.prototype.showMarkerInfoBox = function (uid) {
        var infoWindow = that.parent.data.infoBoxs[uid];
        if (!infoWindow) {
            return;
        }
        var marker = that.parent.data.markers[uid];
        if (!marker) {
            alert("未选中或该设备暂无信息");
            return;
        }
        infoWindow.open(marker);
    }

    MarkerInfoBox.prototype.updateOpenMarkerInfoBox = function (uid) {
        var infoWindow = that.parent.data.infoBoxs[uid];
        if (!infoWindow) {
            return;
        }
        if (!infoWindow._isOpen) {  //没有打开不进行更新
            return;
        }
        var marker = that.parent.data.markers[uid];
        if (!marker) {
            return;
        }
        this.addMarkerInfoBox(uid, function (infoWindow) {
            infoWindow.open(marker);
        });
    };


})(jQuery, window, document);