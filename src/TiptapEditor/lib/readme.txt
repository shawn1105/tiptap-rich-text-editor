Step 1. 建立臨時資料夾
用終端機（Terminal 或命令提示字元）進入該資料夾。

Step 2. 下載所有需要的套件
目前Tiptap有Import這些套件，對應下載的套件。
```
import { Extension } from 'https://esm.sh/@tiptap/core'
import { StarterKit } from 'https://esm.sh/@tiptap/starter-kit'
import { Placeholder } from 'https://esm.sh/@tiptap/extension-placeholder'
import { TextStyle, FontSize, Color, BackgroundColor, FontFamily } from 'https://esm.sh/@tiptap/extension-text-style'
import { TextAlign } from 'https://esm.sh/@tiptap/extension-text-align'
import { Image } from 'https://esm.sh/@tiptap/extension-image'
import { Dropcursor } from 'https://esm.sh/@tiptap/extensions'
import { Paragraph } from 'https://esm.sh/@tiptap/extension-paragraph'
import { Link from } 'https://esm.sh/@tiptap/extension-link'
import { Underline } from 'https://esm.sh/@tiptap/extension-underline'
import { Highlight } from 'https://esm.sh/@tiptap/extension-highlight'
import { TableKit } from 'https://esm.sh/@tiptap/extension-table'
import { Plugin, PluginKey } from 'https://esm.sh/@tiptap/pm/state'
import { Decoration, DecorationSet } from 'https://esm.sh/@tiptap/pm/view';
```
在臨時資料夾下載對應套件，並產生package.json、package-lock.json。
```
npm init -y
npm install @tiptap/core @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-text-style @tiptap/extension-text-align @tiptap/extension-image @tiptap/extensions @tiptap/extension-paragraph @tiptap/extension-link @tiptap/extension-underline @tiptap/extension-highlight @tiptap/extension-table @tiptap/pm
```

Step 3. 建立一個「進入點」檔案 entry.js
在臨時資料夾建立一個 entry.js 的檔案，把你需要的所有 import 和想要導出的東西寫進去。
為了讓你在本機開發時方便使用，我們把這些元件通通導出（export）。
```
// entry.js
export { Editor, Extension } from '@tiptap/core'
export { default as StarterKit } from '@tiptap/starter-kit'
export { Placeholder } from '@tiptap/extension-placeholder'
export { TextStyle, FontSize, Color, BackgroundColor, FontFamily } from '@tiptap/extension-text-style'
export { default as TextAlign } from '@tiptap/extension-text-align'
export { default as Image } from '@tiptap/extension-image'
export { Dropcursor } from '@tiptap/extensions'
export { default as Paragraph } from '@tiptap/extension-paragraph'
export { default as Link } from '@tiptap/extension-link'
export { default as Underline } from '@tiptap/extension-underline'
export { default as Highlight } from '@tiptap/extension-highlight'
export { TableKit } from '@tiptap/extension-table'
export { Plugin, PluginKey } from '@tiptap/pm/state'
export { Decoration, DecorationSet } from '@tiptap/pm/view'
```

Step 4. 合併成單一本地檔案
在命令提示字元執行 npx esbuild 指令。
這個工具會自動去 node_modules 撈取所有依賴檔案、解決所有內部路徑問題，並合併壓縮成一個檔案 (tiptap-bundle.js)。
```
npx esbuild entry.js --bundle --minify --format=esm --outfile=tiptap-bundle.js
```

Step 5. 使用單一本地檔案(tiptap-bundle.js)
import 的變數需要用大括號引入。
```
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
```
