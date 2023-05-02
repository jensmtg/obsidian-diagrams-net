> **Warning**
> I'm sad to say I can't find the time to maintain this plug-in. As such, issues will not be read. I may merge pull requests from time to time. If you think you can maintain this plugin please contact me.

# Obsidian Diagrams.Net

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/jensmtg/obsidian-diagrams-net?style=for-the-badge&sort=semver)

A plugin for [Obsidian](https://obsidian.md/) for inserting and editing [diagrams.net](https://diagrams.net/) (previously draw.io) diagrams. It differs from the [drawio-obsidian](https://github.com/zapthedingbat/drawio-obsidian) plugin in that it embeds the diagrams.net online editor, which requires an active internet connection, but enables the full feature set and all the shape libraries.


![2022-06-23-obsidian-diagrams-net](https://user-images.githubusercontent.com/6455628/175336757-4a458fb8-7367-4305-8829-4e333982550e.gif)


> ## ⚠️ **Caveats**
> As Obsidian itself has an API that is under development, so is this plugin. There are some things you should be aware of if you are using it:
> 
> - Diagrams are saved as a separate file – ``MyDiagram.svg.xml``, alongside their image representation – ``MyDiagram.svg``. (The .xml-file can be opened directly in any diagrams.net-editor.)
> - Moving and renaming a diagram inside Obsidian will do so for both the diagram file and the image file. However, since there is no "copy" event to listen to in the Obsidian API, copying a diagram means the new diagram will not have a diagram file associated with it, and as such, cannot be opened in the editor.
> - The workaround, if you need to copy a diagram, is to manually duplicate and rename both the image and diagram file.


> ## 🐛 **Known issues**
> - Editing a diagram will not update the image in the active editor, you need to force a reload or navigate away and back to see the updates.

