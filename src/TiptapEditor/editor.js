import { Editor } from './core/tiptap-bundle.js'
import { editorExtensions } from './extensions.js'

let editor = null;

export function initEditor() {

    if (editor) {
        editor.destroy()
    }

    editor = new Editor({
        element: document.querySelector('#tiptap-editor'),

        extensions: editorExtensions,

        injectCSS: true,
    })

    return editor
};