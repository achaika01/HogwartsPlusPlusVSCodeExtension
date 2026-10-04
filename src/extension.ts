import * as vscode from 'vscode';

const KEYWORDS = [
  'knut', 'galleon', 'animagus', 'accio', 'evanesco',
  'geminio', 'reducto', 'engorgio', 'lumos', 'nox'
];

const EMOJI_TOKENS: { label: string; insert: string; detail: string }[] = [
  { label: '🚂', insert: '🚂', detail: 'Assignment / Block open (::=)' },
  { label: '🏰', insert: '🏰', detail: 'Block end' },
  { label: '🪄', insert: '🪄', detail: 'Boolean type (wand)' },
  { label: '🔓', insert: '🔓', detail: 'If statement (open lock)' },
  { label: '🔒', insert: '🔒', detail: 'Else clause (closed lock)' },
  { label: '⚖️',  insert: '⚖️',  detail: 'Equality operator' },
  { label: '⚔️',  insert: '⚔️',  detail: 'Inequality operator' },
];

const aliasMap: Record<string, string> = {
  ':train:':          '🚂',
  ':castle:':         '🏰',
  ':wand:':           '🪄',
  ':unlock:':         '🔓',
  ':lock:':           '🔒',
  ':scales:':         '⚖️',
  ':crossed_swords:': '⚔️',
};

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

  // --- Provider 3: Hover Provider ---
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
          '🪄':       '**🪄** — boolean type',
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

  // --- Emoji replacement listener ---
  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || event.document !== editor.document) return;
    if (editor.document.languageId !== 'hogwarts') return;
  
    for (const change of event.contentChanges) {
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

  context.subscriptions.push(keywordProvider, emojiProvider, hoverProvider, documentChangeListener);
}

export function deactivate() {}
