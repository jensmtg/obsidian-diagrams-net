import * as React from "react";
import useDiagramsNet from './useDiagramsNet';
import { TFile } from 'obsidian';


export const EditComponent = (props: any) => {

    const {
        app,
        editPath,
    } = props

    const [svgFile, setSvgFile] = React.useState(null)
    const [xmlFile, setXmlFile] = React.useState(null)
    const [xmlData, setXmlData] = React.useState(null)


    const onSave = async (msg: any) => {

        const svgData = msg.svgMsg.data
        const svgBuffer = Buffer.from(svgData.replace('data:image/svg+xml;base64,', ''), 'base64')

        app.vault.modifyBinary(
            svgFile,
            svgBuffer,
        )

        app.vault.modify(
            xmlFile,
            msg.svgMsg.xml,
        )
    }


    const { startEditing } = useDiagramsNet(
        onSave,
        () => () => { },
        () => "",
        () => xmlData
    )


    const loadOldData = async () => {
        const absFile = app.vault.getAbstractFileByPath(editPath)
        if (absFile instanceof TFile && absFile.extension === 'svg') {
            const shadow = app.vault.getAbstractFileByPath(editPath + '.xml')
            if (shadow && shadow instanceof TFile && shadow.extension === 'xml') {
                const data = await app.vault.read(shadow)
                setXmlData(data)
                setSvgFile(absFile)
                setXmlFile(shadow)
            }
        }
    }


    React.useEffect(() => {
        if (!xmlData) {
            loadOldData()
        }
        else if (xmlData) {
            startEditing()
        }

    }, [xmlData])


    return <div id="drawIoDiagramFrame" />

};