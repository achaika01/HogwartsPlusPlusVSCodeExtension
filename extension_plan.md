# Hogwarts++ VS Code Extension — Детальний план

## Огляд граматики

З [`grammar.ebnf`](file:///c:/Users/q1112/source/repos/CS400/HogwartsPlusPlusVSCodeExtension/grammar.ebnf):

```ebnf
program   ::= { statement } exit
stmt      ::= decl | asmt | if_stmt
decl      ::= type [ "animagus" ] ident "🚂" expr "🏰"
type      ::= "knut" | "galleon" | "🪄"
asmt      ::= ident "accio" expr
exit      ::= "evanesco" expr
if_stmt   ::= "🔓" expr "🚂" statement { statement } "🏰" [ "🔒" "🚂" statement { statement } "🏰" ]
expr      ::= arith [ ("⚖️" | "⚔️") arith ]
arith     ::= term { ("geminio" | "reducto") term }
term      ::= factor { "engorgio" factor }
factor    ::= number | "lumos" | "nox" | ident
```

### Повний словник токенів мови

| Категорія | Токени |
|---|---|
| **Ключові слова** | `knut`, `galleon`, `animagus`, `accio`, `evanesco`, `geminio`, `reducto`, `engorgio`, `lumos`, `nox` |
| **Оператори-емодзі** | `🚂` (присвоєння/початок блоку), `🏰` (кінець блоку), `🪄` (тип), `🔓` (if/відкрити), `🔒` (else/закрити), `⚖️` (рівність), `⚔️` (нерівність) |

---

## Структура проекту

```
HogwartsPlusPlusVSCodeExtension/
├── .vscode/
│   └── launch.json              # Конфігурація запуску/відладки розширення
├── syntaxes/
│   └── hogwarts.tmLanguage.json # TextMate grammar для підсвічування синтаксису
├── snippets/
│   └── hogwarts.json            # Snippets для швидкого введення
├── src/
│   └── extension.ts             # Головний файл розширення (CompletionProvider)
├── grammar.ebnf                 # (вже існує)
├── language-configuration.json  # Конфігурація мови (дужки, коментарі)
├── package.json                 # Маніфест розширення
├── tsconfig.json
└── README.md
```

---

## Крок 1 — Ініціалізація проекту

```bash
npm install -g yo generator-code   # якщо не встановлено
yo code                            # або вручну:
npm init -y
npm install --save-dev @types/vscode typescript
```

Мінімальний `package.json`:
```json
{
  "name": "hogwarts-plus-plus",
  "displayName": "Hogwarts++",
  "description": "Language support for Hogwarts++ — emoji-keyword language",
  "version": "0.1.0",
  "engines": { "vscode": "^1.80.0" },
  "categories": ["Programming Languages"],
  "activationEvents": ["onLanguage:hogwarts"],
  "main": "./out/extension.js",
  "contributes": {
    "languages": [{
      "id": "hogwarts",
      "aliases": ["Hogwarts++", "hogwarts"],
      "extensions": [".hgw"],
      "configuration": "./language-configuration.json"
    }],
    "grammars": [{
      "language": "hogwarts",
      "scopeName": "source.hgw",
      "path": "./syntaxes/hogwarts.tmLanguage.json"
    }],
    "snippets": [{
      "language": "hogwarts",
      "path": "./snippets/hogwarts.json"
    }]
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Крок 2 — `language-configuration.json`

Налаштовує поведінку редактора: авто-закриття дужок, коментарі тощо.

```json
{
  "comments": {
    "lineComment": "#"
  },
  "brackets": [],
  "autoClosingPairs": [],
  "wordPattern": "[🚂🏰🪄🔓🔒⚖️⚔️]|[a-zA-Z_][a-zA-Z0-9_]*"
}
```

> [!NOTE]  
> `wordPattern` важливий — він визначає, що вважається «словом» при автодоповненні.  
> Емодзі повинні бути частиною цього патерну, інакше `CompletionProvider` не зможе правильно визначити поточне слово.

---

## Крок 3 — TextMate Grammar (`syntaxes/hogwarts.tmLanguage.json`)

Забезпечує **підсвічування синтаксису** для всіх токенів мови.

```json
{
  "name": "Hogwarts++",
  "scopeName": "source.hgw",
  "patterns": [
    { "include": "#keywords" },
    { "include": "#emoji-operators" },
    { "include": "#numbers" },
    { "include": "#identifiers" }
  ],
  "repository": {
    "keywords": {
      "match": "\\b(knut|galleon|animagus|accio|evanesco|geminio|reducto|engorgio|lumos|nox)\\b",
      "name": "keyword.control.hogwarts"
    },
    "emoji-operators": {
      "match": "(🚂|🏰|🪄|🔓|🔒|⚖️|⚔️)",
      "name": "keyword.operator.emoji.hogwarts"
    },
    "numbers": {
      "match": "\\b[0-9]+\\b",
      "name": "constant.numeric.hogwarts"
    },
    "identifiers": {
      "match": "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b",
      "name": "variable.other.hogwarts"
    }
  }
}
```

### Scope-імена для теми кольорів
| Scope | Призначення |
|---|---|
| `keyword.control.hogwarts` | `knut`, `galleon`, `accio` тощо — зазвичай фіолетовий/синій |
| `keyword.operator.emoji.hogwarts` | Емодзі-оператори — зазвичай яскравий колір |
| `constant.numeric.hogwarts` | Числа — зелений/помаранчевий |
| `variable.other.hogwarts` | Ідентифікатори |

---

## Крок 4 — Snippets (`snippets/hogwarts.json`)

Snippets дозволяють швидко вставляти шаблони коду з Tab-стопами.

```json
{
  "Variable Declaration": {
    "prefix": "knut",
    "body": ["knut ${1:varname} 🚂 ${2:0} 🏰"],
    "description": "Declare an integer variable"
  },
  "Galleon Declaration": {
    "prefix": "galleon",
    "body": ["galleon ${1:varname} 🚂 ${2:0} 🏰"],
    "description": "Declare a float variable"
  },
  "Animagus Declaration": {
    "prefix": "animagus",
    "body": ["knut animagus ${1:varname} 🚂 ${2:0} 🏰"],
    "description": "Declare a constant variable"
  },
  "Assignment": {
    "prefix": "accio",
    "body": ["${1:varname} accio ${2:expr}"],
    "description": "Assign a value"
  },
  "If Statement": {
    "prefix": "🔓",
    "body": [
      "🔓 ${1:condition} 🚂",
      "\t${2:statement}",
      "🏰"
    ],
    "description": "If statement"
  },
  "If-Else Statement": {
    "prefix": "ifelse",
    "body": [
      "🔓 ${1:condition} 🚂",
      "\t${2:if_body}",
      "🏰 🔒 🚂",
      "\t${3:else_body}",
      "🏰"
    ],
    "description": "If-else statement"
  },
  "Exit": {
    "prefix": "evanesco",
    "body": ["evanesco ${1:0}"],
    "description": "Exit program"
  }
}
```

---

## Крок 5 — CompletionProvider (`src/extension.ts`)

Головна логіка розширення. Реєструє **IntelliSense-автодоповнення** для двох категорій:

### 5.1 — Текстові ключові слова

Тригер: користувач починає вводити будь-яку латинську літеру → пропонуємо ключові слова.

```typescript
import * as vscode from 'vscode';

const KEYWORDS = [
  'knut', 'galleon', 'animagus', 'accio', 'evanesco',
  'geminio', 'reducto', 'engorgio', 'lumos', 'nox'
];

const EMOJI_TOKENS: { label: string; insert: string; detail: string }[] = [
  { label: '🚂', insert: '🚂', detail: 'Assignment / Block open (::=)' },
  { label: '🏰', insert: '🏰', detail: 'Block end' },
  { label: '🪄', insert: '🪄', detail: 'Magic type (wand)' },
  { label: '🔓', insert: '🔓', detail: 'If statement (open lock)' },
  { label: '🔒', insert: '🔒', detail: 'Else clause (closed lock)' },
  { label: '⚖️',  insert: '⚖️',  detail: 'Equality operator' },
  { label: '⚔️',  insert: '⚔️',  detail: 'Inequality operator' },
];

export function activate(context: vscode.ExtensionContext) {

  // --- Provider 1: keyword completion (Latin letters) ---
  const keywordProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'hogwarts' },
    {
      provideCompletionItems(document, position) {
        return KEYWORDS.map(kw => {
          const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword);
          item.detail = 'Hogwarts++ keyword';
          return item;
        });
      }
    }
  );

  // --- Provider 2: emoji completion, triggered by ':' ---
  const emojiProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'hogwarts' },
    {
      provideCompletionItems(document, position) {
        return EMOJI_TOKENS.map(tok => {
          const item = new vscode.CompletionItem(tok.label, vscode.CompletionItemKind.Operator);
          item.insertText = tok.insert;
          item.detail = tok.detail;
          item.filterText = tok.label;
          return item;
        });
      }
    },
    ':'  // trigger character
  );

  context.subscriptions.push(keywordProvider, emojiProvider);
}

