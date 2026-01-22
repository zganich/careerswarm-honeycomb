# Build Guidelines: Token-Efficient Development

## 🎯 Core Principles

1. **Shell-first:** Use grep/sed before file.read
2. **Batch operations:** Multi-edit, not single edits
3. **Trust edits:** Don't verify by reading back
4. **Grep before read:** Check file size, use grep for large files
5. **Checkpoint protocol:** Test before checkpoint, rollback on failure

## 📏 Token Budget Rules

- **Per session:** 30K hard limit
- **Per file read:** Max 200 lines (use grep for larger)
- **Per planning doc:** Max 500 words
- **Per checkpoint:** Run tests first, no exceptions

## ✅ Best Practices

### File Operations
```bash
# Check file size first
wc -l file.ts

# If >200 lines, use grep
grep -n "pattern" file.ts

# Read specific lines only
sed -n '100,110p' file.ts

# Multi-edit in one call
file.edit({ edits: [
  { find: "error1", replace: "fix1" },
  { find: "error2", replace: "fix2" },
]})
```

### Code Generation
- Write complete files, not partial
- Use templates for repetitive code
- Batch similar components
- Trust TypeScript, don't verify

### Testing
- Write tests as you build
- Run tests before checkpoint
- Fix bugs within 3 attempts
- Rollback if can't fix

## 🚫 Anti-Patterns

❌ Reading files you just wrote  
❌ Single edits when batch would work  
❌ Full file reads for small changes  
❌ Verbose planning documents  
❌ Checkpoints without tests  

## ✅ Patterns

✅ Grep → Edit → Move on  
✅ Batch edits (5+ changes at once)  
✅ Shell commands for file inspection  
✅ Concise task lists in todo.md  
✅ Test → Checkpoint → Notify  
