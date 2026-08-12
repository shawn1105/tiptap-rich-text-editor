import { Extension } from './core/tiptap-bundle.js'
import { StarterKit } from './core/tiptap-bundle.js'
import { Placeholder } from './core/tiptap-bundle.js'
import { TextStyle, FontSize, Color, BackgroundColor, FontFamily } from './core/tiptap-bundle.js'
import { TextAlign } from './core/tiptap-bundle.js'
import { Image } from './core/tiptap-bundle.js'
import { Dropcursor } from './core/tiptap-bundle.js'
import { Paragraph } from './core/tiptap-bundle.js'
import { Link } from './core/tiptap-bundle.js'
import { Underline } from './core/tiptap-bundle.js'
import { Highlight } from './core/tiptap-bundle.js'
import { TableKit } from './core/tiptap-bundle.js'
import { Plugin, PluginKey } from './core/tiptap-bundle.js'
import { Decoration, DecorationSet } from './core/tiptap-bundle.js';

// 建立自訂段落縮排功能的擴充套件
const ParagraphIndent = Extension.create({
    name: 'paragraphIndent',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            indentSize: 40, // 每次縮排 40px
            maxLevel: 10,   // 最多縮排 10 次
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => {
                            const marginLeft = parseInt(element.style.marginLeft, 10) || 0;
                            return Math.floor(marginLeft / this.options.indentSize);
                        },
                        renderHTML: attributes => {
                            if (!attributes.indent) return {};
                            return { style: `margin-left: ${attributes.indent * this.options.indentSize}px` };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs.indent || 0;
                        if (currentIndent < this.options.maxLevel) {
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent + 1 });
                        }
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
            outdent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const currentIndent = node.attrs.indent || 0;
                        if (currentIndent > 0) {
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent - 1 });
                        }
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
        };
    },
});

// 建立自訂Font Size的擴充功能
const cusFontSize = Extension.create({
    name: 'fontSize',

    addOptions() {
        return {
            types: ['textStyle'], // 綁定在 textStyle 上
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        // 解析 HTML：把 style="font-size: 16px" 轉回 Tiptap 屬性
                        parseHTML: element => element.style.fontSize?.replace('px', ''),
                        // 渲染 HTML：把屬性轉成 style="font-size: 16px"
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {}
                            return { style: `font-size: ${attributes.fontSize}px` }
                        },
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize }).run()
            },
            unsetFontSize: () => ({ chain }) => {
                return chain().setMark('textStyle', { fontSize: null }).run()
            },
        }
    },
});

// 建立向下相容的字體大小處理的擴充套件
const CustomFontSize = TextStyle.extend({
    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: element => {
                    const getValueRecursive = (el) => {
                        // 終止條件 1： el 不存在(已經到頂了)
                        // 終止條件 2： el 是 body 或 html 標籤(通常不建議從這抓樣式)
                        if (!el || el.tagName === 'BODY' || el.tagName === 'HTML') {
                            return null;
                        }

                        const s = el.style?.fontSize;

                        // 找到了有效的 px 數值
                        if (s && s !== 'inherit' && s !== '') {
                            return s;
                        }

                        // 沒找到，繼續往上找
                        return getValueRecursive(el.parentElement);
                    };

                    const finalSize = getValueRecursive(element);
                    return finalSize;
                },
                renderHTML: attributes => {
                    if (!attributes.fontSize) return {};
                    return { style: `font-size: ${attributes.fontSize}` };
                },
            },
        };
    },
});

