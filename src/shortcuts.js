

// this works enough for now
export const keyCombo = (e) => [
    (e.metaKey || e.key === 'Meta') && 'META',
    (e.ctrlKey || e.key === 'Ctrl') && 'CTRL',
    (e.altKey || e.key === 'Alt') && 'ALT',
    (e.shiftKey || e.key === 'Shift') && 'SHIFT',
    (e.key!=='Meta' && e.key!=='Shift' && e.key!=='Ctrl' && e.key!=='Alt') && e.key.toUpperCase()
].filter(Boolean).join('+')


export const shortcuts = navigator.appVersion.indexOf("Mac") > 0 ? {
        CLEAR: 'META+K',
        IGNORE_LF: 'META+ENTER',
        SEND: 'ENTER',
        UP: 'ARROWUP',
        DOWN: 'ARROWDOWN',
        TOGGLE_CONNECTION: 'META+D',
    } : {
        CLEAR: 'CTRL+L',
        IGNORE_LF: 'CTRL+ENTER',
        SEND: 'ENTER',
        UP: 'ARROWUP',
        DOWN: 'ARROWDOWN',
        TOGGLE_CONNECTION: 'CTRL+D',
    }
