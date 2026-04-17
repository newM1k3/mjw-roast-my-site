import PocketBase from 'pocketbase';

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://mjwdesign-core.pockethost.io');

pb.autoCancellation(false);
