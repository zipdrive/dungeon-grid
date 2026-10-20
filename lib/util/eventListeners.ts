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

export type EventHandlers = 
    MouseEventHandlers 
    & FocusEventHandlers
;

/**
 * Extracts only the event handlers from an object.
 */
export function extractEventHandlers(e: EventHandlers, defaults: EventHandlers | null = null): EventHandlers {
    return {
        onClick: e.onClick ?? defaults?.onClick,
        onDoubleClick: e.onDoubleClick ?? defaults?.onDoubleClick,
        onMouseDown: e.onMouseDown ?? defaults?.onMouseDown,
        onMouseUp: e.onMouseUp ?? defaults?.onMouseUp,
        onMouseMove: e.onMouseMove ?? defaults?.onMouseMove,
        onMouseEnter: e.onMouseEnter ?? defaults?.onMouseEnter,
        onMouseLeave: e.onMouseLeave ?? defaults?.onMouseLeave,
        onContextMenu: e.onContextMenu ?? defaults?.onContextMenu,

        onFocus: e.onFocus ?? defaults?.onFocus,
        onBlur: e.onBlur ?? defaults?.onBlur,
    };
}