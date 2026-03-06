/*
 * jQuery Selectbox plugin 0.2
 *
 * Copyright 2011-2012, Dimitar Ivanov (http://www.bulgaria-web-developers.com/projects/javascript/selectbox/)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 * 
 * Date: Tue Jul 17 19:58:36 2012 +0300
 */


(function($, undefined) {
    var PROP_NAME = "selectbox",
        FALSE = false,
        TRUE = true;

        

    function Selectbox() {
        this._state = [];
        this._defaults = {
            classHolder: "sbHolder",
            classHolderDisabled: "sbHolderDisabled",
            classSelector: "sbSelector",
            classOptions: "sbOptions",
            classGroup: "sbGroup",
            classSub: "sbSub",
            classDisabled: "sbDisabled",
            classToggleOpen: "sbToggleOpen",
            classToggle: "sbToggle",
            classFocus: "sbFocus",
            speed: 0,
            effect: "slide",
            onChange: null,
            onOpen: null,
            onClose: null 
        }

        
    }

    /*if(agentInfo.IsIE && Number(agentVersion) < 8){
       $ = window.top.$;
    }*/


    $.extend(Selectbox.prototype, {
        _isOpenSelectbox: function(target) {
            if (!target) {
                return FALSE
            }
            var inst = this._getInst(target);
            return inst.isOpen
        },
        _isDisabledSelectbox: function(target) {
            if (!target) {
                return FALSE
            }
            var inst = this._getInst(target);
            return inst.isDisabled
        },
        _attachSelectbox: function(target, settings) {
            var doc = document;
            if (settings.doc) {
                doc = settings.doc;
            }
            if(target.id.indexOf('quickMenu') > -1 && typeof ceTextQuickMenu != "undefined") {
                doc = ceTextQuickMenu._topDoc;
            }
            if (this._getInst(target)) {
                return FALSE
            }
            var $target = $(target, doc),
                self = this,
                inst = self._newInst($target),
                sbHolder, sbSelector, sbToggle, sbOptions, s = FALSE,
                optGroup = $target.find("optgroup"),
                opts = $target.find("option"),
                olen = opts.length;
            $target.attr("sb", inst.uid);
            target = $target.get(0);

            $.extend(inst.settings, self._defaults, settings);
            self._state[inst.uid] = FALSE;
            $target.hide();

            function closeOthers() {
                var key, sel, uid = this.attr("id").split("_")[1];
                for (key in self._state) {
                    if (key !== uid) {
                        if (self._state.hasOwnProperty(key)) {
                            sel = $("select[sb='" + key + "']")[0];

                            if(typeof sel == 'undefined' && typeof ceTextQuickMenu != "undefined") {
                                sel = $("select[sb='" + key + "']", ceTextQuickMenu._topDoc).get(0);
                            }
                            if (sel) {
                                self._closeSelectbox(sel)
                            }
                        }
                    }
                }
            }
            /*sbHolder = $("<div>", {
                id: "sbHolder_" + inst.uid,
                "class": inst.settings.classHolder,
                tabindex: $target.attr("tabindex")
            });*/
            sbHolder = $(doc.createElement('span'));
            sbHolder.attr({
                "id": "sbHolder_" + inst.uid,
                "class": inst.settings.classHolder,
                "tabindex": $target.attr("tabindex")
            });
            // sbHolder.css("display","inline-block");

            /*sbSelector = $("<a>", {
                id: "sbSelector_" + inst.uid,
                href: "#",
                "class": inst.settings.classSelector,
                click: function(e) {
                    e.preventDefault();
                    closeOthers.apply($(this), []);
                    var uid = $(this).attr("id").split("_")[1];
                    if (self._state[uid]) {
                        self._closeSelectbox(target)
                    } else {
                        self._openSelectbox(target)
                    }
                }
            });*/
            sbSelector = $(doc.createElement('a'));
            sbSelector.attr({
                "id": "sbSelector_" + inst.uid,
                "href": "#",
                "class": inst.settings.classSelector
            }).bind('click', function(e) {
                e.preventDefault();
                closeOthers.apply($(this), []);
                var uid = $(this).attr("id").split("_")[1];
                if (self._state[uid]) {
                    self._closeSelectbox(target)
                } else {
                    self._openSelectbox(target)
                }
            });


            /*sbToggle = $("<a>", {
                id: "sbToggle_" + inst.uid,
                href: "#",
                "class": inst.settings.classToggle,
                click: function(e) {
                    e.preventDefault();
                    closeOthers.apply($(this), []);
                    var uid = $(this).attr("id").split("_")[1];
                    if (self._state[uid]) {
                        self._closeSelectbox(target)
                    } else {
                        self._openSelectbox(target)
                    }
                }
            });*/
            sbToggle = $(doc.createElement('a'));
            sbToggle.attr({
                "id": "sbToggle_" + inst.uid,
                "href": "#",
                "class": inst.settings.classToggle
            }).bind('click', function(e) {
                e.preventDefault();
                closeOthers.apply($(this), []);
                var uid = $(this).attr("id").split("_")[1];
                if (self._state[uid]) {
                    self._closeSelectbox(target)
                } else {
                    self._openSelectbox(target)
                }
            });    

            sbToggle.appendTo(sbHolder);
            /*sbOptions = $("<ul>", {
                id: "sbOptions_" + inst.uid,
                "class": inst.settings.classOptions,
                css: {
                    display: "none"
                }
            });*/
            sbOptions = $(doc.createElement('ul'));
            sbOptions.attr({
                "id": "sbOptions_" + inst.uid,
                "class": inst.settings.classOptions
			}).css({display: "none"});

            $target.children().each(function(i) {
                var that = $(this),
                    li, config = {};
                if (that.is("option")) {
                    getOptions(that)
                } else {
                    if (that.is("optgroup")) {
                        li = $(doc.createElement("li"));
                        /* $("<span>", {
                            text: that.attr("label")
                        }).addClass(inst.settings.classGroup).appendTo(li);*/
                        var $span = $(doc.createElement('span'));  
                        $span.attr({
                            "class": inst.settings.classGroup
                        }).text(that.attr("label"));
                        $span.appendTo(li);

                        li.appendTo(sbOptions);
                        if (that.is(":disabled")) {
                            config.disabled = true
                        }
                        config.sub = true;
                        getOptions(that.find("option"), config)
                    }
                }
            });

            function getOptions() {
                var sub = arguments[1] && arguments[1].sub ? true : false,
                    disabled = arguments[1] && arguments[1].disabled ? true : false;
                arguments[0].each(function(i) {
                    var that = $(this),
                        li = $(doc.createElement("li")),
                        child;
                    if (that.is(":selected")) {
                        sbSelector.text(that.text());
                        s = TRUE
                    }
                    if (i === olen - 1) {
                        li.addClass("last")
                    }
                    if (!that.is(":disabled") && !disabled) {
                        /*child = $("<a>", {
                            href: "#" + that.val(),
                            rel: that.val()
                        }).text(that.text()).bind("click.sb", function(e) {
                            if (e && e.preventDefault) {
                                e.preventDefault()
                            }
                            var t = sbToggle,
                                $this = $(this),
                                uid = t.attr("id").split("_")[1];
                            self._changeSelectbox(target, $this.attr("rel"), $this.text());
                            self._closeSelectbox(target)
                        }).bind("mouseover.sb", function() {
                            var $this = $(this);
                            $this.parent().siblings().find("a").removeClass(inst.settings.classFocus);
                            $this.addClass(inst.settings.classFocus)
                        }).bind("mouseout.sb", function() {
                            $(this).removeClass(inst.settings.classFocus)
                        });*/
                        child = $(doc.createElement('a'));  
                        child.attr({
                            "href": "#" + that.val(),
                            "rel": that.val()
                        }).text(that.text()).bind("click.sb", function(e) {
                            if (e && e.preventDefault) {
                                e.preventDefault()
                            }
                            var t = sbToggle,
                                $this = $(this),
                                uid = t.attr("id").split("_")[1];
                            self._changeSelectbox(target, $this.attr("rel"), $this.text());
                            self._closeSelectbox(target)
                        }).bind("mouseover.sb", function() {
                            var $this = $(this);
                            $this.parent().siblings().find("a").removeClass(inst.settings.classFocus);
                            $this.addClass(inst.settings.classFocus)
                        }).bind("mouseout.sb", function() {
                            $(this).removeClass(inst.settings.classFocus)
                        });

                        if (sub) {
                            child.addClass(inst.settings.classSub)
                        }
                        if (that.is(":selected")) {
                            child.addClass(inst.settings.classFocus)
                        }
                        child.appendTo(li)
                    } else {
                        /*child = $("<span>", {
                            text: that.text()
                        }).addClass(inst.settings.classDisabled);*/
                        child = $(doc.createElement('span'));  
                        child.attr({
                            "class": inst.settings.classDisabled
                        }).text(that.text());

                        if (sub) {
                            child.addClass(inst.settings.classSub)
                        }
                        child.appendTo(li)
                    }
                    li.appendTo(sbOptions)
                })
            }
            if (!s) {
                sbSelector.text(opts.first().text())
            }
            $.data(target, PROP_NAME, inst);
			
            sbHolder.data("uid", inst.uid).bind("keydown.sb", function(e) {
                var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0,
                    $this = $(this),
                    uid = $this.data("uid"),
                    inst = $this.siblings("select[sb='" + uid + "']").data(PROP_NAME),
                    trgt = $this.siblings(["select[sb='", uid, "']"].join("")).get(0),
                    $f = $this.find("ul").find("a." + inst.settings.classFocus);
				if (e.ctrlKey && !e.altKey && [49, 50, 51, 52, 53, 54, 55, 56, 57].InArray(e.keyCode)) {
					return;
				}
                switch (key) {
                    case 37:
                    case 38:
                        if ($f.length > 0) {
                            var $next;
                            $("a", $this).removeClass(inst.settings.classFocus);
                            $next = $f.parent().prevAll("li:has(a)").eq(0).find("a");
                            if ($next.length > 0) {
                                $next.addClass(inst.settings.classFocus).focus();
                                $("#sbSelector_" + uid).text($next.text())
                            }
                        }
                        break;
                    case 39:
                    case 40:
                        var $next;
                        $("a", $this).removeClass(inst.settings.classFocus);
                        if ($f.length > 0) {
                            $next = $f.parent().nextAll("li:has(a)").eq(0).find("a")
                        } else {
                            $next = $this.find("ul").find("a").eq(0)
                        }

                        if ($next.length > 0) {
                            $next.addClass(inst.settings.classFocus).focus();
                            $("#sbSelector_" + uid).text($next.text())
                        }
                        break;
                    case 13:
						return;
						/*
                        if ($f.length > 0) {
                            self._changeSelectbox(trgt, $f.attr("rel"), $f.text())
                        }
                        self._closeSelectbox(trgt);
						*/
                        break;
                    case 9:
						return;
						/*
                        if (trgt) {
                            var inst = self._getInst(trgt);
                            if (inst) {
                                if ($f.length > 0) {
                                    self._changeSelectbox(trgt, $f.attr("rel"), $f.text())
                                }
                                self._closeSelectbox(trgt)
                            }
                        }
                        var i = parseInt($this.attr("tabindex"), 10);
                        if (!e.shiftKey) {
                            i++
                        } else {
                            i--
                        }
                        $("*[tabindex='" + i + "']").focus();
						*/
                        break;
                    case 27:
                        self._closeSelectbox(trgt);
                        break
                }
                e.stopPropagation();
                return false
            }).delegate("a", "mouseover", function(e) {
                $(this).addClass(inst.settings.classFocus)
            }).delegate("a", "mouseout", function(e) {
                $(this).removeClass(inst.settings.classFocus)
            });
			
            sbSelector.appendTo(sbHolder);
            sbOptions.appendTo(sbHolder);

            try {
                sbHolder.insertAfter($target);
            } catch(e) {
                $target.after(sbHolder);
            }
            
			if($target[0].id==='formFontName'||$target[0].id==='formFontSize'){
            	if(sbHolder){
            		$('#'+sbHolder[0].id).css('outline','none');
            	}
            }
            $("html").on("mousedown", function(e) {
                e.stopPropagation();
                $("select").selectbox("close")
            });
            $([".", inst.settings.classHolder, ", .", inst.settings.classSelector].join("")).mousedown(function(e) {
                e.stopPropagation()
            })
        },
        _detachSelectbox: function(target) {
            var inst = this._getInst(target);
            if (!inst) {
                return FALSE
            }
            var doc = document;
            if (inst.settings.doc) {
                doc = inst.settings.doc;
            }
            var holderNode = $("#sbHolder_" + inst.uid);
            if(target.id.indexOf('_quickMenu') > -1) {
                holderNode = $("#sbHolder_" + inst.uid, inst.input.parent());
            }

            holderNode.remove();
            $.data(target, PROP_NAME, null);
            $(target).show()
        },
        _changeSelectbox: function(target, value, text) {
            var onChange, inst = this._getInst(target);
            if (inst) {
                onChange = this._get(inst, "onChange");
                var doc = document;
                if (inst.settings.doc) {
                    doc = inst.settings.doc;
                }

                var selectoNode = $("#sbSelector_" + inst.uid, doc);
                if(target.id.indexOf('_quickMenu') > -1) {
                    selectoNode = $("#sbSelector_" + inst.uid, inst.input.parent());
                }
                selectoNode.text(text)
            }
            //value = value.replace(/\'/g, "\\'");

            $(target).find("option[value='" + value + "']").attr("selected", TRUE);
            if (inst && onChange) {
                onChange.apply((inst.input ? inst.input[0] : null), [value, inst])
            } else {
                if (inst && inst.input) {
                    inst.input.trigger("change")
                }
            }
        },
        _enableSelectbox: function(target) {
            var inst = this._getInst(target);
            if (!inst || !inst.isDisabled) {
                return FALSE
            }
            var doc = document;
            if (inst.settings.doc) {
                doc = inst.settings.doc;
            }

            var holderNode = $("#sbHolder_" + inst.uid, doc);
            if(target.id.indexOf('_quickMenu') > -1) {
                holderNode = $("#sbHolder_" + inst.uid, inst.input.parent());
            }

            holderNode.removeClass(inst.settings.classHolderDisabled);
            inst.isDisabled = FALSE;
            $.data(target, PROP_NAME, inst)
        },
        _disableSelectbox: function(target) {
            var inst = this._getInst(target);
            if (!inst || inst.isDisabled) {
                return FALSE
            }
            var doc = document;
            if (inst.settings.doc) {
                doc = inst.settings.doc;
            }

            var holderNode = $("#sbHolder_" + inst.uid, doc);
            if(target.id.indexOf('_quickMenu') > -1) {
                holderNode = $("#sbHolder_" + inst.uid, inst.input.parent());
            }

            holderNode.addClass(inst.settings.classHolderDisabled);
            inst.isDisabled = TRUE;
            $.data(target, PROP_NAME, inst)
        },
        _optionSelectbox: function(target, name, value) {
            var inst = this._getInst(target);
            if (!inst) {
                return FALSE
            }
            inst[name] = value;
            $.data(target, PROP_NAME, inst)
        },
        _openSelectbox: function(target) {
            var inst = this._getInst(target);
            if (!inst || inst.isOpen || inst.isDisabled) {
                return
            }
            var doc = document;
            if (inst.settings.doc) {
                doc = inst.settings.doc;
            }

            var el = $("#sbOptions_" + inst.uid, doc);
            var holderNode = $("#sbHolder_" + inst.uid, doc);
            var toggleNode = $("#sbToggle_" + inst.uid, doc);
            if(target.id.indexOf('_quickMenu') > -1) {
                el = $("#sbOptions_" + inst.uid, inst.input.parent());
                holderNode = $("#sbHolder_" + inst.uid, inst.input.parent());
                toggleNode = $("#sbToggle_" + inst.uid, inst.input.parent());
            }

            var viewportHeight = parseInt($(window.document.body).height(), 10),
                offset = holderNode.offset(),
                scrollTop = $(window).scrollTop(),
                height = el.prev().height(),
                diff = viewportHeight - (offset.top - scrollTop) - height / 2,
                onOpen = this._get(inst, "onOpen"),
                width = el.width();
			/* chart max-height*/
			var maxheight = (diff - height);
            if(maxheight < 60)
                maxheight = 60;

            if(target.id ==='formFontName'||target.id ==='formFontSize'){
				maxheight = 340;
			} else if (target.id.split('_')[1] === 'quickMenu') {
                maxheight = 292;
            }

			/* chart max-height*/
            el.css({
                top: height + "px",
                maxHeight: maxheight + "px",
				"overflow-y": "auto"
            });
            inst.settings.effect === "fade" ? el.fadeIn(inst.settings.speed) : el.slideDown(inst.settings.speed);
            toggleNode.addClass(inst.settings.classToggleOpen);
            this._state[inst.uid] = TRUE;
            inst.isOpen = TRUE;
            if (onOpen) {
                onOpen.apply((inst.input ? inst.input[0] : null), [inst])
            }
            $.data(target, PROP_NAME, inst);

            if(typeof ceTextQuickMenu != "undefined") {
               var wrapperDiv = $('#'+ceTextQuickMenu._layout.id_wrapper, ceTextQuickMenu._topDoc);
                if(wrapperDiv.length) {
                    var wrap_offset =  wrapperDiv.offset();
                    var wrap_width = wrapperDiv.width();
                    var wrap_height = wrapperDiv.height();
                    var newHeight, newWidth;
                    
                    newHeight = wrap_height + maxheight;
                    var cal = (offset.left + width) - (wrap_offset.left + wrap_width);
                    if(cal > 0) {
                        newWidth = wrap_width + cal + 3;
                    }
                    
                    if(newHeight)
                        wrapperDiv.height(newHeight);
                    if(newWidth)
                        wrapperDiv.width(newWidth);
                } 
            }
        },
        _closeSelectbox: function(target) {
            var inst = this._getInst(target);
            if (!inst || !inst.isOpen) {
                return
            }
            var doc = document;
            if (inst.settings.doc) {
                doc = inst.settings.doc;
            }

            var el = $("#sbOptions_" + inst.uid, doc);
            var toggleNode = $("#sbToggle_" + inst.uid, doc);
            if(target.id.indexOf('_quickMenu') > -1) {
                el = $("#sbOptions_" + inst.uid, inst.input.parent());
                toggleNode = $("#sbToggle_" + inst.uid, inst.input.parent());
            }    

            var onClose = this._get(inst, "onClose");
            inst.settings.effect === "fade" ? el.fadeOut(inst.settings.speed) : el.slideUp(inst.settings.speed);
            toggleNode.removeClass(inst.settings.classToggleOpen);
            this._state[inst.uid] = FALSE;
            inst.isOpen = FALSE;
            if (onClose) {
                onClose.apply((inst.input ? inst.input[0] : null), [inst])
            }
            $.data(target, PROP_NAME, inst);

            if(typeof ceTextQuickMenu != "undefined") {
                var wrapperDiv = $('#'+ceTextQuickMenu._layout.id_wrapper, ceTextQuickMenu._topDoc);
                if(wrapperDiv.length) {
                    wrapperDiv.css({
                        'height' : 'auto',
                        'width' : 'auto'
                    });
                }
            }
        },
        _newInst: function(target) {
            var id = target[0].id.replace(/([^A-Za-z0-9_-])/g, "\\\\$1");
            return {
                id: id,
                input: target,
                uid: Math.floor(Math.random() * 99999999),
                isOpen: FALSE,
                isDisabled: FALSE,
                settings: {}
            }
        },
        _getInst: function(target) {
            try {
                return $.data(target, PROP_NAME)
            } catch (err) {
                throw "Missing instance data for this selectbox"
            }
        },
        _get: function(inst, name) {
            return inst.settings[name] !== undefined ? inst.settings[name] : this._defaults[name]
        }
    });
    $.fn.selectbox = function(options) {
        var otherArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof options == "string" && options == "isDisabled") {
            return $.selectbox["_" + options + "Selectbox"].apply($.selectbox, [this[0]].concat(otherArgs))
        }
        if (options == "option" && arguments.length == 2 && typeof arguments[1] == "string") {
            return $.selectbox["_" + options + "Selectbox"].apply($.selectbox, [this[0]].concat(otherArgs))
        }
        return this.each(function() {
            typeof options == "string" ? $.selectbox["_" + options + "Selectbox"].apply($.selectbox, [this].concat(otherArgs)) : $.selectbox._attachSelectbox(this, options)
        })
    };
    $.selectbox = new Selectbox();
    $.selectbox.version = "0.2"
})(ce$);