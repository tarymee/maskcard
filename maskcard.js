; (function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory()
    } else {
        if (typeof define === 'function' && define.amd) {
            define(factory)
        } else {
            global.Maskcard = factory()
        }
    }
})(this, function () {
    'use strict'

    var Maskcard = function (element, config) {
        if (!element) {
            console.error('no element')
            return
        }
        if (typeof element === 'object') {
            if (element.nodeName !== 'CANVAS') {
                console.error('element is not canvas element')
                return
            }
        } else {
            console.error('element is not element')
            return
        }
        // 默认配置
        var initConfig = {
            fill: {
                type: 'color', // 填充的方式 color | image
                content: 'silver' // 填充的内容 如果type=color则填颜色值 如果type=image则填图片地址或base64
            },
            percent: 100, // 涂抹了x%之后自动消除
            radius: 20, // 涂抹笔触的半径
            disable: false, // 是否封锁 默认不封锁
            beforeInit: null, // 初始化之前执行
            inited: null, // 初始化之后执行
            touchstart: null, // 手指按下的时候执行
            touchmove: null, // 手指移动的时候执行
            touchend: null, // 手指离开的时候执行
            complete: null // 刮完之后执行
        }
        this.config = extend(initConfig, (config || {}))
        this.element = element
        this.ctx = this.element.getContext('2d')
        this.width = this.element.clientWidth
        this.height = this.element.clientHeight
        this.init()
    }

    Maskcard.version = '1.0.1'

    function extend(sourceObj, extendObj) {
        var newObj = JSON.parse(JSON.stringify(sourceObj))
        for (var x in extendObj) {
            newObj[x] = extendObj[x]
        }
        return newObj
    }

    function loadImage(url, callback) {
        var img = new Image()
        img.src = url
        if (img.complete) {
            callback(img)
            return
        }
        img.onload = function () {
            callback(img)
        }
    }

    Maskcard.prototype = {
        init: function () {
            var _this = this
            var config = _this.config
            var element = _this.element
            var ctx = _this.ctx
            var width = _this.width
            var height = _this.height

            config.beforeInit && config.beforeInit.call(_this)

            element.width = width
            element.height = height
            // 先遮挡后再清除背景 以防初始化刮刮卡之前被看到底部的内容
            ctx.fillStyle = 'silver'
            ctx.fillRect(0, 0, width, height)

            ctx.globalCompositeOperation = 'source-over'

            var ctxInit = function () {
                ctx.globalCompositeOperation = 'destination-out'
                config.inited && config.inited.call(_this)
            }

            if (config.fill.type == 'color') {
                ctx.fillStyle = config.fill.content
                ctx.fillRect(0, 0, width, height)
                ctxInit()
            } else if (config.fill.type == 'image') {
                loadImage(config.fill.content, function (img) {
                    // 循环repeat
                    // 后期更新cover contain
                    for (var j = 0; j < height; j += img.height) {
                        for (var i = 0; i < width; i += img.width) {
                            ctx.drawImage(img, i, j, img.width, img.height)
                        }
                    }
                    ctxInit()
                })
            } else {
                console.error('fill.type error')
                return false
            }

            function scratching(e) {
                var offsetX = element.getBoundingClientRect().left
                var offsetY = element.getBoundingClientRect().top
                var x = e.clientX - offsetX
                var y = e.clientY - offsetY

                ctx.beginPath()
                ctx.arc(x, y, parseInt(config.radius), 0, Math.PI * 2)
                ctx.fill()
            }


            _this.isTouching = false // 是否正在刮
            _this.touchCount = 0 // 刮的次数
            _this.isComplete = false // 是否刮完

            if (!this.isReset) {
                var isCanTouch = 'ontouchstart' in window ? true : false // 判断系统是否支持touch事件
                var tapstart = isCanTouch ? 'touchstart' : 'mousedown'
                var tapend = isCanTouch ? 'touchend' : 'mouseup'
                var tapmove = isCanTouch ? 'touchmove' : 'mousemove'

                element.addEventListener(tapstart, function (e) {
                    e.preventDefault()
                    if (config.disable) return false // 如果设置了不可刮 则返回false
                    if (_this.isComplete) return false // 已经完成
                    _this.isTouching = true
                    _this.touchCount++
                    if (e.changedTouches) {
                        e = e.changedTouches[e.changedTouches.length - 1]
                    }

                    scratching(e)

                    config.touchstart && config.touchstart.call(_this, e)
                })

                element.addEventListener(tapmove, function (e) {
                    e.preventDefault()
                    if (config.disable) return false // 如果设置了不可刮 则返回false
                    if (_this.isComplete) return false // 已经完成
                    if (_this.isTouching) {
                        if (e.changedTouches) {
                            e = e.changedTouches[e.changedTouches.length - 1]
                        }

                        scratching(e)

                        config.touchmove && config.touchmove.call(_this, e)
                    }
                })

                element.addEventListener(tapend, function (e) {
                    e.preventDefault()
                    if (config.disable) return false // 如果设置了不可刮 则返回false
                    if (_this.isComplete) return false // 已经完成
                    if (e.changedTouches) {
                        e = e.changedTouches[e.changedTouches.length - 1]
                    }
                    _this.isTouching = false
                    config.touchend && config.touchend.call(_this, e)

                    if (_this.getProgress() >= parseFloat(config.percent)) {
                        _this.clear()
                    }
                })
            }
        },
        reset: function () {
            this.isReset = true
            this.init()
        },
        // 获取刮刮卡进度
        getProgress: function () {
            var _this = this
            var width = _this.width
            var height = _this.height

            try {
                var data = _this.ctx.getImageData(0, 0, width, height).data
                var area = 0 // 被刮去的面积
                for (var i = 0; i < data.length; i += 4) {
                    if (data[i + 3] == 0) {
                        area++
                    }
                }
                var progress = area / (width * height) * 100
                progress = Math.round(progress * 100) / 100
                return progress
            } catch (error) {
                console.error(error)
                var totalCount = parseFloat(_this.config.percent) / 10
                // 所引用图片地址不属于本域名 canvas中getImageData方法不支持跨域 改为刮一次返回10%
                return _this.touchCount * 10
            }
        },
        changeConfig: function (config) {
            for (var x in config) {
                this.config[x] = config[x]
            }
        },
        disable: function () {
            this.changeConfig({
                disable: true
            })
        },
        enable: function () {
            this.changeConfig({
                disable: false
            })
        },
        // 清除画布
        clear: function () {
            var _this = this
            _this.isComplete = true
            var config = _this.config
            _this.element.style.webkitTransitionDuration = '500ms'
            _this.element.style.MozTransitionDuration = '500ms'
            _this.element.style.msTransitionDuration = '500ms'
            _this.element.style.OTransitionDuration = '500ms'
            _this.element.style.transitionDuration = '500ms'
            _this.element.style.opacity = 0
            config.complete && config.complete.call(_this)
            setTimeout(function () {
                _this.ctx.clearRect(0, 0, _this.width, _this.height)
                _this.element.style.webkitTransitionDuration = '0ms'
                _this.element.style.MozTransitionDuration = '0ms'
                _this.element.style.msTransitionDuration = '0ms'
                _this.element.style.OTransitionDuration = '0ms'
                _this.element.style.transitionDuration = '0ms'
                _this.element.style.opacity = 1
            }, 500)
        }
    }

    return Maskcard
})