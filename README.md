# Obsidian Diagrams.Net

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/jensmtg/obsidian-diagrams-net?style=for-the-badge&sort=semver)

This repository contains a plugin for [Obsidian](https://obsidian.md/) for inserting and editing [diagrams.net](https://diagrams.net/) (previously draw.io) diagrams. It differs from the [drawio-obsidian](https://github.com/zapthedingbat/drawio-obsidian) plugin by using the embedded online editor, which requires an active internet connection. On the other hand, it provides the complete feature set.

![Screencapture](demo.gif)

This is a diagrams.net/draw.io-plugin proof of concept for Obsidian, using an online editor. Expect glitches.


> ## ⚠️ **Caveats**
> As Obsidian itself is pre-release, with an unstable API, so is this plugin. There are some things you should be aware of if you are using it:
> 
> - Diagrams are saved as a separate file – ``MyDiagram.svg.xml``, alongside their image representation – ``Diagram.svg``. (The .xml-file can be opened directly in any diagrams.net-editor.)
> - Moving and renaming a diagram inside Obsidian will do so for both the diagram file and the image file. However, since there is no "copy" event to listen to in the Obsidian API, copying a diagram means the new diagram will not have a diagram file associated with it, and as such, cannot be opened in the editor.
> - Lastly; editing a diagram will not update the image in the active editor, you need to force a reload or navigate away and back to see the updates. If you have a good fix for this you are welcome to leave a pull request.
> 