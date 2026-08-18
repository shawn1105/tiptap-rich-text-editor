export function editorController(editor) {
    //#region 編輯器功能功能監聽事件
    // [編輯器功能] 1.字體選擇
    document.getElementById('fontFamily-select').addEventListener('change', (e) => {
        const selectedFont = e.target.value;
        editor.chain().focus().setFontFamily(selectedFont).run();
    });

    // [編輯器功能] 2.字體大小
    document.getElementById('fontSize-select').addEventListener('change', (e) => {
        const selectedSize = e.target.value;
        if (selectedSize === '') {
            editor.chain().focus().unsetFontSize().run();
        } else {
            editor.chain().focus().setFontSize(selectedSize).run();
        }
    });

    // [編輯器功能] 3.粗體
    document.getElementById('bold-btn').addEventListener('click', () => {
        editor.chain().focus().toggleBold().run()
    });

    // [編輯器功能] 4.斜體
    document.getElementById('italic-btn').addEventListener('click', () => {
        editor.chain().focus().toggleItalic().run()
    });

    // [編輯器功能] 5.底線
    document.getElementById('underline-btn').addEventListener('click', () => {
        editor.chain().focus().toggleUnderline().run()
    });

    // [編輯器功能] 6.字體顏色，監聽調色盤的顏色變更
    document.getElementById('fontColor-btn').addEventListener('click', (e) => {
        document.getElementById('hiddenFontColorPicker').click();
    });
    document.getElementById('hiddenFontColorPicker').addEventListener('change', (e) => {
        const color = e.target.value;
        editor.chain().focus().setColor(color).run();
    });
    // 清除字體顏色
    document.getElementById('clearFontColor').addEventListener('click', () => {
        editor.chain().focus().unsetColor().run();
    });

    // [編輯器功能] 7.字體背景色，監聽調色盤的顏色變更
    document.getElementById('backgroundColor-btn').addEventListener('click', (e) => {
        document.getElementById('hiddenBackgroundColorPicker').click();
    });
    document.getElementById('hiddenBackgroundColorPicker').addEventListener('change', (e) => {
        const color = e.target.value;
        editor.chain().focus().setHighlight({ color: color }).run();
    });
    // 清除字體背景色
    document.getElementById('clearBackgroundColor').addEventListener('click', () => {
        editor.chain().focus().unsetHighlight().run();
    });

    // [編輯器功能] 8.靠左對齊
    document.getElementById('alignLeft-btn').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('left').run()
    });
    // [編輯器功能] 9.置中對齊
    document.getElementById('alignCenter-btn').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('center').run()
    });
    // [編輯器功能] 10.靠右對齊
    document.getElementById('alignRight-btn').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('right').run()
    });
    // [編輯器功能] 11.左右對齊
    document.getElementById('justify-btn').addEventListener('click', () => {
        editor.chain().focus().setTextAlign('justify').run()
    });

    // [編輯器功能] 12.符號清單
    document.getElementById('list-btn').addEventListener('click', () => {
        editor.chain().focus().toggleBulletList().run();
    });
    // [編輯器功能] 13.數字清單
    document.getElementById('numlist-btn').addEventListener('click', () => {
        editor.chain().focus().toggleOrderedList().run();
    });

    // [編輯器功能] 14.減少縮排
    document.getElementById('decreaseIndent-btn').addEventListener('click', () => {
        editor.chain().focus().outdent().run();
    });
    // [編輯器功能] 15.增加縮排
    document.getElementById('increaseIndent-btn').addEventListener('click', () => {
        editor.chain().focus().indent().run();
    });

    // [編輯器功能] 16.引用段落
    document.getElementById('quote-btn').addEventListener('click', () => {
        editor.chain().focus().toggleBlockquote().run();
    });

    // [編輯器功能] 17.水平線
    document.getElementById('horizon-btn').addEventListener('click', () => {
        editor.chain().focus().setHorizontalRule().run()
    });

    // [編輯器功能] 18.表格
    const tableDialog = document.getElementById('tableDialog');
    const tableCancel = document.getElementById('tableCancel-btn');
    const tableConfirm = document.getElementById('tableConfirm-btn');
    // 開啟彈出視窗
    document.getElementById('table-btn').addEventListener('click', () => {
        document.getElementById('tableRows-num').value = 3;
        document.getElementById('tableCols-num').value = 3;
        document.getElementById('tableBorder-num').value = 1;
        document.getElementById('tableWidth-num').value = 500;

        tableDialog.showModal();
    });
    // 點擊取消，關閉
    tableCancel.addEventListener('click', () => {
        tableDialog.close();
    });
    // 點擊確認，讀取數值，產生表格並送給 Tiptap
    tableConfirm.addEventListener('click', () => {
        const rows = parseInt(document.getElementById('tableRows-num').value, 10) || 3;
        const cols = parseInt(document.getElementById('tableCols-num').value, 10) || 3;
        const borderWidth = parseInt(document.getElementById('tableBorder-num').value, 10) || 1;
        const tableWidth = parseInt(document.getElementById('tableWidth-num').value, 10) || 1;

        editor.chain().focus().insertTable({
            rows: rows,
            cols: cols,
            withHeaderRow: true
        }).run();
        // Tiptap 插入表格後在外層產生一個 <table> 標籤
        // 更改框線大小
        setTimeout(() => {
            const tables = document.querySelectorAll('#tiptap-editor table');
            if (tables.length > 0) {
                // 抓到畫面上剛剛被插入的那張最新表格
                const latestTable = tables[tables.length - 1];
                // 將使用者輸入的框線粗細，透過 CSS 變數調整該表格
                latestTable.style.setProperty('--table-border-width', `${borderWidth}px`);
                latestTable.style.setProperty('--table-width', `${tableWidth}px`);
            }
        }, 0);
        // 關閉視窗
        tableDialog.close();
    });
    //刪除表格
    document.getElementById('deleteTable-btn').addEventListener('click', () => {
        editor.chain().focus().deleteTable().run();
    });

    // [編輯器功能] 19.超連結
    document.getElementById('link-btn').addEventListener('click', () => {
        if (document.getElementById('link-input-bar').style.display === 'flex') {
            showSubToolbar(null);
        } else {
            showSubToolbar('link');
        }
        // 查看目前有沒有選取連結，若有抓出舊 URL 當預設值
        const previousUrl = editor.getAttributes('link').href;
        if (previousUrl) {
            document.getElementById('linkHref-input').value = previousUrl;
        }
        document.getElementById('linkHref-input').focus();
    });
    // 超連結確認按鈕
    document.getElementById('linkConfirm-btn').addEventListener('click', () => {
        const url = document.getElementById('linkHref-input').value;
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        showSubToolbar(null);
    });
    // 超連結移除按鈕
    document.getElementById('linkRemove-btn').addEventListener('click', () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        showSubToolbar(null);
    });
    // 超連結取消按鈕
    document.getElementById('linkCancel-btn').addEventListener('click', () => {
        showSubToolbar(null);
    });

    // [編輯器功能] 20.插入圖片
    document.getElementById('importImage-btn').addEventListener('click', () => {
        if (document.getElementById('image-input-bar').style.display === 'flex') {
            showSubToolbar(null);
        } else {
            showSubToolbar('image');
        }
    });
    // 插入圖片確認按鈕
    document.getElementById('imageConfirm-btn').addEventListener('click', () => {
        const url = document.getElementById('imageHref-input').value;
        editor.chain().focus().setImage({ src: url }).run();
        showSubToolbar(null);
    });
    // 插入圖片取消按鈕
    document.getElementById('imageCancel-btn').addEventListener('click', () => {
        showSubToolbar(null);
    });
    // 上傳圖片按鈕
    const uploadBtn = document.getElementById('imageUpload-btn');
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    const fileInput = document.getElementById('image-file');
    fileInput.addEventListener('change', (event) => {
        // 確保拿到單一檔案
        const file = event.target.files[0];
        if (!file) return;
        // 設定API後端接收網址
        //editor.commands.setUploadUrl('aaa/test');
        // 呼叫自定義上傳圖片指令
        editor.commands.uploadImageFile(file);
        // 清空 input 確保同一張圖能重複選取觸發
        fileInput.value = '';
        // 呼叫你的 API 發送函式...
        /*
        const formData = new FormData();
        formData.append('upload', fileObject); // 直接塞入，準備送出
        fetch('/aaa/test', {
            method: 'POST',
            body: formData // 瀏覽器會自動封裝成 multipart/form-data
        })
            .then(res => res.json())
            .then(data => {
                // 後端存完檔案後，回傳公開 URL，再由 Tiptap 渲染出來
                editor.chain().focus().setImage({ src: data.url }).run();
            });
        */
    });

    // [編輯器功能] 21.搜尋及取代
    document.getElementById('findReplace-btn').addEventListener('click', () => {
        if (document.getElementById('search-replace-input-bar').style.display === 'flex') {
            showSubToolbar(null);
        } else {
            showSubToolbar('searchandreplace');
        }
    });
    // 綁定輸入文字元件
    const searchInput = document.getElementById('search-input');
    const replaceInput = document.getElementById('replace-input');
    // 搜尋
    document.getElementById('searchnext-btn').addEventListener('click', () => {
        const query = searchInput.value;
        editor.commands.searchAndSelectNext(query);
    });
    // 取代
    document.getElementById('replace-btn').addEventListener('click', () => {
        const replaceWith = replaceInput.value;
        editor.commands.searchAndReplaceCurrent(replaceWith);
        const query = searchInput.value;
        editor.commands.searchAndSelectNext(query);
    });
    // 全部取代
    document.getElementById('replaceall-btn').addEventListener('click', () => {
        const query = searchInput.value;
        const replaceWith = replaceInput.value;
        editor.commands.searchAndReplaceAll(query, replaceWith);
    });
    // 設定搜尋選項
    function updateSearchOptions() {
        editor.commands.setSearchOptions({
            matchCase: document.getElementById("matchCase-chk").checked,
            wholeWord: document.getElementById("wholeWord-chk").checked,
            wrapSearch: document.getElementById("wrapSearch-chk").checked
        });
        // 當使用者變更搜尋選項，清除舊狀態
        editor.commands.clearSearch();
    }
    document.getElementById("matchCase-chk").addEventListener("change", updateSearchOptions);
    document.getElementById("wholeWord-chk").addEventListener("change", updateSearchOptions);
    document.getElementById("wrapSearch-chk").addEventListener("change", updateSearchOptions);
    // 搜尋及取代關閉按鈕
    document.getElementById('search-replace-Cancel-btn').addEventListener('click', () => {
        showSubToolbar(null);
    });
    // 當使用者打字改變時，清除舊狀態
    searchInput.addEventListener('input', () => {
        editor.commands.clearSearch();
    });

    // [編輯器功能] 22.上一步
    document.getElementById('undo-btn').addEventListener('click', () => {
        editor.chain().focus().undo().run();
        //搜尋及取代功能需要初始化
        editor.commands.clearSearch();
    });
    // [編輯器功能] 23.下一步
    document.getElementById('redo-btn').addEventListener('click', () => {
        editor.chain().focus().redo().run();
        //搜尋及取代功能需要初始化
        editor.commands.clearSearch();
    });

    // [編輯器功能] 24.最大化
    document.getElementById('fullScreen-btn').addEventListener('click', (e) => {
        // 切換 .is-fullscreen 類別
        const isNowFullscreen = document.getElementById('editor-container').classList.toggle('is-fullscreen');
        if (isNowFullscreen) {
            document.getElementById('fullScreen-btn').title = '最小化';
        } else {
            document.getElementById('fullScreen-btn').title = '最大化';
        }
        editor.commands.focus();
    });
    //#endregion 編輯器功能功能監聽事件

    //#region 顯示邏輯調整
    // 搜尋及取代功能是否開啟
    let isSearchMode = false;

    // 監聽編輯器的變動，即時更新狀態
    editor.on('transaction', () => {
        // [按鈕]上一步、下一步
        document.getElementById('undo-btn').disabled = !editor.can().undo();
        document.getElementById('redo-btn').disabled = !editor.can().redo();
        // [按鈕]刪除表格
        document.getElementById('deleteTable-btn').disabled = !editor.isActive('table');
    });

    // 切換子功能區塊
    function showSubToolbar(targetBarId) {
        // 所有可出現的子功能區塊全部隱藏
        document.getElementById('link-input-bar').style.display = 'none';
        document.getElementById('linkHref-input').value = '';
        document.getElementById('image-input-bar').style.display = 'none';
        document.getElementById('imageHref-input').value = '';
        document.getElementById('search-replace-input-bar').style.display = 'none';
        document.getElementById('search-input').value = '';
        document.getElementById('replace-input').value = '';
        isSearchMode = false;
        document.getElementById('tiptap-editor').classList.remove('editor-locked');
        // 使用者傳入特定的 ID，就只單獨將那一列用 'flex' 打開
        if (targetBarId === 'link') {
            document.getElementById('link-input-bar').style.display = 'flex';
            document.getElementById('linkHref-input').focus();
        } else if (targetBarId === 'image') {
            document.getElementById('image-input-bar').style.display = 'flex';
            document.getElementById('imageHref-input').focus();
        } else if (targetBarId === 'searchandreplace') {
            document.getElementById('search-replace-input-bar').style.display = 'flex';
            document.getElementById('search-input').focus();
            isSearchMode = true;
            document.getElementById('tiptap-editor').classList.add('editor-locked');
        }
    }
    // 攔截編輯器區塊內的鍵盤輸入
    window.addEventListener('keydown', (event) => {
        if (isSearchMode) {
            const editArea = editor.options.element.querySelector('.tiptap');
            // 判斷鍵盤輸入位置於使用者的焦點(Focus)是在編輯器之內
            if (editArea && editArea.contains(document.activeElement)) {
                // 攔截所有鍵盤輸入
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }, true);
    //#endregion 顯示邏輯調整
}