import * as React from "react";
import useDiagramsNet from './useDiagramsNet';
import { MarkdownView } from "obsidian";


export const NewComponent = (props: any) => {

    const {
        app,
        // close,
    } = props


    const onSave = async (msg: any) => {

        const path = await app.vault.getAvailablePathForAttachments('Diagram', 'svg')

        const svgData = msg.svgMsg.data
        const svgBuffer = Buffer.from(svgData.replace('data:image/svg+xml;base64,', ''), 'base64')

        app.vault.createBinary(
            path,
            svgBuffer,
        )

        app.vault.create(
            path + '.xml',
            msg.svgMsg.xml,
        )

        // Insert reference in active document, at cursor
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
            const cursor = view.editor.getCursor();
            view.editor.replaceRange(`![[${path}]]`, cursor);
        }

    }

    const { startEditing } = useDiagramsNet(
        onSave,
        () => () => { },
        () => "",
        () => "")


    React.useEffect(() => {
        startEditing()
    }, [])


    return <div id="drawIoDiagramFrame" />


};