import { supabase, isSupabaseConfigured, withTimeout, DEFAULT_TIMEOUT } from '../lib/supabase';

export interface AvatarConfig {
    id?: string;
    user_id: string;
    seed: string;
    style: string;
    hair: string;
    face: string;
    clothes: string;
    makeup: string;
    color: string;
    voice_pitch: number;
    motion: string;
    scene: string;
    characterId: string;
}

// Get user's avatar configuration
export async function getAvatarConfig(userId: string): Promise<AvatarConfig | null> {
    if (!isSupabaseConfigured || !supabase) {
        return getLocalAvatarConfig();
    }

    try {
        const { data, error } = await withTimeout(
            supabase
                .from('avatar_configs')
                .select('*')
                .eq('user_id', userId)
                .single(),
            DEFAULT_TIMEOUT,
            'Get avatar config'
        );

        if (error || !data) return getLocalAvatarConfig();
        return data;
    } catch (err) {
        console.error('[AvatarService] Error fetching config:', err);
        return getLocalAvatarConfig();
    }
}

// Save avatar configuration
export async function saveAvatarConfig(config: AvatarConfig): Promise<boolean> {
    // Always save full config locally (includes new fields like style, scene, characterId)
    saveLocalAvatarConfig(config);

    if (!isSupabaseConfigured || !supabase) {
        return true;
    }

    try {
        // Only send database-compatible fields to Supabase
        // New fields (style, scene, characterId) are stored in localStorage only
        const { error } = await withTimeout(
            supabase
                .from('avatar_configs')
                .upsert({
                    user_id: config.user_id,
                    seed: config.seed,
                    hair: config.hair,
                    face: config.face,
                    clothes: config.clothes,
                    makeup: config.makeup,
                    color: config.color,
                    voice_pitch: config.voice_pitch,
                    motion: config.motion,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                }),
            DEFAULT_TIMEOUT,
            'Save avatar config'
        );

        if (error) {
            console.error('Error saving avatar config:', error);
            // Still return true since localStorage save succeeded
            return true;
        }

        return true;
    } catch (err) {
        console.error('Error saving avatar config:', err);
        // Still return true since localStorage save succeeded
        return true;
    }
}

// Default avatar configuration
export function getDefaultAvatarConfig(userId: string = 'guest'): AvatarConfig {
    return {
        user_id: userId,
        seed: 'Natsumi',
        style: 'micah',
        hair: 'hair-0',
        face: 'face-0',
        clothes: 'cloth-0',
        makeup: 'makeup-0',
        color: 'c2',
        voice_pitch: 50,
        motion: 'm1',
        scene: 'stage',
        characterId: ''
    };
}

// Local storage helpers for offline/guest mode
const LOCAL_STORAGE_KEY = 'avatar_config';

function getLocalAvatarConfig(): AvatarConfig | null {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parsing errors
    }
    return null;
}

function saveLocalAvatarConfig(config: AvatarConfig): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Ignore storage errors
    }
}

// ====================== Avatar Styles ======================
export const AVATAR_STYLES = [
    { id: 'micah', name: '日漫风', icon: '🎌' },
    { id: 'adventurer', name: '冒险者', icon: '🗡' },
    { id: 'bottts', name: '机器人', icon: '🤖' },
    { id: 'fun-emoji', name: '趣味表情', icon: '😜' },
    { id: 'lorelei', name: '精灵幻想', icon: '🧝' },
    { id: 'pixel-art', name: '像素艺术', icon: '👾' },
];

// ====================== Character Models (Featured) ======================
export interface CharacterModel {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    thumbnailUrl: string;
    category: string;
    glowColor: string;
    recommendedScene: string;
}