export function deactivate() {}
```

### 5.2 — Hover Provider (документація при наведенні)

```typescript
const hoverProvider = vscode.languages.registerHoverProvider(
  { language: 'hogwarts' },
  {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[🚂🏰🪄🔓🔒⚖️⚔️]|[\w]+/u);
      if (!range) return;
      const word = document.getText(range);
      const docs: Record<string, string> = {
        'knut':     '**knut** — integer variable type',
        'galleon':  '**galleon** — float variable type',
        '🪄':       '**🪄** — magic/string type',
        'animagus': '**animagus** — constant modifier',
        'accio':    '**accio** — assignment operator',
        'evanesco': '**evanesco** — program exit',
        'geminio':  '**geminio** — addition',
        'reducto':  '**reducto** — subtraction',
        'engorgio': '**engorgio** — multiplication',
        'lumos':    '**lumos** — boolean true',
        'nox':      '**nox** — boolean false',
        '🚂':       '**🚂** — assignment / block open',
        '🏰':       '**🏰** — block end',
        '🔓':       '**🔓** — if statement',
        '🔒':       '**🔒** — else clause',
        '⚖️':        '**⚖️** — equality (==)',
        '⚔️':        '**⚔️** — inequality (!=)',
      };
      if (docs[word]) {
        return new vscode.Hover(new vscode.MarkdownString(docs[word]));
      }
    }
  }
);
context.subscriptions.push(hoverProvider);
```

---

## Крок 6 — Emoji Replacement (автозаміна тексту → емодзі)

Ця функція дозволяє набирати ASCII-псевдоніми і автоматично замінювати їх на емодзі при натисканні пробілу або Enter.

### Маппінг псевдонімів

| Псевдонім | Емодзі |
|---|---|
| `:train:` | `🚂` |
| `:castle:` | `🏰` |
| `:wand:` | `🪄` |
| `:unlock:` | `🔓` |
| `:lock:` | `🔒` |
| `:scales:` | `⚖️` |
| `:crossed_swords:` | `⚔️` |

### Реалізація через `onDidChangeTextDocument`

```typescript
const aliasMap: Record<string, string> = {
  ':train:':          '🚂',
  ':castle:':         '🏰',
  ':wand:':           '🪄',
  ':unlock:':         '🔓',
  ':lock:':           '🔒',
  ':scales:':         '⚖️',
  ':crossed_swords:': '⚔️',
};

