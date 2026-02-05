import { supabase, isSupabaseConfigured, withTimeout, DEFAULT_TIMEOUT } from '../lib/supabase';

export type TicketType = 'logistics' | 'damage' | 'quality' | 'other';
export type TicketStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface SupportTicket {
    id: string;
    user_id: string;
    type: TicketType;
    status: TicketStatus;
    description: string | null;
    evidence_urls: string[];
    created_at: string;
    updated_at: string;
}

// Create a support ticket
export async function createTicket(data: {
    userId: string;
    type: TicketType;
    description?: string;
    evidenceUrls?: string[];
}): Promise<SupportTicket | null> {
    if (!isSupabaseConfigured || !supabase) {
        console.log('[Mock] Creating support ticket:', data);
        return {
            id: 'mock-ticket-id',
            user_id: data.userId,
            type: data.type,
            status: 'pending',
            description: data.description || null,
            evidence_urls: data.evidenceUrls || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    try {
        const { data: ticket, error } = await withTimeout(
            supabase
                .from('support_tickets')
                .insert({
                    user_id: data.userId,
                    type: data.type,
                    description: data.description || null,
                    evidence_urls: data.evidenceUrls || []
                })
                .select()
                .single(),
            DEFAULT_TIMEOUT,
            'Create support ticket'
        );

        if (error || !ticket) return null;
        return ticket;
    } catch (err) {
        console.error('[SupportService] Error creating ticket:', err);
        return null;
    }
}

// Get user's tickets
export async function getTickets(userId: string): Promise<SupportTicket[]> {
    if (!isSupabaseConfigured || !supabase) {
        return [];
    }

    try {
        const { data, error } = await withTimeout(
            supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            DEFAULT_TIMEOUT,
            'Get support tickets'
        );

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('[SupportService] Error fetching tickets:', err);
        return [];
    }
}

// Update ticket
export async function updateTicket(
    ticketId: string,
    userId: string,
    updates: Partial<Pick<SupportTicket, 'description' | 'evidence_urls'>>
): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        const { error } = await withTimeout(
            supabase
                .from('support_tickets')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', ticketId)
                .eq('user_id', userId),
            DEFAULT_TIMEOUT,
            'Update support ticket'
        );

        return !error;
    } catch (err) {
        console.error('[SupportService] Error updating ticket:', err);
        return false;
    }
}

// Upload evidence file (returns URL)
export async function uploadEvidence(userId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
        // Return a mock URL
        return URL.createObjectURL(file);
    }

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error } = await withTimeout(
            supabase.storage
                .from('evidence')
                .upload(fileName, file),
            30000, // Longer timeout for file uploads
            'Upload evidence file'
        );

        if (error) return null;

        const { data: { publicUrl } } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (err) {
        console.error('[SupportService] Error uploading evidence:', err);
        return null;
    }
}

// Get ticket type label
export function getTicketTypeLabel(type: TicketType): string {
    const labels: Record<TicketType, string> = {
        logistics: '物流异常',
        damage: '商品破损',
        quality: '质量问题',
        other: '其他'
    };
    return labels[type];
}

// Get status label
export function getStatusLabel(status: TicketStatus): string {
    const labels: Record<TicketStatus, string> = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        closed: '已关闭'
    };
    return labels[status];
}
