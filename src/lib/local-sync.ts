/**
 * Lightweight browser-side persistence sync for Vercel serverless /api mode.
 * Ensures newly created/updated/deleted services and bookings persist across
 * separate Vercel serverless containers, page reloads, and logout/login.
 */

const SERVICES_KEY = 'wedplan_synced_services';
const DELETED_SERVICES_KEY = 'wedplan_deleted_service_ids';
const BOOKINGS_KEY = 'wedplan_synced_bookings';

function readList<T = any>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
}

function getCurrentUserClaims(): { id?: string; email?: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const token = localStorage.getItem('wedplan_token');
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function upsertItem(key: string, item: any) {
  if (!item) return;
  const id = item._id || item.id;
  if (!id) return;
  const list = readList(key);
  const idx = list.findIndex((x: any) => x._id === id || x.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...item };
  } else {
    list.unshift(item);
  }
  writeList(key, list);
}

export function recordSyncAfterResponse(method: string, endpoint: string, data: any) {
  if (typeof window === 'undefined' || !data?.success) return;

  // Services mutations
  if (method === 'POST' && endpoint === '/services' && data.service) {
    upsertItem(SERVICES_KEY, data.service);
    return;
  }

  if (
    (method === 'PUT' && /^\/services\/[^/]+$/.test(endpoint)) ||
    (method === 'PATCH' && /^\/services\/[^/]+\/toggle-active$/.test(endpoint)) ||
    (method === 'PATCH' && /^\/admin\/services\/[^/]+\/status$/.test(endpoint))
  ) {
    if (data.service) {
      upsertItem(SERVICES_KEY, data.service);
    }
    return;
  }

  if (
    method === 'DELETE' &&
    (/^\/services\/[^/]+$/.test(endpoint) || /^\/admin\/services\/[^/]+$/.test(endpoint))
  ) {
    const id = endpoint.split('/').pop()!;
    const services = readList(SERVICES_KEY).filter((s: any) => s._id !== id && s.id !== id);
    writeList(SERVICES_KEY, services);
    const deleted = readList<string>(DELETED_SERVICES_KEY);
    if (!deleted.includes(id)) {
      deleted.push(id);
      writeList(DELETED_SERVICES_KEY, deleted);
    }
    return;
  }

  // Bookings mutations
  if (method === 'POST' && endpoint === '/bookings' && data.booking) {
    upsertItem(BOOKINGS_KEY, data.booking);
    return;
  }

  if (
    method === 'PATCH' &&
    (/^\/bookings\/[^/]+\/cancel$/.test(endpoint) || /^\/bookings\/[^/]+\/status$/.test(endpoint))
  ) {
    if (data.booking) {
      upsertItem(BOOKINGS_KEY, data.booking);
    }
  }
}

export function mergeSyncOnResponse(method: string, endpoint: string, data: any): any {
  if (typeof window === 'undefined' || method !== 'GET' || !data?.success) return data;

  const localServices = readList(SERVICES_KEY);
  const deletedIds = new Set(readList<string>(DELETED_SERVICES_KEY));

  // Merge vendor's own services
  if (endpoint === '/services/vendor/my-services' && Array.isArray(data.services)) {
    const claims = getCurrentUserClaims();
    const myLocal = localServices.filter((s: any) => {
      const vId = typeof s.vendorId === 'object' ? s.vendorId?._id || s.vendorId?.id : s.vendorId;
      const vEmail = typeof s.vendorId === 'object' ? s.vendorId?.email : undefined;
      return (
        (claims?.id && vId === claims.id) ||
        (claims?.email && vEmail?.toLowerCase() === claims.email.toLowerCase())
      );
    });

    const merged = mergeById(data.services, myLocal, deletedIds);
    return { ...data, services: merged };
  }

  // Merge admin services list
  if (endpoint.startsWith('/admin/services') && Array.isArray(data.services)) {
    const merged = mergeById(data.services, localServices, deletedIds);
    return { ...data, services: merged, total: merged.length };
  }

  // Merge public services list (approved & active only)
  if ((endpoint === '/services' || endpoint.startsWith('/services?')) && Array.isArray(data.services)) {
    const approvedLocal = localServices.filter(
      (s: any) => s.status === 'approved' && s.isActive
    );
    const merged = mergeById(data.services, approvedLocal, deletedIds);
    return { ...data, services: merged, total: merged.length };
  }

  // Merge bookings
  const localBookings = readList(BOOKINGS_KEY);
  if (endpoint === '/bookings/customer' && Array.isArray(data.bookings)) {
    const claims = getCurrentUserClaims();
    const myLocal = localBookings.filter((b: any) => {
      const cId = typeof b.customerId === 'object' ? b.customerId?._id || b.customerId?.id : b.customerId;
      const cEmail = typeof b.customerId === 'object' ? b.customerId?.email : undefined;
      return (
        (claims?.id && cId === claims.id) ||
        (claims?.email && cEmail?.toLowerCase() === claims.email.toLowerCase())
      );
    });
    return { ...data, bookings: mergeById(data.bookings, myLocal, new Set()) };
  }

  if (endpoint === '/bookings/vendor' && Array.isArray(data.bookings)) {
    const claims = getCurrentUserClaims();
    const myLocal = localBookings.filter((b: any) => {
      const vId = typeof b.vendorId === 'object' ? b.vendorId?._id || b.vendorId?.id : b.vendorId;
      const vEmail = typeof b.vendorId === 'object' ? b.vendorId?.email : undefined;
      return (
        (claims?.id && vId === claims.id) ||
        (claims?.email && vEmail?.toLowerCase() === claims.email.toLowerCase())
      );
    });
    return { ...data, bookings: mergeById(data.bookings, myLocal, new Set()) };
  }

  return data;
}

