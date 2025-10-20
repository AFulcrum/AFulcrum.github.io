# 所需工具

- [我的世界开发者启动器](https://mc.163.com/dev/)
- [Chunker]([Chunker: Minecraft Java and Bedrock World Converter](https://www.chunker.app/?ref=announcekit))

# 具体步骤

首先确定需要转换的地图为网易的基岩版。但是需要注意的是，如果是下载的是市面上的别人的地图，就是被加密的状态（也不排除地图本身就是被破坏了）。

![加密状态|800](resources/加密状态.png)

这时候就需要[我的世界开发者启动器](https://mc.163.com/dev/)对地图进行解密（也可以先通过Chunker尝试是否被加密或破坏）。

登录账号后找到并点击**基岩版组件**，点击**本地导入**导入需要转换的地图。

![我的世界开发者启动器-1|800](resources/我的世界开发者启动器-1.png)

导入后点击**编辑**进入地图，在地图中加载部分区块，范围大小合适即可，将所有的需要转换的建筑都能包括在内，之后退出保存，点击**更多**并**导出**。

![我的世界开发者启动器-2](resources/我的世界开发者启动器-2.png)

这时候导出的地图就被解码了，然后打开[Chunker]([Chunker: Minecraft Java and Bedrock World Converter](https://www.chunker.app/?ref=announcekit))，将解码的地图压缩包直接拖入窗口中。

![拖入压缩包](resources/拖入压缩包.png)

之后点击start，选择想要转换的版本，在最下方点击convert按钮开始转换，之后点击save保存即可导出压缩包。

# 注意事项

- 转换存在最低版本限制，不过不确定最低是哪个版本，目前尝试过1.16.5版本存在转换后的建筑区域消失的情况。
- 如果存在步骤正确但未转换成功的情况，可以先用网页我的世界打开最初的基岩版地图并游玩一段时间进行区块的加载。
- java版转基岩版可以直接通过Chunker完成。

> 有问题或补充请说明。




