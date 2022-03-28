export function getEvent(events: any[] | undefined, eventName: string): any | null {
    if (!events) {
        return null;
    }
    const matches = events.filter(e => e.event == eventName);
    if (matches.length > 1) {
        throw new Error(`Multiple events with the name: ${eventName}`);
    } else if (matches.length > 0) {
        return matches[0];
    } else {
        return null;
    }
}