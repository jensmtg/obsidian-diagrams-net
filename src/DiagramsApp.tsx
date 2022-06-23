import * as React from "react";
import useDiagramsNet from './useDiagramsNet';


export const DiagramsApp = (props: any) => {


    const {
        xmlPath,
        diagramExists,
        vault,
        handleExit,
        handleSaveAndExit,
    } = props

    const [xmlData, setXmlData] = React.useState(null)

    const { startEditing } = useDiagramsNet(
        handleSaveAndExit,
        handleExit,
        () => "",
        () => xmlData)


    const loadXmlData = async () => {
        const xmlFile = vault.getAbstractFileByPath(xmlPath)
        const data = await vault.cachedRead(xmlFile)
        setXmlData(data)
    }

    React.useEffect(() => {
        if (diagramExists) {
            if (!xmlData) {
                loadXmlData()
            }
            else if (xmlData) {
                startEditing()
            }
        }
        else {
            startEditing()
        }
    }, [xmlData])

    return <div id="drawIoDiagramFrame" />

};