export function fallbackSyncOnNotFound(method: string, endpoint: string, body?: any): any | null {
  if (typeof window === 'undefined') return null;

  // GET /services/:id fallback for newly created services
  if (method === 'GET' && /^\/services\/[^/?]+$/.test(endpoint)) {
    const id = endpoint.split('/').pop()!;
    const found = readList(SERVICES_KEY).find((s: any) => s._id === id || s.id === id);
    if (found) return { success: true, service: found };
  }

  // Mutations on locally synced services when serverless container cold-started
  if (method === 'PUT' && /^\/services\/[^/]+$/.test(endpoint)) {
    const id = endpoint.split('/').pop()!;
    const list = readList(SERVICES_KEY);
    const idx = list.findIndex((s: any) => s._id === id || s.id === id);
    if (idx >= 0) {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body || {};
      list[idx] = { ...list[idx], ...parsed };
      writeList(SERVICES_KEY, list);
      return { success: true, message: 'Service updated.', service: list[idx] };
    }
  }

  if (method === 'PATCH' && /^\/services\/[^/]+\/toggle-active$/.test(endpoint)) {
    const id = endpoint.split('/')[2];
    const list = readList(SERVICES_KEY);
    const idx = list.findIndex((s: any) => s._id === id || s.id === id);
    if (idx >= 0) {
      list[idx].isActive = !list[idx].isActive;
      writeList(SERVICES_KEY, list);
      return { success: true, service: list[idx] };
    }
  }

  if (method === 'PATCH' && /^\/admin\/services\/[^/]+\/status$/.test(endpoint)) {
    const id = endpoint.split('/')[3];
    const list = readList(SERVICES_KEY);
    const idx = list.findIndex((s: any) => s._id === id || s.id === id);
    if (idx >= 0) {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body || {};
      if (parsed.status) list[idx].status = parsed.status;
      if (typeof parsed.isActive === 'boolean') list[idx].isActive = parsed.isActive;
      writeList(SERVICES_KEY, list);
      return { success: true, service: list[idx] };
    }
  }

  if (
    method === 'DELETE' &&
    (/^\/services\/[^/]+$/.test(endpoint) || /^\/admin\/services\/[^/]+$/.test(endpoint))
  ) {
    const id = endpoint.split('/').pop()!;
    const list = readList(SERVICES_KEY);
    const exists = list.some((s: any) => s._id === id || s.id === id);
    if (exists) {
      writeList(SERVICES_KEY, list.filter((s: any) => s._id !== id && s.id !== id));
      return { success: true, message: 'Service deleted.' };
    }
  }

  return null;
}

function mergeById(serverItems: any[], localItems: any[], deletedIds: Set<string>): any[] {
  const map = new Map<string, any>();

  for (const item of serverItems) {
    const id = item._id || item.id;
    if (id && !deletedIds.has(id)) {
      map.set(id, item);
    }
  }

  for (const item of localItems) {
    const id = item._id || item.id;
    if (id && !deletedIds.has(id)) {
      map.set(id, { ...(map.get(id) || {}), ...item });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}