// 建立自訂搜尋選取及取代的擴充套件
const SearchSelectExtension = Extension.create({
    name: 'searchSelect',

    // 用來在套件內部記錄狀態
    addStorage() {
        return {
            lastSearchTerm: '',
            matchPositions: [],
            currentIndex: -1,
            replaceMode: false,

            matchCase: false,
            wholeWord: false,
            wrapSearch: true,
        };
    },

    // 定義外部可以使用的 Tiptap 指令
    addCommands() {
        return {
            // 指令1:搜尋，並自動跳到下一個
            searchAndSelectNext: (query) => ({ state, dispatch, commands }) => {
                if (!query) return false;

                const storage = this.storage;

                // 若搜尋文字改變，重新掃描整份文件並找出所有符合的位置
                if (query !== storage.lastSearchTerm) {
                    storage.lastSearchTerm = query;
                    storage.matchPositions = [];
                    if (!storage.replaceMode) {
                        storage.currentIndex = -1;
                    }

                    state.doc.descendants((node, pos) => {
                        if (node.isText) {
                            const sourceText = storage.matchCase
                                ? node.text
                                : node.text.toLowerCase();
                            const keyword = storage.matchCase
                                ? query
                                : query.toLowerCase();
                            let index = sourceText.indexOf(keyword);
                            while (index !== -1) {
                                if (
                                    !storage.wholeWord ||
                                    isWholeWord(node.text, index, query.length)
                                ) {
                                    const start = pos + index;
                                    const end = start + query.length;
                                    storage.matchPositions.push({ start, end });
                                }
                                index = sourceText.indexOf(keyword, index + 1);
                            }
                        }
                    });
                }

                // 如果完全沒有找到任何相符文字，直接返回 false 中斷指令
                if (storage.matchPositions.length === 0) {
                    return false;
                }

                // 判斷循環搜尋
                if (storage.wrapSearch) {
                    storage.currentIndex = (storage.currentIndex + 1) % storage.matchPositions.length;
                }
                else {
                    if (storage.currentIndex + 1 >= storage.matchPositions.length) {
                        return false;
                    }
                    storage.currentIndex++;
                }

                // 取得當前要反白選取的位置
                const { start, end } = storage.matchPositions[storage.currentIndex];

                // 執行 Tiptap 的原生選取功能：focus 編輯器並設定選取區塊
                if (dispatch) {
                    commands.focus();
                    commands.setTextSelection({ from: start, to: end });

                    // 自動平滑滾動畫面，讓選取到的文字置中
                    setTimeout(() => {
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            selection.getRangeAt(0).startContainer.parentElement?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }, 10);
                }

                return true;
            },

            // 指令2:取代，目前選中的文字，並自動跳到下一個
            searchAndReplaceCurrent: (replaceWith) => ({ state, dispatch, commands }) => {
                const storage = this.storage;

                // 防呆：若目前沒有選中的項目，或者沒執行過搜尋，就無法取代
                if (storage.currentIndex === -1 || storage.matchPositions.length === 0) {
                    return false;
                }

                // 取得目前「正在反白」的那組坐標
                const currentMatch = storage.matchPositions[storage.currentIndex];

                if (dispatch) {
                    // 在反白的坐標區間直接插入新文字(蓋掉舊文字)
                    commands.insertContentAt({
                        from: currentMatch.start,
                        to: currentMatch.end
                    }, replaceWith);

                    storage.replaceMode = true;
                    storage.lastSearchTerm = '';
                    // 索引值退回前一個，呼叫「尋找下一個」時，會剛好停在原本位置的下一筆
                    storage.currentIndex = storage.currentIndex - 1;
                }

                return true;
            },

            // 指令3:全部取代
            searchAndReplaceAll: (query, replaceWith) => ({ state, dispatch }) => {
                if (!query) return false;

                // 建立一個新的 Transaction（事務）來打包所有的取代動作
                const { tr } = state;
                let offset = 0; // 追蹤因為字數改變產生的偏移量
                let count = 0;  // 計算總共取代了幾筆

                // 遍歷文件尋找匹配，並直接修改 transaction
                state.doc.descendants((node, pos) => {
                    if (node.isText) {
                        let index = node.text.indexOf(query);
                        while (index !== -1) {
                            // 加上偏移量，算出在當前狀態下的正確坐標
                            const start = pos + index + offset;
                            const end = start + query.length;

                            // 執行替換
                            tr.insertText(replaceWith, start, end);

                            count++;
                            // 計算新的偏移量：(新字串長度 - 舊字串長度)
                            offset += replaceWith.length - query.length;
                            index = node.text.indexOf(query, index + 1);
                        }
                    }
                });

                // 如果文件有被改動，且有執行 dispatch，就把包裹好的變更一口氣送出
                if (tr.docChanged && dispatch) {
                    dispatch(tr);

                    // 全部取代完後，清空搜尋狀態
                    this.storage.lastSearchTerm = '';
                    this.storage.matchPositions = [];
                    this.storage.currentIndex = -1;
                    this.storage.replaceMode = false;
                }

                // 回傳取代的總筆數，方便外部 UI 提示使用者
                return count;
            },

            //設定搜尋選項
            setSearchOptions:
                (options) =>
                    () => {

                        this.storage.matchCase = options.matchCase;
                        this.storage.wholeWord = options.wholeWord;
                        this.storage.wrapSearch = options.wrapSearch;

                        // 搜尋條件改變，清除快取
                        this.storage.lastSearchTerm = "";
                        this.storage.matchPositions = [];
                        this.storage.currentIndex = -1;
                        this.storage.replaceMode = false;

                        return true;
                    },

            // 重設搜尋狀態的指令（例如當使用者清空輸入框時可以用）
            clearSearch: () => () => {
                this.storage.lastSearchTerm = '';
                this.storage.matchPositions = [];
                this.storage.currentIndex = -1;
                this.storage.replaceMode = false;
                return true;
            }
        };
    },
});

