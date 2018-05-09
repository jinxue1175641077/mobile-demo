/*从下往上弹出操作菜单*/
var LayerMenu = function(item) {
    var me = this;
    var defaults = {
        div: $('body'),
        data: [],
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var MENU_CLASS = 'ct-footerMenu-menu';
    var UL_CLASS = 'ct-footerMenu-menu-ul';
    var LI_CLASS = 'ct-footerMenu-menu-li';
    var ANIMATE_TIME = 200;
    var boxDiv = $('<div class="ct-footerMenu"></div>');
    var menuDiv = $('<div class="' + MENU_CLASS + '"></div>');
    var ulDiv = $('<ul class="' + UL_CLASS + '"></ul>');
    this.Create = function(data) {
        ulDiv.html('');
        for(var i in data) {
            var liDiv = $('<li class="' + LI_CLASS + '"></li>')
            if(data[i].word) {
                var textDiv = $('<span  class="ct-footerMenu-menu-text">' + data[i].word + '</span>');
                liDiv.append(textDiv);
            }
            if(data[i].onClick)
                (function(data) {
                    liDiv.on('click', function(e) {
                        data.onClick({
                            item: data,
                            dom: $(this),
                            e: e
                        });
                    });
                })(data[i]);
            ulDiv.append(liDiv);
        }

    }
    this.Show = function() {
        boxDiv.show();
        var liDiv = boxDiv.find('.' + LI_CLASS);
        if(liDiv.length != 0)
            boxDiv.find('.' + MENU_CLASS).height(liDiv.length * liDiv.eq(0).outerHeight(true));
    }
    this.Hide = function() {
        boxDiv.find('.' + MENU_CLASS).height(0);
        setTimeout(function() {
            boxDiv.hide();
        }, ANIMATE_TIME);

    }
    this._init = function() {
        me.Create(me.data);
        menuDiv.append(ulDiv);
        boxDiv.html(menuDiv);
        boxDiv.hide();
        me.div.append(boxDiv);
    }
    this._init();
};

/*菜单导航*/
var FooterMenu = function(item) {
    var me = this;
    var defaults = {
        data: [],
        activeClass: "ct-menu-active",
        div: $("<div></div>"),
        stopLink: true,
        layerMaxHeight: 60,
        isMenuDropdown: false,
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var _data = [];

    var UL_CLASS_CLASS = 'ct-menu-ul';
    var LI_CLASS_CLASS = 'ct-menu-li';
    var LINK_CLASS_CLASS = 'ct-menu-link';
    var TEXT_CLASS_CLASS = 'ct-menu-text';
    var SUB_MENU_BOX_CLASS = 'ct-sub-menu';
    var SUB_MENU_CLASS = 'ct-sub-menu-ul';
    var UP_SUB_MENU = 'ct-sub-menu-ul-up';
    var DOWN_SUB_MENU = 'ct-sub-menu-ul-down';

    var boxDiv = $('<div class="ct-menu"></div>');
    var menuDiv = $('<ul class="ct-menu-ul"></ul>');
    boxDiv.append(menuDiv);

    this.CreateOne = function(data, isChildren) {
        var liDiv = $('<li class="' + LI_CLASS_CLASS + '"></li>');
        var aDiv = $('<a class="' + LINK_CLASS_CLASS + '" href="javascript:;"><span class="' + TEXT_CLASS_CLASS + '"></span></a>');
        liDiv.append(aDiv);
        if(data.iconClass) {
            var iDiv = $('<i></i>');
            iDiv.addClass('glyphicon ' + data.iconClass);
            aDiv.prepend(iDiv);
        }
        if(data.text)
            aDiv.find('.' + TEXT_CLASS_CLASS).html(data.text);
        if(data.URL)
            aDiv.attr('href', data.URL)
        if(data.children) {
            var CBoxDiv = $('<div class="' + SUB_MENU_BOX_CLASS + '"></div>');
            var CUlDiv = $('<ul class="' + SUB_MENU_CLASS + '"></ul>');
            CBoxDiv.append(CUlDiv);
            for(var i in data.children) {
                CUlDiv.append(me.CreateOne(data.children[i], true));
            }
            if(me.isMenuDropdown) {
                CUlDiv.addClass(DOWN_SUB_MENU);
            } else {
                CUlDiv.addClass(UP_SUB_MENU);
            }
            liDiv.append(CBoxDiv);
        } else if(data.layerMenu) {
            var CBoxDiv = $('<div class="' + SUB_MENU_BOX_CLASS + '"></div>');
            CBoxDiv.append(data.layerMenu);
            if(data.layerFun)
                data.layerFun({
                    item: data,
                    dom: $(data.layerMenu)
                })
            CBoxDiv.children().css({
                'max-height': $(window).height() * me.layerMaxHeight / 100 + 'px',
                'overflow': 'auto'
            });
            liDiv.append(CBoxDiv);
        }
        if(isChildren) {
            aDiv.on('click', function(e) {
                e.stopPropagation();
                if(data.onClick) {
                    data.onClick({
                        item: data,
                        dom: liDiv,
                        e: e,
                        URL: data.URL
                    });
                }
                var index = liDiv.index();
                if(aDiv.attr('class').indexOf(me.activeClass) < 0) {
                    me.ClearActive();
                    me.Active(liDiv.parents('.' + LI_CLASS_CLASS).index(), index);
                }
                return !me.stopLink;
            });
        } else {
            aDiv.on('click', function(e) {
                e.stopPropagation();
                if(data.onClick) {
                    data.onClick({
                        item: data,
                        dom: liDiv,
                        e: e,
                        URL: data.URL
                    });
                }
                var index = liDiv.index();
                if(aDiv.attr('class').indexOf(me.activeClass) < 0) {
                    me.ClearActive();
                    me.Active(index);
                }
                if(liDiv.children('.' + SUB_MENU_BOX_CLASS).length != 0) {
                    if(!_data[index].isFold) {
                        me.Fold(index);
                    } else {
                        me.Open(index);
                    }
                } else {
                    me.FoldAll();
                }
                return !me.stopLink;
            });
        }

        menuDiv.append(liDiv);
        return liDiv;
    }
    this.Create = function(data) {
        menuDiv.html('');
        for(var i in data) {
            data[i].isFold = false;
            _data.push(data[i]);
            me.CreateOne(data[i]);
        }
    };
    this.Fold = function(index) {
        var CBoxDiv = menuDiv.children('.' + LI_CLASS_CLASS).eq(index).children('.' + SUB_MENU_BOX_CLASS);
        CBoxDiv.height(0);
        if(me.isMenuDropdown) {
            CBoxDiv.css({
                'bottom': '0px',
            });
        }
        _data[index].isFold = true;
    };
    this.FoldAll = function() {
        menuDiv.find('.' + SUB_MENU_BOX_CLASS).each(function() {
            $(this).height(0);
            if(me.isMenuDropdown) {
                $(this).css({
                    'bottom': '0px',
                });
            }
            _data[$(this).parent().index()].isFold = true;
        });
    };
    this.Open = function(index) {
        var li = menuDiv.children('.' + LI_CLASS_CLASS).eq(index);
        var CBoxDiv = li.children('.' + SUB_MENU_BOX_CLASS);
        me.FoldAll();
        if(CBoxDiv) {
            CBoxDiv.height(CBoxDiv.children().outerHeight(true));
            if(me.isMenuDropdown) {
                CBoxDiv.css({
                    'bottom': -CBoxDiv.children().outerHeight(true) + 'px',
                });
            }
        }
        _data[index].isFold = false;
    };

    this.ClearActive = function() {
        menuDiv.find('.' + me.activeClass).each(function() {
            $(this).removeClass(me.activeClass).children('a').removeClass(me.activeClass);
        });

    };
    this.Active = function(index, childrenIndex) {
        var li = menuDiv.children('.' + LI_CLASS_CLASS).eq(index);
        var aDiv = li.children('.' + LINK_CLASS_CLASS);
        li.addClass(me.activeClass);
        aDiv.addClass(me.activeClass);
        if(typeof childrenIndex != 'undefined') {
            var CLiDiv = li.children('.' + SUB_MENU_BOX_CLASS).children('.' + SUB_MENU_CLASS).children('.' + LI_CLASS_CLASS).eq(childrenIndex);
            var CADiv = CLiDiv.children('.' + LINK_CLASS_CLASS);
            CLiDiv.addClass(me.activeClass);
            CADiv.addClass(me.activeClass);
        }
    };
    this.SetLayerWidth = function(li) {
        var subBoxDiv = li.find('.' + SUB_MENU_BOX_CLASS);
        if(subBoxDiv.length != 0) {
            var index = li.index();
            var data = _data[index];
            var width = li.outerWidth(true) + 1;
            if(data.layerWidth) {
                var ownW = data.layerWidth > $(window).width() ? $(window).width() : data.layerWidth;
            } else {
                var ownW = width;
            }
            subBoxDiv.width(ownW);
            if(me.isMenuDropdown) {
                subBoxDiv.css({
                    'bottom': '0px',
                });
            } else {
                subBoxDiv.css({
                    'bottom': subBoxDiv.siblings().outerHeight(true) + 'px',
                });
            }

            var left = subBoxDiv.parent().offset().left + (width - ownW) / 2;
            if(left < 0) {
                left = 0
            }
            subBoxDiv.css({
                'left': left,
            });
            if(left + ownW > $(window).width()) {
                subBoxDiv.css({
                    'right': 0,
                    'left': 'inherit'
                });
            }
        }
    }

    var init = function() {
        me.Create(me.data);
        me.FoldAll();
        me.div.append(boxDiv);
        menuDiv.children().each(function() {
            me.SetLayerWidth($(this));
        });
    }
    init();
}

/*加载*/
var Load = function(item) {
    var me = this;
    var defaults = {
        div: $("<div></div>"),
        word: "正在加载中...",
        isBefore: false,
        className: ""
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var boxDom = $('<div class="ct-load ' + me.className + '"></div>');
    var IMG_URL = 'image/load.gif';
    var TEXT_CLASS = 'ct-load-text';
    this.Show = function() {
        boxDom.slideDown();
    }
    this.Hide = function() {
        boxDom.slideUp();
    }

    this.SetBefore = function(isBefore) {
        if(!(typeof isBefore == 'undefined')) {
            me.isBefore = isBefore;
        }
        me.isBefore ? me.div.prepend(boxDom) : me.div.append(boxDom);
    };
    this.SetDiv = function(div) {
        if(!(typeof div == 'undefined')) {
            me.div = div;
        }
        me.SetBefore();
    };
    this.SetWord = function(word) {
        if(!(typeof word == 'undefined')) {
            me.word = word;
        }
        var textDom = boxDom.find('.' + TEXT_CLASS);
        if(me.word) {
            if(textDom.length == 0) {
                textDom = $('<span class="' + TEXT_CLASS + '">' + this.word + '</span>');
                boxDom.append(textDom);
            }
            textDom.html(me.word);
        } else {
            if(textDom.length != 0) {
                textDom.remove();
            }
        }
    }

    this.Delete = function() {
        boxDom.remove();
    };

    this._init = function() {
        var imgDom = $('<img src="' + IMG_URL + '" alt="" class="ct-load-img" />');
        boxDom.append(imgDom);
        me.SetWord();
        boxDom.hide();
        me.SetBefore();
    }
    this._init();
}

/*多行输入框*/
var Textarea = function(item) {
    var me = this;
    var defaults = {
        div: $("<div></div>"),
        minRow: 2,
        maxRow: 6,
        className: "",
        textAreaClass: "",
        eventFun: []
    };
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var boxDom = $('<div class="ct-textarea-box ' + me.className + '"></div>');
    var LINE_HEIGHT = 22;
    var PADDING = 5 * 2;
    var BORDER_WIDTH = 1 * 2;

    var extraHeight = PADDING + BORDER_WIDTH;
    this._init = function() {
        var textareaDom = $('<textarea class="ct-textarea ' + me.textAreaClass + '" name="" rows="" cols=""></textarea>');
        boxDom.append(textareaDom);
        me.div.append(boxDom);
        textareaDom.css({
            'line-height': LINE_HEIGHT + 'px',
            'padding-top': PADDING / 2 + 'px',
            'padding-bottom': PADDING / 2 + 'px',
        });
        textareaDom.height(LINE_HEIGHT * me.minRow + extraHeight);
        textareaDom.on('keyup', function() {
            var scrollHeight = $(this)[0].scrollHeight;
            var rowNum = Math.ceil((scrollHeight - extraHeight) / LINE_HEIGHT);
            if(rowNum < me.maxRow + 1 && rowNum > me.minRow) {
                $(this).css({
                    height: "auto",
                });
                $(this).css({
                    height: LINE_HEIGHT * rowNum + PADDING
                });
            }
        });

        for(var i in me.eventFun) {
            (function(active) {
                textareaDom.on(active.ev, function(e) {
                    active.fun({
                        e: e,
                        dom: $(this),
                        value: $(this).val()
                    })
                });

            })(me.eventFun[i])

        }
    }
    this._init();
}

/*选项卡*/
var NavigationM = function(item) {
    var me = this;
    var defaults = {
        div: $('body'),
        width: "100%",
        height: '100%',
        data: [],
        className: '',
        navClass: '',
        contentClass: '',
        selectedClass: 'ct-navigation-tab-Selected',
        appoint: {
            ev: 'ev',
            fun: 'fun',
            k: 'k',
            isSelected: 'isSelected',
            title: 'title',
            URL: 'URL',
            title: 'title',
            onClick: 'onClick',
            content: 'content'
        },
        onRightSlide: function() {},
        onLeftSlide: function() {},
        onUpSlide: function() {},
        onDownSlide: function() {},
    };
    this.setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], this.setting[i] || {});
        } else {
            this[i] = this.setting[i];
        }
    }
    var _data = [];
    var CONTENT_SELECT_CLASS = 'ct-navigation-content-Selected';
    var CONTENT_LI_CLASS = 'ct-navigation-content-li';
    var CONTENT_SCROLL_CLASS = 'ct-navigation-content';
    var BOX_WIDTH = 0;
    var INDEX_K = -1;

    var boxDiv = $('<div class="ct-navigation-box">' +
        '<div class="ct-navigation-tab"></div>' +
        '<div class="ct-navigation-content"></div>' +
        '</div>');
    var tabDiv = boxDiv.find('.ct-navigation-tab');
    var contentDiv = boxDiv.find('.' + CONTENT_SCROLL_CLASS);
    var animateTime = 500;

    this.CreateNav = function(data) {
        _data.push(data);
        if(data[me.appoint.title] && data[me.appoint.k]) {
            var tabLiDiv = $('<div class="ct-navigation-tab-li">' +
                '<span class="ct-navigation-tab-li-text">' + data[me.appoint.title] + '</span>' +
                '</div>');
            tabDiv.append(tabLiDiv);
            var contentLiDiv = $('<div class="' + CONTENT_LI_CLASS + '"></div>');
            contentDiv.append(contentLiDiv);
            if(data[me.appoint.content]) {
                contentLiDiv.append(data[me.appoint.content]);
            } else if(data[me.appoint.URL]) {
                var iframeDiv = $('<iframe src="" class="ct-navigation-iframe" ></iframe>');
                contentLiDiv.append(iframeDiv);
            }
            if(data[me.appoint.isSelected])
                INDEX_K = data[me.appoint.k];
            tabLiDiv.on('click', function(e) {
                e.stopPropagation();
                me.SetSelected(data[me.appoint.k]);
                if(data[me.appoint.onClick]) {
                    data[me.appoint.onClick]({
                        item: data,
                        dom: tabLiDiv
                    });
                }
            });
        }
    };

    this.SetClassName = function(className) {
        if(me.className)
            boxDiv.removeClass(me.className);
        me.className = className;
        boxDiv.addClass(me.className);
    };

    this.SetNavClass = function(className) {
        var tabChild = tabDiv.children('.ct-navigation-tab-li');
        if(me.navName)
            tabChild.each(function() {
                $(this).removeClass(me.navName);
            });
        me.navName = className;
        tabChild.each(function() {
            $(this).addClass(me.navName);
        });
    };
    this.SetSelectedClass = function(className) {
        var tabChild = tabDiv.children('.ct-navigation-tab-li');
        if(me.selectedClass)
            tabChild.each(function() {
                $(this).removeClass(me.selectedClass);
            });
        me.selectedClass = className;
        var t = 0;
        for(var i in _data) {
            if(_data[i][me.appoint.isSelected]) {
                tabChild.eq(t).addClass(me.selectedClass);
                break;
            }
            t++;
        }
    };

    this.SetContentClass = function(className) {
        var contentChild = contentDiv.children('.' + CONTENT_LI_CLASS);
        if(me.contentClass)
            contentChild.each(function() {
                $(this).removeClass(me.contentClass);
            });
        me.contentClass = className;
        contentChild.each(function() {
            $(this).addClass(me.contentClass);
        });
    };

    this.DeleteTab = function(k) {
        var t = 0;
        for(var i in _data) {
            if(k == _data[i][me.appoint.k]) {
                var isSelected = _data[i][me.appoint.isSelected];
                me.Delete(_data, i);
                tabDiv.find('.ct-navigation-tab-li').eq(t).remove();
                contentDiv.find('.' + CONTENT_LI_CLASS).eq(t).remove();
                if(isSelected) {
                    me.SetFirstSelected();
                }
                break;
            }
            t++;
        }
    };
    this.SetSelected = function(k) {
        for(var i in _data) {
            if(k == _data[i][me.appoint.k]) {
                var oldContentLiDiv = contentDiv.find('.' + CONTENT_SELECT_CLASS);
                var oldIndex = oldContentLiDiv.index();
                var newIndex = parseInt(i);

                if(newIndex == oldIndex) return;
                if(newIndex > oldIndex) {
                    contentDiv.children().eq(newIndex).css({
                        'left': BOX_WIDTH + 1
                    })
                } else {
                    contentDiv.children().eq(newIndex).css({
                        'left': -BOX_WIDTH - 1
                    })
                }
                oldContentLiDiv.css({
                    'z-index': 1
                }).siblings().css({
                    'z-index': 0,
                });
                INDEX_K = k;
                _data[i][me.appoint.isSelected] = true;
                var tabLiDiv = tabDiv.children('.ct-navigation-tab-li').eq(newIndex);
                var newContentLiDiv = contentDiv.children('.' + CONTENT_LI_CLASS).eq(newIndex);
                var iframeDiv = newContentLiDiv.find('.ct-navigation-iframe');
                tabLiDiv.addClass(me.selectedClass).siblings('.ct-navigation-tab-li').removeClass(me.selectedClass);
                newContentLiDiv.addClass(CONTENT_SELECT_CLASS).siblings('.' + CONTENT_LI_CLASS).removeClass(CONTENT_SELECT_CLASS);
                newContentLiDiv.css({
                    'z-index': 2,
                });
                newContentLiDiv.animate({
                    'left': -1
                }, animateTime);
                if(_data[i][me.appoint.URL] && iframeDiv.attr('src') != _data[i][me.appoint.URL])
                    iframeDiv.attr('src', _data[i][me.appoint.URL])
                return;
            } else {
                _data[i][me.appoint.isSelected] = false;
            }
        }
    };
    this.GetDataLength = function() {
        if(_data.length) {
            return _data.length;
        } else {
            var t = 0;
            for(var i in _data) {
                t++;
            }
            return t;
        }
    };

    this.SetSelectedNext = function() {
        for(var i in _data) {
            i = parseInt(i);
            if(_data[i][me.appoint.isSelected]) {
                if(i + 1 != me.GetDataLength())
                    me.SetSelected(_data[i + 1][me.appoint.k]);
                break;
            }
        }
    };

    this.SetSelectedPrev = function() {
        for(var i in _data) {
            i = parseInt(i);
            if(_data[i][me.appoint.isSelected]) {
                if(i != 0)
                    me.SetSelected(_data[i - 1][me.appoint.k]);
                break;
            }
        }
    };

    this.SetFirstSelected = function() {
        if(_data[0])
            me.SetSelected(_data[0][me.appoint.k]);
    };

    this.SetLastSelected = function() {
        if(_data[me.GetDataLength() - 1])
            me.SetSelected(_data[me.GetDataLength() - 1][me.appoint.k]);
    };

    this.SetWidth = function(width) {
        if(width) {
            if(/^\d+$/.test(width)) {
                boxDiv.css("width", width + 'px');
            } else {
                boxDiv.css("width", width);
            }
        }
    };
    this.SetHeight = function(height) {
        if(height) {
            if(/^\d+$/.test(height)) {
                boxDiv.css("height", height + 'px');
            } else {
                boxDiv.css("height", height);
            }
        }
    };

    this.SetNavHeight = function(height) {
        if(height) {
            if(/^\d+$/.test(height)) {
                tabDiv.css("height", height + 'px');
            } else {
                tabDiv.css("height", height);
            }
        }
    };
    this.GetData = function() {
        return _data;
    };

    this._init = function() {
        for(var i in this.data) {
            me.CreateNav(this.data[i]);
        }
        me.SetClassName(me.className);
        me.SetNavClass(me.navClass);
        me.SetContentClass(me.contentClass);
        me.SetSelectedClass(me.selectedClass);

        contentDiv.children().hide();
        me.div.append(boxDiv);
        BOX_WIDTH = boxDiv.width();
        INDEX_K == -1 ? me.SetFirstSelected() : me.SetSelected(INDEX_K);

        var load = new ZJ.JIECL.UI.Load({
            div: contentDiv,
            isBefore: true,
            word: ''
        });
        load.Show();
        setTimeout(function() {
            load.Hide();
            contentDiv.children().show();
            load.Delete();
        }, animateTime);

        me.SetWidth(me.width);
        me.SetHeight(me.height);

        //滑动事件

        new ZJ.JIECL.UI.Pan({
            div: contentDiv,
            ev: "panleft",
            fun: function() {
                var action = me.onLeftSlide();
                if(typeof action != 'undefined' && action)
                    me.SetSelectedNext();
            },
        });
        new ZJ.JIECL.UI.Pan({
            div: contentDiv,
            ev: "panright",
            fun: function() {
                var action = me.onRightSlide();
                if(typeof action != 'undefined' && action)
                    me.SetSelectedPrev();
            },
        });
        new ZJ.JIECL.UI.Pan({
            div: contentDiv,
            ev: "pandown",
            fun: function() {},
        });
        new ZJ.JIECL.UI.Pan({
            div: contentDiv,
            ev: "panup",
            fun: function() {},
        });

    };

    this._init();
    return this;
};

