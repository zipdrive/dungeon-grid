export type MouseEventHandlers = {
    onClick?: (e: React.MouseEvent) => any,
    onDoubleClick?: (e: React.MouseEvent) => any,
    onMouseDown?: (e: React.MouseEvent) => any,
    onMouseUp?: (e: React.MouseEvent) => any,
    onMouseMove?: (e: React.MouseEvent) => any,
    onMouseEnter?: (e: React.MouseEvent) => any,
    onMouseLeave?: (e: React.MouseEvent) => any,
    onContextMenu?: (e: React.MouseEvent) => any,
};

export type FocusEventHandlers = {
    onFocus?: (e: React.FocusEvent) => any,
    onBlur?: (e: React.FocusEvent) => any,
};

export type ClipboardEventHandlers = {
    onCopy?: (e: React.ClipboardEvent) => any,
    onPaste?: (e: React.ClipboardEvent) => any,
    onCut?: (e: React.ClipboardEvent) => any,
};

export type EventHandlers = 
    MouseEventHandlers 
    & FocusEventHandlers
    & ClipboardEventHandlers
;

/**
 * Extracts only the event handlers from an object.
 */
export function extractEventHandlers(e: EventHandlers): EventHandlers {
    return {
        onClick: e.onClick,
        onDoubleClick: e.onDoubleClick,
        onMouseDown: e.onMouseDown,
        onMouseUp: e.onMouseUp,
        onMouseMove: e.onMouseMove,
        onMouseEnter: e.onMouseEnter,
        onMouseLeave: e.onMouseLeave,
        onContextMenu: e.onContextMenu,

        onFocus: e.onFocus,
        onBlur: e.onBlur,
        
        onCopy: e.onCopy,
        onPaste: e.onPaste,
        onCut: e.onCut
    };
}