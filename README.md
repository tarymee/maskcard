# maskcard

This is a scratchcard plug-in based on canvas.

(这是一个基于canvas的刮刮卡插件)

## Installation and Usage(安装和使用)
```
npm install maskcard --save
```

```
import Maskcard from 'maskcard'

new Maskcard(element, config)
```

## Example(示例)
**[【example】](example/index.html)**

## API
#### Maskcard config
Name | type | Description | Default
--- | --- | --- | ---
fill.type | String | color or image | color
fill.content | String | When fill.type is color, fill color value<br>(当fill.type=color时, 填color值)<br>When fill.type is image, fill image url or base64 encoding<br>(当fill.type=image时, 填图片地址或者base64编码) | silver
percent | Number(Integer between 0 and 100) | When xx% auto complete<br>(刮到xx%时自动清除) | 100
radius | Number(Integer) | The radius of a scratching path<br>(涂抹笔触半径) | 20
disable | Boolean | Whether disable<br>(是否禁用) | false
beforeInit | Function | Called before initialized<br>(初始化之前调用) | null
inited | Function | Called after initialized<br>(初始化之后调用) | null
touchstart | Function | Called when touchstart, argument: e<br>(初始化之后调用, 参数: e) | null
touchmove | Function | Called when touchmove, argument: e<br>(手指移动的时候调用, 参数: e) | null
touchend | Function | Called when touchend, argument: e<br>(手指离开的时候调用, 参数: e) | null
complete | Function | Called when completed<br>(刮完时调用) | null


#### Maskcard methods(函数方法)
Name | Description
--- | ---
clear() | Complete this scratchcard<br>(自动刮完)
getProgress() | Compute the current scratching progress<br>(刮到多少百分比)
disable() | Disable this scratchcard<br>(禁用刮刮卡)
enable() | Enable this scratchcard<br>(启用刮刮卡)
changeConfig(config) | Change the config and take effect<br>(修改config)
reset() | Reset this scratchcard<br>(重新初始化)

## Attention(注意)
Because the 'getImageData' method on 'CanvasRenderingContext2D' does not support cross-domain, so, when fill.type is image, fill.content image url must follow a master file with the domain name. Otherwise program would change the function auto complete into another function that after 10 to complete.

fill.content图片跨域: 因为canvas中的getImageData方法不支持跨域, 所以当参数fill.type=image时, fill.content填的图片地址必须与主文件同域, 否则程序会把自动涂抹功能改为刮了【percent/10】次之后自动抹去.