//搜尋及取代功能，輔助方法，判斷全字拼寫須相符
function isWholeWord(text, start, length) {
    const before = start === 0 ? "" : text[start - 1];
    const after =
        start + length >= text.length
            ? ""
            : text[start + length];
    const reg = /[A-Za-z0-9_]/;
    return !reg.test(before) && !reg.test(after);
}

// 自定義圖片上傳擴充套件
const CustomImageUpload = Extension.create({
    name: 'customImageUpload',
    addStorage() {
        return {
            uploadUrlInput: '',
        };
    },
    addCommands() {
        return {
            // 指令: 呼叫上傳圖片的API方法
            uploadImageFile: (file) => ({ editor }) => {
                coreImageUploadHandler(file, editor, this.storage.uploadUrlInput);
                return true;
            },
            // 設定上傳API的URL
            setUploadUrl: (uploadUrlInput) => () => {
                this.storage.uploadUrlInput = uploadUrlInput;
                return true;
            },
        };
    },
});

// 發送 API 方法
async function coreImageUploadHandler(file, editor, uploadUrlInput) {
    if (!file || !file.type.startsWith('image/')) return;

    // 宣告發送內容格式
    const formData = new FormData();

    // 加入後端設計的接收格式(一)(可自行設計刪減)
    formData.append('CKEditor_UploadFile', file, file.name);

    // 加入後端設計的接收格式(二)(可自行設計刪減)
    const newArray = uploadUrlInput.split("/");
    const pageType = newArray[1];
    const apiParameter = {
        "Page": pageType,
        "MethodName": "UploadPolicy",
        "para": {}
    };
    formData.append("UploadPolicy", JSON.stringify(apiParameter));

    // 加入後端設計的接收格式(三)(可自行設計刪減)
    formData.append("checkToken", "token");

    // 取得API後端接收網址
    const realApiUrl = uploadUrlInput;

    // Fetch 發送內容
    try {
        const response = await fetch(realApiUrl, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) throw new Error();

        const data = await response.json();

        // 檢查後端回傳並塞入 Tiptap
        if (data.uploaded && data.url) {
            editor.chain().focus().setImage({ src: data.url }).run();
        } else {
            alert('Upload Fail：' + (data.error?.message || 'Fail'));
        }
    } catch (error) {
        alert("Upload Fail");
    }

    /*
    // XHR 發送內容
    // 建立 XHR 
    const xhr = new XMLHttpRequest();
    xhr.open("POST", realApiUrl, true);
    // 開啟憑證攜帶
    xhr.withCredentials = true;
    // 監聽回傳並解析
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const data = JSON.parse(xhr.responseText);
                if (data.uploaded && data.url) {
                    // 成功拿到 URL，插入 Tiptap
                    editor.chain().focus().setImage({ src: data.url }).run();
                } else {
                    alert('上傳失敗：' + (data.error?.message || '未知錯誤'));
                }
            } catch (e) {
                console.error('解析 Response 失敗', xhr.responseText);
            }
        } else {
            alert('連線失敗，狀態碼：' + xhr.status);
        }
    };
    // XHR 送出
    xhr.send(formData);
    */
}

//輸出擴充功能套件
export const editorExtensions = [
    StarterKit.configure({
        link: false,
        dropcursor: false,
    }),

    Placeholder.configure({
        placeholder: 'My Custom Placeholder',
    }),

    Color,

    TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: [
            'left',
            'center',
            'right',
            'justify',
        ],
    }),

    TextStyle,
    FontFamily,
    BackgroundColor,
    CustomFontSize,

    Image.configure({
        inline: true,
        resize: {
            enabled: true,
            alwaysPreserveAspectRatio: true,
        },
    }),

    Dropcursor,

    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
        },
    }),

    Underline,

    Highlight.configure({
        multicolor: true,
    }),

    cusFontSize,
    ParagraphIndent,

    TableKit.configure({
        table: {
            resizable: true,
        },
    }),

    SearchSelectExtension,

    CustomImageUpload,
]