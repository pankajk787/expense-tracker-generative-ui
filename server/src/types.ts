// type StreamMessage = {
//     type: "ai" | "toolCall:start" | "tool",
//     payload: { 
//         text: string; 
//         name?: string;
//         args?: Record<string, any>,
//         result?: Record<string, any>
//     }
// }
// TS: Discriminated unions
export type StreamMessage = | {
    type: "ai",
    payload: { text: string }
}
| {
    type: "toolCall:start",
    payload: { name: string, args: Record<string, any> }
}
| {
    type: "tool",
    payload: { name: string, result: Record<string, any> }
}