export const CHARACTER_MODELS: CharacterModel[] = [
    {
        id: 'wukong',
        name: '孙悟空',
        description: '齐天大圣，七十二变，筋斗云上带货无敌',
        imageUrl: 'https://images.unsplash.com/photo-1611457194403-d3571b64dbdb?w=400&h=500&fit=crop',
        thumbnailUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=MonkeyKing&backgroundColor=ffd700&hair=short04&skinColor=f5a623',
        category: '国风',
        glowColor: '#FFD700',
        recommendedScene: 'mythical'
    },
    {
        id: 'nezha',
        name: '哪吒',
        description: '我命由我不由天，魔童降世燃爆直播间',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=500&fit=crop',
        thumbnailUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Nezha&backgroundColor=ff4444&hair=short19&skinColor=f5cfa0',
        category: '国风',
        glowColor: '#FF4444',
        recommendedScene: 'fire'
    },
    {
        id: 'sailormoon',
        name: '美少女战士',
        description: '代表月亮消灭一切低价，爱与正义的带货少女',
        imageUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=500&fit=crop',
        thumbnailUrl: 'https://api.dicebear.com/9.x/adventurer/svg?seed=SailorMoon&backgroundColor=ffb6c1&hair=long15&skinColor=fce4ec',
        category: '日漫',
        glowColor: '#FFB6C1',
        recommendedScene: 'starry'
    },
    {
        id: 'judy',
        name: '朱迪',
        description: '来自疯狂动物城的超级警官，活力满满带你抢好货',
        imageUrl: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=500&fit=crop',
        thumbnailUrl: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Judy&backgroundColor=87ceeb',
        category: '动画',
        glowColor: '#87CEEB',
        recommendedScene: 'city'
    },
    {
        id: 'ironman',
        name: '钢铁侠',
        description: 'I am Iron Man，科技感直播间，高端好物推荐官',
        imageUrl: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=400&h=500&fit=crop',
        thumbnailUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=IronMan&backgroundColor=b71c1c&textureColor=ffd700',
        category: '漫威',
        glowColor: '#E53935',
        recommendedScene: 'tech'
    }
];

// ====================== Scene Presets ======================
export interface ScenePreset {
    id: string;
    name: string;
    description: string;
    backgroundUrl: string;
    overlayGradient: string;
    particleColor: string;
    icon: string;
}

export const SCENE_PRESETS: ScenePreset[] = [
    {
        id: 'stage',
        name: '霓虹舞台',
        description: '华丽的演唱会舞台',
        backgroundUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(139,0,255,0.4) 0%, rgba(255,0,128,0.3) 100%)',
        particleColor: '#a855f7',
        icon: '🎤'
    },
    {
        id: 'living',
        name: '温馨客厅',
        description: '舒适的家居直播场景',
        backgroundUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(255,183,77,0.3) 0%, rgba(255,235,205,0.2) 100%)',
        particleColor: '#f59e0b',
        icon: '🛋'
    },
    {
        id: 'outdoor',
        name: '樱花户外',
        description: '浪漫的户外花园',
        backgroundUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(255,182,193,0.3) 0%, rgba(255,255,255,0.1) 100%)',
        particleColor: '#f472b6',
        icon: '🌸'
    },
    {
        id: 'tech',
        name: '赛博朋克',
        description: '未来科技直播空间',
        backgroundUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(0,212,255,0.4) 0%, rgba(9,9,121,0.5) 100%)',
        particleColor: '#06b6d4',
        icon: '🌐'
    },
    {
        id: 'mythical',
        name: '仙境云海',
        description: '飘渺的东方仙境',
        backgroundUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.3) 100%)',
        particleColor: '#fbbf24',
        icon: '🏔'
    },
    {
        id: 'starry',
        name: '星空幻境',
        description: '璀璨的星空环绕',
        backgroundUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(30,0,100,0.5) 0%, rgba(100,0,200,0.3) 100%)',
        particleColor: '#c084fc',
        icon: '🌌'
    },
    {
        id: 'fire',
        name: '烈焰战场',
        description: '炫酷的火焰特效场景',
        backgroundUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0237?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(255,69,0,0.4) 0%, rgba(255,165,0,0.3) 100%)',
        particleColor: '#ef4444',
        icon: '🔥'
    },
    {
        id: 'city',
        name: '都市夜景',
        description: '繁华的城市灯光',
        backgroundUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop',
        overlayGradient: 'linear-gradient(135deg, rgba(30,30,60,0.5) 0%, rgba(0,0,0,0.3) 100%)',
        particleColor: '#60a5fa',
        icon: '🏙'
    }
];

