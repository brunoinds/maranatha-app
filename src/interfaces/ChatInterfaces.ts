
export enum MessageStatus{
    Sending = 'Sending',
    Sent = 'Sent',
    Received = 'Received',
    Read = 'Read',
    Played = 'Played',
    Deleted = 'Deleted'
}
interface IChatMessage {
    id: number;
    sent_at: string;
    body: string;
    from_user_id: number;
    to_user_id: number;
    replies_to: number | null;
    received_at: string | null;
    read_at: string | null;
    played_at: string | null;
    type: string;
    attachment: any | null;
    metadata: any;
    created_at: string;
    updated_at: string;
    status: MessageStatus
}


export type { IChatMessage};