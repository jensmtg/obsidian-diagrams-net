import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom'
const bgColor="white"
/**
 * - Based on: https://github.com/jgraph/drawio-integration
 * - https://desk.draw.io/support/solutions/articles/16000042544
 * 
 * - DiagramEditor.js is outright clone, with modifications after initial commit:
 * - The save function needs modification.
 */

function useDiagramsNet(onSaveCallback, onStopEditing, getName, getData) {

    const [save1, setSave1] = useState(null)
    const [save2, setSave2] = useState(null)

    const blankDiagram = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI5MXB4IiBoZWlnaHQ9IjYxcHgiIHZpZXdCb3g9Ii0wLjUgLTAuNSA5MSA2MSIgY29udGVudD0iJmx0O214ZmlsZSBldGFnPSZxdW90O255VDJrWi1zUFJUTzlwV2c0LU9XJnF1b3Q7IGFnZW50PSZxdW90OzUuMCAoTWFjaW50b3NoKSZxdW90OyBtb2RpZmllZD0mcXVvdDsyMDIwLTA2LTAzVDE1OjEwOjA1LjM0OFomcXVvdDsgaG9zdD0mcXVvdDt3d3cuZHJhdy5pbyZxdW90OyB2ZXJzaW9uPSZxdW90OzEzLjEuMTQmcXVvdDsmZ3Q7Jmx0O2RpYWdyYW0gaWQ9JnF1b3Q7clV1eHZtYW1kTloxenJMWE9sXzYmcXVvdDsgbmFtZT0mcXVvdDtQYWdlLTEmcXVvdDsmZ3Q7bFpOTGM0SXdFTWMvRFVkbUFyR1ZIcTFhKzVqV1RwMk9NOTRpV1VNNmdUQWhLdlRURjJURFk3ellFN3UvN0NQNzMrRFJlVnF1RE11VGQ4MUJlU0hocFVjWFhoZ0dFYVgxcHlGVlM2YlJ0QVhDU0k1QlBkaklYMEJJa0I0bGgySVVhTFZXVnVaakdPc3NnOWlPR0ROR244ZGhCNjNHWFhNbTRBcHNZcWF1NlZaeW03UTB1aU05ZndZcEV0YzVJSGlTTWhlTW9FZ1kxK2NCb2t1UHpvM1d0clhTY2c2cUVjL3A4aEY4TGlZaC9mS3pIWWxGT0Z2dWhQVGJZay8vU2VsR01KRFpXMHQvRjJEVys1OUcwcEFvdHEvWGVzbGNTQ1lNUzl1U3JtMTIzRS9zeXlrbzEyL2JWM3JRZWx2Ti9IN0c3cHFGclp5dVJoOHpEazArOGVpalVLd28wTzUwYXB3YnI0NGpuc0JZS0FlTHcvWXIwQ2xZVTlVaGVFcmRWdkJaUnVpZSt4MC9JRW9HNjcxSHh2QlZpYTV3cjF4dDRNRE9IV2pwVUwvMlMvamc1NkhMUHc9PSZsdDsvZGlhZ3JhbSZndDsmbHQ7L214ZmlsZSZndDsiPjxkZWZzLz48Zz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iOTAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmZmZmYiIHN0cm9rZT0iIzAwMDAwMCIgcG9pbnRlci1ldmVudHM9ImFsbCIvPjxnIGZpbGw9IiMwMDAwMDAiIGZvbnQtZmFtaWx5PSJIZWx2ZXRpY2EiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTJweCI+PHRleHQgeD0iNDQuNSIgeT0iMzQuNSI+RGlhZ3JhbTwvdGV4dD48L2c+PC9nPjwvc3ZnPg=="

    const domain = 'https://embed.diagrams.net/'
    const ui = '&ui=min'
    const libraries = '&libraries=1'
    const url = domain + '?embed=1&proto=json&spin=1' + ui + libraries

    const frameRef = useRef(null);
    const frameId = 'drawIoDiagramFrame'


    /* ============== Mount and unmount ===================== */

    // Save
    useEffect(() => {
        if (save1 && save2) {
            onSaveCallback({ pngMsg: save1, svgMsg: save2 })
            callStopEditing();
            setSave1(null)
            setSave2(null)
        }
    }, [onSaveCallback, callStopEditing, save1, save2]);

    /* ============== Transaction handlers ================== */

    function _handleMessageEvent(evt) {
        if (frameRef.current !== null && evt.source === frameRef.current.contentWindow && evt.data.length > 0) {
            try {
                var msg = JSON.parse(evt.data);
                if (msg != null) {
                    _handleMessage(msg);
                }
            }
            catch (e) { console.error(e); }
        }
    }

    function _handleMessage(msg) {
        if (msg.event === 'init') {
            callInitializeEditor();
        }
        else if (msg.event === 'autosave') {
            // skip any autosave.
        }
        else if (msg.event === 'save') {
            _postMessage({
                action: 'export',
                format: 'svg',
                // xml: msg.xml,
                embedImages: true,
                exit: false,
            });
            _postMessage({
                action: 'export',
                format: 'png',
                // xml: msg.xml,
                embedImages: true,
                exit: msg.exit,
            });
        }
        else if (msg.event === 'export') {
            if (msg.message.exit) {
                msg.event = false
            }
            //console.log('msg', msg)

            // callSave(msg)
            if (msg.format === "png") {
                setSave1(msg)
            }
            else if (msg.format === "svg") {
                setSave2(msg)
            }

            //setSave([ ...save, msg])
        }
        if (msg.event === 'exit') {
            callStopEditing();
        }
    }

    function _postMessage(msg) {
        frameRef.current && frameRef.current.contentWindow.postMessage(JSON.stringify(msg), '*');
    }

    /* ============== Application callbacks ================== */

    function callInitializeEditor() {

        const title = getName ? getName() : 'Untitled'
        const diagram = getData ? getData() : blankDiagram

        _postMessage({
            action: 'load',
            noSaveBtn: 1,
            autosave: 0,
            saveAndExit: '1',
            modified: 'unsavedChanges',
            xml: diagram,
            title: title,
        });
        //frameRef.current.focus()
    }


    function callStopEditing() {
        stopEditing()
    }


    /* ============== Hook interface ===================== */


    function startEditing() {
        window.addEventListener('message', _handleMessageEvent)
        let frame = <iframe
            src={url}
            id={frameId}
            title={frameId}
            ref={frameRef}
            // sandbox="allow-scripts allow-same-origin"
            style={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                left: '0',
                top: '0',
                border: 'none',
                zIndex: 10,
                backgroundColor: bgColor,
            }}
        />
        ReactDOM.render(frame, document.getElementById(frameId));
    }

    function stopEditing() {
        onStopEditing()
        try {
            ReactDOM.render(<div id={frameId} />, document.getElementById(frameId));
            window.removeEventListener('message', _handleMessageEvent)
        }
        catch {
            // DOM node gone
        }
    }

    return {
        startEditing,
        stopEditing,
    };
}

export default useDiagramsNet