/*手指滑动事件，基于Hammer-2.0.8.min.js*/
var Pan = function(item) {
    var me = this;
    var defaults = {
        div: $("body"),
        stopTime: 1000,
        ev: '',
        fun: function() {},
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var hammerDom = new Hammer(me.div[0]);
    //水平 pan和swipe和多点触控pinch和rotate识别。默认情况下，压缩和旋转识别器将被禁用，因为它们会使元素阻塞，但您可以通过调用以下方式启用它们： 
    hammerDom.add(new Hammer.Pinch());
    hammerDom.add(new Hammer.Rotate());
    hammerDom.remove('rotate'); // 移除旋转手势事件

    var isTrue = true;
    var timer = '';
    hammerDom.on(me.ev, function(e) {
        if(isTrue) {
            isTrue = false;
            me.fun();
            clearTimeout(timer);
            timer = setTimeout(function() {
                isTrue = true;
            }, me.stopTime);
        }
    });
}

/*列表*/
var TableText = function(item) {
    var me = this;
    var defaults = {
        div: $("body"),
        data: [],
        titleData: [],
        className: '',
        cols: [],
        onRowClick: function() {},
        onRowLeftSlide: function() {},
        onRowRightSlide: function() {},
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }

    var boxDom = $('<div class="ct-text-list ' + me.className + '"></div>');
    var titleDom = $('<div class="ct-text-list-title"></div>');
    var contentDom = $('<ul class="ct-text-list-content"></ul>');

    var _data = [];
    this.CreateOne = function(data) {
        var Data = {};
        $.extend(true, Data, data);
        _data.push(Data);

        var liDom = $('<li></li>');
        var dlDom = $('<dl></dl>');
        for(var i in me.cols) {
            var ddDom = $('<dd></dd>');
            if(me.cols[i].doFormat) {
                var showData = me.cols[i].doFormat(data);
                showData ? ddDom.html(showData) : ddDom.html(data[me.cols[i].k]);
            } else {
                ddDom.html(data[me.cols[i].k]);
            }
            if(me.cols[i].align)
                ddDom.css('text-align', me.cols[i].align);
            dlDom.append(ddDom);
        }
        liDom.append(dlDom);

        liDom.on('click', function(e) {
            e.stopPropagation();
            me.onRowClick({
                item: Data,
                dom: $(this),
                e: e,
                index: $(this).index()
            });
        });
        new ZJ.JIECL.UI.Pan({
            div: liDom,
            ev: "panleft",
            fun: function() {
                me.onRowLeftSlide({
                    item: Data,
                    dom: liDom,
                    index: liDom.index()
                });
            },
        });
        new ZJ.JIECL.UI.Pan({
            div: liDom,
            ev: "panright",
            fun: function() {
                me.onRowRightSlide({
                    item: Data,
                    dom: liDom,
                    index: liDom.index()
                });
            },
        });
        contentDom.append(liDom);
    }

    this.Create = function(data) {
        for(var i in data) {
            me.CreateOne(data[i]);
        }
    }
    this.LoadData = function(data) {
        contentDom.html('');
        _data = [];
        me.Create(data);
    }
    this.Delete = function(index) {
        contentDom.children().eq(index).remove();
        _data.splice(index, 1);
    }
    this.GetData = function() {
        return _data;
    };

    this._init = function() {
        var dlDom = $('<dl></dl>');
        titleDom.append(dlDom);
        for(var i in me.titleData) {
            var ddDom = $('<dd></dd>');
            if(me.titleData[i].title)
                ddDom.html(me.titleData[i].title)
            if(me.titleData[i].className)
                ddDom.addClass(me.titleData[i].className)
            if(me.titleData[i].onClick)
                (function(titleData) {
                    ddDom.on('click', function(e) {
                        e.stopPropagation();
                        me.titleData[i].onClick({
                            dom: (this),
                            item: titleData,
                            e: e
                        });
                    });
                })(me.titleData[i]);
            dlDom.append(ddDom);
        }

        me.Create(me.data);
        boxDom.append(titleDom, contentDom);
        me.div.append(boxDom);

    }
    this._init();
}

/*筛选*/
var Filter = function(item) {
    var me = this;
    var defaults = {
        div: $("body"),
        titleData: [],
        className: '',
        hasMore: false,
        filterHtml: '',
        filterFun: function() {},
        moreIconClass: 'glyphicon glyphicon-filter',
        moreIconText: "筛选",
        operButton: [],
        onTitleClick: function() {},
        appoint: {
            title: "title"
        }
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var boxDom = $('<div class="ct-filter-box"></div>');
    var titleDom = $('<div class="ct-filter-title"></div>');
    var bodyDom = $('body');
    var MASK_CLASS = 'ct-filter-mask';
    var MORE_CLASS = 'ct-filter-more';
    var TITLE_LI_CLASS = 'ct-filter-title-li';
    var TITLE_A_CLASS = 'ct-filter-title-link';
    var TITLE_ICON_CLASS = 'ct-filter-title-icon';
    var TITLE_ACTIVE_CLASS = 'ct-filter-title-active';

    var timestamp = new Date().getTime();

    boxDom.append(titleDom);
    this.Hide = function() {
        var maskDom = bodyDom.find('.' + MASK_CLASS + timestamp);
        var moreDom = bodyDom.find('.' + MORE_CLASS + timestamp);
        moreDom.css({
            'right': -moreDom.outerWidth(true),
            'left': 'inherit'
        });
        maskDom.hide();
    };
    this.Show = function() {
        var maskDom = bodyDom.find('.' + MASK_CLASS + timestamp);
        var moreDom = bodyDom.find('.' + MORE_CLASS + timestamp);
        maskDom.show();
        moreDom.css({
            'right': 0,
            'left': 'inherit'
        });

    };
    this.SetActive = function(num) {
        var titleLiDom = titleDom.find('.' + TITLE_LI_CLASS).eq(num - 1);
        titleLiDom.addClass(TITLE_ACTIVE_CLASS).siblings().removeClass(TITLE_ACTIVE_CLASS);
    };
    this.SetIcon = function(num, iconClass) {
        var titleADom = titleDom.find('.' + TITLE_LI_CLASS).eq(num - 1).find('.' + TITLE_A_CLASS);
        if(iconClass) {
            var iconDom = titleADom.find('.' + TITLE_ICON_CLASS);
            if(iconDom.length == 0) {
                iconDom = $('<i class=""></i>');
                titleADom.append(iconDom);
            }
            iconDom.attr('class', TITLE_ICON_CLASS + ' ' + iconClass);
        }
    }
    this._init = function() {
        var titleUlDom = $('<ul class="ct-filter-title-ul"></ul>');
        for(var i in me.titleData) {
            var titleLiDom = $('<li class="' + TITLE_LI_CLASS + '"></li>');
            var titleADom = $('<a href="javascript:;" class="' + TITLE_A_CLASS + '"></a>');
            if(me.titleData[i][me.appoint.title]) {
                var spanDom = $('<span class="ct-filter-title-text">' + me.titleData[i][me.appoint.title] + '</span>');
                titleADom.append(spanDom);
            }
            (function(data) {
                titleLiDom.on('click', function(e) {
                    e.stopPropagation();
                    me.onTitleClick({
                        item: data,
                        dom: $(this)
                    });
                });
            })(me.titleData[i]);

            titleLiDom.append(titleADom);
            titleUlDom.append(titleLiDom);
        }
        titleDom.append(titleUlDom);
        if(me.hasMore) {
            var titleMoreDom = $('<li class="' + TITLE_LI_CLASS + ' ct-filter-title-more">' +
                '<a href="javascript:;" class="' + TITLE_A_CLASS + '"><span class="ct-filter-title-text">' + me.moreIconText + '</span><i class="' + TITLE_ICON_CLASS + ' ' + me.moreIconClass + '"></i></a>' +
                '</li>');
            titleMoreDom.on('click', function() {
                me.Show();
            });
            titleUlDom.append(titleMoreDom);

            //遮罩层
            var maskDom = $('<div class="' + MASK_CLASS + ' ' + (MASK_CLASS + timestamp) + '"></div>');
            var moreDom = $('<div class="' + MORE_CLASS + ' ' + (MORE_CLASS + timestamp) + '" ></div>');
            var moreContentDom = $('<div class = "ct-filter-more-content"></div>');
            var moreFooterDom = $('<div class = "ct-filter-more-footer"></div>');

            if(me.filterHtml) {
                moreContentDom.html(me.filterHtml);
                me.filterFun({
                    dom: me.filterHtml
                });
            }
            for(var i in me.operButton) {
                var buttonDom = $('<button class = "ZJC-M-button ct-filter-more-button" ></button>');
                if(me.operButton[i].bText)
                    buttonDom.html(me.operButton[i].bText)
                if(me.operButton[i].className)
                    buttonDom.addClass(me.operButton[i].className)
                if(me.operButton[i].onClick)
                    (function(clickFun) {
                        buttonDom.on('click', function(e) {
                            clickFun(e);
                        })
                    })(me.operButton[i].onClick);
                moreFooterDom.append(buttonDom);

            }
            new ZJ.JIECL.UI.Pan({
                div: moreDom,
                ev: 'panright',
                fun: me.Hide
            });
            moreDom.css('left', $(window).width());
            moreDom.append(moreContentDom, moreFooterDom);
            bodyDom.append(maskDom, moreDom);

        }

        me.div.append(boxDom);
        me.Hide();
    }
    this._init();
}

/*多选单选展示*/
var Select = function(item) {
    var me = this;
    var defaults = {
        div: $("body"),
        data: [],
        title: '',
        className: '',
        activeClass: 'ct-select-active',
        doFormat: function() {},
        isSingle: false,
        onSelectClick: function() {},
        appoint: {
            text: "text",
            isSelect: 'isSelect'
        }
    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }
    var boxDom = $('<div class="ct-select ' + me.className + '"></div>');

    var LI_CLASS = 'ct-select-li';
    var _data = new Array();
    this.SetSelected = function(index, isSelect) {
        if(typeof isSelect == 'undefined') var isSelect = true;
        if(me.isSingle && isSelect) {
            boxDom.find('.' + LI_CLASS).each(function(i) {
                me.SetSelected(i, false);
            });
        }
        _data[index][me.appoint.isSelect] = isSelect;
        if(isSelect) {
            boxDom.find('.' + LI_CLASS).eq(index).addClass(me.activeClass);
        } else {
            boxDom.find('.' + LI_CLASS).eq(index).removeClass(me.activeClass);
        }
    };
    this.GetData = function() {
        return _data;
    }
    this.GetSData = function() {
        var data = [];
        for(var i in _data)
            if(_data[i][me.appoint.isSelect])
                data.push(_data[i])
        return data;
    }
    this._init = function() {
        if(me.title) {
            var titleDom = $('<div class="ct-select-label">' + me.title + '</div>');
            boxDom.append(titleDom);
        }
        var selectDom = $('<div class="ct-select-option"></div>');
        var selectUlDom = $('<ul class="ct-select-ul"></ul>');
        for(var i in me.data) {
            var Data = [];
            $.extend(true, Data, me.data[i]);

            var liDom = $('<li class="' + LI_CLASS + '"></li>');
            if(me.data[i][me.appoint.text]) {
                var sText = me.doFormat(Data);
                if(!sText) {
                    sText = me.data[i][me.appoint.text];
                }
                var spanDom = $('<span class="ct-select-text">' + sText + '</span>');
                liDom.append(spanDom);
            }
            if(typeof me.data[i][me.appoint.isSelect] == 'undefined')
                me.data[i][me.appoint.isSelect] = false;
            _data.push(me.data[i]);
            (function(data) {
                liDom.on('click', function() {
                    var index = $(this).index();
                    me.SetSelected(index, !_data[index][me.appoint.isSelect]);
                    me.onSelectClick({
                        item: data,
                        dom: $(this),
                        index: index
                    });
                });
            })(me.data[i]);
            selectUlDom.append(liDom);
        }
        selectDom.append(selectUlDom);
        boxDom.append(selectDom);
        for(var i in _data) {
            i = parseInt(i);
            me.SetSelected(i, _data[i][me.appoint.isSelect]);
        }

        me.div.append(boxDom);
    }
    this._init();
}

/*搜索筛选*/
var Search = function(item) {
    var me = this;
    var defaults = {
        div: $("body"),
        className: '',
        inputValue: '',
        inputTips: "",
        inputClass: '',
        searchIconClass: "glyphicon glyphicon-search",
        isMore: false,
        moreBtn: {
            bText: "更多",
            className: "",
            iconClass: "glyphicon glyphicon-chevron-down",
            onClick: function() {},
        },
        searchHtml: "",
        searchFun: function() {},
        operButton: [],

        onInputClick: function() {},
        onInputFocus: function() {},
        onInputBlur: function() {},
        onSearchClick: function() {},

    }
    var setting = $.extend({}, defaults, item || {});
    for(var i in defaults) {
        if(typeof defaults[i] == 'object') {
            this[i] = $.extend({}, defaults[i], setting[i] || {});
        } else {
            this[i] = setting[i];
        }
    }

    var MORE_CLASS = 'ct-search-more';
    var INPUT_CLASS = 'ct-search-input';
    var isShow = false;
    var boxDom = $('<div class="ct-search ' + me.className + '"></div>');
    var searchDom = $('<div class="ct-search-form"></div>');
    boxDom.append(searchDom);
    this.Hide = function() {
        isShow = false;
        var moreDom = boxDom.children('.' + MORE_CLASS);
        moreDom.slideUp();
    };
    this.Show = function() {
        isShow = true;
        var moreDom = boxDom.children('.' + MORE_CLASS);
        moreDom.slideDown();
    };
    this.GetValue = function() {
        return searchDom.find('.' + INPUT_CLASS).val();
    }

    this._init = function() {
        var formDom = $('<div class="ct-search-form-input"></div>');
        var inputDom = $('<input type="text" class="ct-search-input ' + me.inputClass + '" placeholder="' + me.inputTips + '"/>');
        var searchIconDom = $(' <i class="ct-search-icon ' + me.searchIconClass + '"></i>');
        inputDom.on('click', me.onInputClick);
        inputDom.on('focus', me.onInputFocus);
        inputDom.on('blur', me.onInputBlur);
        searchIconDom.on('click', me.onSearchClick);
        inputDom.val(me.inputValue);
        formDom.append(inputDom, searchIconDom);
        searchDom.append(formDom);
        if(me.isMore) {
            var moreBtnDom = $(' <div class="ct-search-btn"></div>');
            var moreTextDom = $('<span class="ct-search-more-text"></span>');
            var moreIconDom = $('<i class="ct-search-more-icon "></i>');
            if(me.moreBtn.bText)
                moreTextDom.html(me.moreBtn.bText);
            if(me.moreBtn.className)
                moreIconDom.addClass(me.moreBtn.className);
            if(me.moreBtn.iconClass)
                moreIconDom.addClass(me.moreBtn.iconClass);

            moreBtnDom.on('click', function(e) {
                e.stopPropagation();
                isShow ? me.Hide() : me.Show();
                if(me.moreBtn.onClick)
                    me.moreBtn.onClick();

            });
            moreBtnDom.append(moreTextDom, moreIconDom);
            searchDom.append(moreBtnDom);

            if(me.searchHtml) {
                var moreDom = $('<div class="' + MORE_CLASS + '"></div>');
                var moreContentDom = $(' <div class="ct-search-more-content"></div>');
                var moreFooterDom = $('<div class="ct-search-more-footer"></div>');
                isShow = false;
                moreDom.hide();

                moreContentDom.append(me.searchHtml);
                me.searchFun(me.searchHtml);
                moreFooterDom.hide();
                moreDom.append(moreContentDom, moreFooterDom);
                for(var i in me.operButton) {
                    moreFooterDom.show();
                    var buttonDom = $('<button class="ct-search-oper-btn"></button>');
                    if(me.operButton[i].bText)
                        buttonDom.html(me.operButton[i].bText)
                    if(me.operButton[i].className)
                        buttonDom.addClass(me.operButton[i].className)
                    if(me.operButton[i].onClick)
                        (function(clickFun) {
                            buttonDom.on('click', function() {
                                clickFun();
                            });
                        })(me.operButton[i].onClick);
                    moreFooterDom.append(buttonDom);
                }
                boxDom.append(moreDom);
            }
        }
        me.div.append(boxDom);
    }
    this._init();
}