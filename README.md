# maskcard

maskcard is a scratchcard plug-in based on canvas.

maskcard 是一个基于canvas的刮刮卡插件。

## Example Usage
```
new Maskcard(target, config)
```
- target：要初始化成刮刮卡的canvas DOM元素
- config：配置对象【为空的话使用默认值】

```
new Maskcard(document.querySelector('canvas'))
```


**[【example】](example.html)**

## API

#### Maskcard config
Name | type | Description | Default
--- | --- | --- | ---
fill.type | String | 填充的方式 color or image | color
fill.content | String | If fill.type==color, fill color value.<br>if fill.type=image, fill image ulr or base64 encoding. | silver
percent | Number(Integer between 0 and 100) | 涂抹了xx%后自动抹去 | 100
radius | Number(Integer) | The radius of a scratching path | 20
disable | Boolean | Whether disable | false
beforeInit | Function | 初始化之前执行函数 | null
inited | Function | 初始化之后执行函数 | null
touchstart | Function | 手指按下的时候执行【带有e参数】 | null
touchmove | Function | 手指移动的时候执行【带有e参数】 | null
touchend | Function | 手指离开的时候执行【带有e参数】 | null
complete | Function | 刮完时【刮到指定百分比之后】执行函数 | null


#### Maskcard methods
Name | Description
--- | ---
clear() | complete this scratchcard.
getProgress() | Compute the current scratching progress.
disable() | Disable this scratchcard.
enable() | Enable this scratchcard.
changeConfig(config) | Change the config and take effect.
reset() | Reset this scratchcard.

## QA
#### 1. 注意fillContent图片跨域
因为canvas中的getImageData方法不支持跨域，所以当参数fill.type=image时，fill.content填的图片地址必须与主文件同域，否则程序会把自动涂抹功能改为刮了【percent/10】次之后自动抹去。  
如果图片不得不跨域，则考虑以下两种解决方案
- 通过一个自定义接口，把图片转换成base64编码后再引用
- 从网络层面设置图片服务器的响应头 Access-Control-Allow-Origin: *