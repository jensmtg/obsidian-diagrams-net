import * as React from "react";
import useDiagramsNet from './useDiagramsNet';


export const EditComponent = (props: any) => {

    const { 
        app,
        close,
    } = props

    const onSave = async (msg: any) => {
        console.group('SAVE!')
        const path = await app.vault.getAvailablePathForAttachments('Diagram', 'svg')

        console.log('path', path)
        console.log('msg', msg)

        const svgData = msg.svgMsg.data
        const svgBuffer = Buffer.from(svgData.replace('data:image/svg+xml;base64,', ''), 'base64')
        
        app.vault.createBinary(
            path,
            svgBuffer,

            )


        console.groupEnd()
    }

    const { startEditing } = useDiagramsNet(
        onSave,
        () => () => { },
        () => "",
        () => "")


    const files = app.vault.getMarkdownFiles()
    for (let i = 0; i < files.length; i++) { console.log(files[i].path); }

    
    // console.log('a', app)

    console.group('EditComponent')

    console.groupEnd()

    return <div>
        Noth.
        <button onClick={close}>close</button>
    </div>

    return <div id="rooty">
        <h4>Hello, ReactY1!</h4>
        <button onClick={startEditing}>Start</button>
        <div id="drawIoDiagramFrame" />
    </div>

};