// ====================== Scene Effects ======================
export interface SceneEffect {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
}

export const SCENE_EFFECTS: SceneEffect[] = [
    { id: 'sparkles', name: '璀璨星光', icon: '✨', color: '#FFD700', description: '闪闪发光的星星粒子' },
    { id: 'hearts', name: '爱心飘落', icon: '💕', color: '#ff6b81', description: '浪漫的爱心飘落效果' },
    { id: 'petals', name: '花瓣飞舞', icon: '🌸', color: '#f472b6', description: '粉色花瓣随风飘落' },
    { id: 'neon', name: '霓虹流光', icon: '💡', color: '#a855f7', description: '赛博朋克霓虹灯效果' },
    { id: 'snow', name: '飘雪纷飞', icon: '❄', color: '#e0f2fe', description: '唯美的飘雪效果' },
    { id: 'fire', name: '火焰升腾', icon: '🔥', color: '#ff7675', description: '热烈的火焰粒子' },
    { id: 'bubbles', name: '梦幻气泡', icon: '🫧', color: '#74b9ff', description: '透明的彩色气泡' },
    { id: 'lightning', name: '雷电闪烁', icon: '⚡', color: '#fbbf24', description: '酷炫的闪电特效' },
];

// ====================== Avatar Library (expanded) ======================
export const AVATAR_LIBRARY = [
    // Micah style
    { id: 'av1', name: '元气少女', seed: 'Natsumi', style: 'micah' },
    { id: 'av2', name: '高冷男神', seed: 'Kenji', style: 'micah' },
    { id: 'av3', name: '邻家小妹', seed: 'Sakura', style: 'micah' },
    { id: 'av4', name: '阳光学长', seed: 'Hiro', style: 'micah' },
    // Adventurer style
    { id: 'av5', name: '勇者', seed: 'Hero', style: 'adventurer' },
    { id: 'av6', name: '魔法师', seed: 'Wizard', style: 'adventurer' },
    { id: 'av7', name: '精灵', seed: 'Elf', style: 'adventurer' },
    // Bottts style
    { id: 'av8', name: 'AI助手', seed: 'Assistant', style: 'bottts' },
    { id: 'av9', name: '机甲战士', seed: 'Mecha', style: 'bottts' },
    { id: 'av10', name: '智能管家', seed: 'Butler', style: 'bottts' },
    // Fun emoji style
    { id: 'av11', name: '快乐达人', seed: 'Happy', style: 'fun-emoji' },
    { id: 'av12', name: '酷炫潮人', seed: 'Cool', style: 'fun-emoji' },
    // Lorelei style
    { id: 'av13', name: '森林仙子', seed: 'Fairy', style: 'lorelei' },
    { id: 'av14', name: '月光精灵', seed: 'Moon', style: 'lorelei' },
    // Pixel art
    { id: 'av15', name: '像素英雄', seed: 'PixelHero', style: 'pixel-art' },
    { id: 'av16', name: '游戏角色', seed: 'Gamer', style: 'pixel-art' },
];

export const COLORS = [
    { id: 'c1', hex: '#FFADAD' },
    { id: 'c2', hex: '#FFD6A5' },
    { id: 'c3', hex: '#FDFFB6' },
    { id: 'c4', hex: '#CAFFBF' },
    { id: 'c5', hex: '#9BF6FF' },
    { id: 'c6', hex: '#A0C4FF' },
    { id: 'c7', hex: '#BDB2FF' },
    { id: 'c8', hex: '#333333' },
    { id: 'c9', hex: '#F0F0F0' },
    { id: 'c10', hex: '#6D4C41' },
];

export const MOTIONS = [
    { id: 'm1', label: '打招呼', icon: '👋' },
    { id: 'm2', label: '比心', icon: '❤' },
    { id: 'm3', label: '大笑', icon: '😄' },
    { id: 'm4', label: '思考', icon: '🤔' },
    { id: 'm5', label: '跳舞', icon: '💃' },
    { id: 'm6', label: '点赞', icon: '👍' },
    { id: 'm7', label: '害羞', icon: '😳' },
    { id: 'm8', label: '生气', icon: '😤' },
];
