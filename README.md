# Hogwarts++ VS Code Extension

Welcome to the **Hogwarts++** language extension for Visual Studio Code!

This extension provides rich language support for **Hogwarts++** — an emoji-and-keyword based programming language.

## Features

- **Syntax Highlighting**: Full TextMate grammar support for keywords, emoji operators, variables, and numbers.
- **Snippets**: Quickly generate boilerplate code for variables, assignments, if/else blocks, and program exits.
- **Code Completion**:
  - Auto-completion for keywords (`knut`, `galleon`, `animagus`, etc.).
  - Auto-completion for emoji operators (triggered by typing `:`).
- **Hover Documentation**: Hover over any keyword or emoji operator to see its meaning and usage.
- **Emoji Replacement**: Type aliases like `:train:`, `:castle:`, `:wand:` and press `Space` or `Enter` to automatically convert them to the corresponding emojis (`🚂`, `🏰`, `🪄`, etc.).

## Language Syntax

```hogwarts
# Integer and float variables
knut a 🚂 10 🏰
galleon b 🚂 3.14 🏰

# Assignment and arithmetic
a accio a geminio 5

# If statement
🔓 a ⚖️ 15 🚂
    a accio a reducto 1
🏰
```

## Emoji Operators

| Emoji | Alias | Description |
|---|---|---|
| `🚂` | `:train:` | Assignment / Block open |
| `🏰` | `:castle:` | Block end |
| `🪄` | `:wand:` | Boolean type |
| `🔓` | `:unlock:` | If statement (open lock) |
| `🔒` | `:lock:` | Else clause (closed lock) |
| `⚖️` | `:scales:` | Equality operator (==) |
| `⚔️` | `:crossed_swords:` | Inequality operator (!=) |

## Development

- Run `npm run compile` to build the extension.
- Press `F5` in VS Code to open an Extension Development Host and test the extension.

---
Enjoy coding in Hogwarts++! 🪄