vscode.workspace.onDidChangeTextDocument(event => {
  const editor = vscode.window.activeTextEditor;
  if (!editor || event.document !== editor.document) return;
  if (editor.document.languageId !== 'hogwarts') return;

  for (const change of event.contentChanges) {
    // Перевіряємо тільки при вставці пробілу/Enter
    if (change.text !== ' ' && change.text !== '\n') continue;

    const line = event.document.lineAt(change.range.start.line).text;
    for (const [alias, emoji] of Object.entries(aliasMap)) {
      if (line.endsWith(alias)) {
        const start = change.range.start.translate(0, -alias.length);
        const end = change.range.start;
        editor.edit(editBuilder => {
          editBuilder.replace(new vscode.Range(start, end), emoji);
        });
        break;
      }
    }
  }
});
```

> [!TIP]  
> Альтернатива: зареєструвати `CompletionItem` з `kind = Text` і `insertText = emoji`,  
> де `filterText` = псевдонім. Тоді заміна відбувається через стандартний механізм IntelliSense без окремого listener.

---

## Крок 7 — Конфігурація збірки (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "./out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "strict": true,
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

---

## Крок 8 — Налаштування відладки (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "${defaultBuildTask}"
    }
  ]
}
```

---

## Порядок реалізації (checklist)

- [ ] **1.** Ініціалізувати проект: `npm init`, встановити залежності
- [ ] **2.** Створити `package.json` з маніфестом розширення
- [ ] **3.** Створити `language-configuration.json`
- [ ] **4.** Створити `syntaxes/hogwarts.tmLanguage.json` → перевірити підсвічування
- [ ] **5.** Створити `snippets/hogwarts.json`
- [ ] **6.** Написати `src/extension.ts` — keyword CompletionProvider
- [ ] **7.** Додати emoji CompletionProvider (тригер `:`)
- [ ] **8.** Додати HoverProvider
- [ ] **9.** Додати emoji replacement listener
- [ ] **10.** Скомпілювати (`npm run compile`), запустити через F5
- [ ] **11.** Протестувати у Extension Development Host
- [ ] **12.** Написати `README.md` з прикладами коду

---

## Нотатки щодо емодзі у VS Code

> [!WARNING]  
> VS Code обробляє емодзі як **мультибайтні символи**. Декілька важливих речей:
> - `document.getWordRangeAtPosition()` може не захопити емодзі без правильного `wordPattern` у `language-configuration.json`
> - Regex у TextMate grammar для емодзі-послідовностей (як `⚖️` = U+2696 + U+FE0F) потребує перевірки — можна використовувати `\u{2696}` або напряму вставляти символ
> - Для `filterText` у CompletionItem краще вказувати і псевдонім, і сам емодзі

---

## Посилання

- [VS Code Extension API — CompletionItemProvider](https://code.visualstudio.com/api/references/vscode-api#CompletionItemProvider)
- [VS Code Language Configuration](https://code.visualstudio.com/api/language-extensions/language-configuration-guide)
- [TextMate Grammar Reference](https://macromates.com/manual/en/language_grammars)
- [VSCodeKaguLangSupport](https://github.com/vovaskochko/VSCodeKaguLangSupport) — референсний проект
