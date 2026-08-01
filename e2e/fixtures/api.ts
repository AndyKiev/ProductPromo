import { Page } from "@playwright/test";
import { getAccessToken, login } from "./auth";

function apiUrl(page: Page, path: string): string {
  const backendUrl = page.context().browser() as any;
  // Use the test config metadata for backend URL
  return path;
}

interface Market {
  id: number;
  name: string;
}

interface Segment {
  id: number;
  status_id: number;
  market_id: number;
  code: string;
  name: string;
}

interface Category {
  id: number;
  status_id: number;
  segment_id: number;
  code: string;
  name: string;
}

interface Family {
  id: number;
  status_id: number;
  category_id: number;
  code: string;
  name: string;
}

interface NomenclatureKey {
  id: number;
  name: string;
}

interface Nomenclature {
  id: number;
  market_id: number;
  segment_id: number;
  category_id: number;
  family_id: number;
}

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8012";
const API = `${BACKEND}/api/v1`;

export async function apiRequest(page: Page, method: string, path: string, body?: any) {
  const token = await getAccessToken(page);
  const options: any = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
    },
  };
  if (body !== undefined) {
    options.data = JSON.stringify(body);
  }
  return page.request.fetch(`${API}${path}`, options);
}

// --- Markets ---

export async function createMarket(page: Page, name: string): Promise<Market> {
  const res = await apiRequest(page, "POST", "/nomenclature/markets", { name });
  const json = await res.json();
  if (!res.ok()) throw new Error(`createMarket failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteMarket(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/markets/${id}`);
}

// --- Segments ---

export async function createSegment(page: Page, data: {
  market_id: number;
  status_id: number;
  code: string;
  name: string;
}): Promise<Segment> {
  const res = await apiRequest(page, "POST", "/nomenclature/segments", data);
  const json = await res.json();
  if (!res.ok()) throw new Error(`createSegment failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteSegment(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/segments/${id}`);
}

// --- Categories ---

export async function createCategory(page: Page, data: {
  segment_id: number;
  status_id: number;
  code: string;
  name: string;
}): Promise<Category> {
  const res = await apiRequest(page, "POST", "/nomenclature/categories", data);
  const json = await res.json();
  if (!res.ok()) throw new Error(`createCategory failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteCategory(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/categories/${id}`);
}

// --- Families ---

export async function createFamily(page: Page, data: {
  category_id: number;
  status_id: number;
  code: string;
  name: string;
}): Promise<Family> {
  const res = await apiRequest(page, "POST", "/nomenclature/families", data);
  const json = await res.json();
  if (!res.ok()) throw new Error(`createFamily failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteFamily(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/families/${id}`);
}

// --- Keys ---

export async function createKey(page: Page, name: string): Promise<NomenclatureKey> {
  const res = await apiRequest(page, "POST", "/nomenclature/keys", { name });
  const json = await res.json();
  if (!res.ok()) throw new Error(`createKey failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteKey(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/keys/${id}`);
}

// --- Links ---

export async function createLink(page: Page, data: {
  market_id: number;
  segment_id: number;
  category_id: number;
  family_id: number;
}): Promise<Nomenclature> {
  const res = await apiRequest(page, "POST", "/nomenclature/links", data);
  const json = await res.json();
  if (!res.ok()) throw new Error(`createLink failed: ${JSON.stringify(json)}`);
  return json.data;
}

export async function deleteLink(page: Page, id: number) {
  await apiRequest(page, "DELETE", `/nomenclature/links/${id}`);
}

// --- Seed helpers for hierarchical tests ---

export async function seedHierarchy(page: Page) {
  const market = await createMarket(page, `e2e-market-${Date.now()}`);
  const segment = await createSegment(page, {
    market_id: market.id,
    status_id: 1,
    code: "E2E",
    name: `e2e-segment-${Date.now()}`,
  });
  const category = await createCategory(page, {
    segment_id: segment.id,
    status_id: 1,
    code: "E2E",
    name: `e2e-category-${Date.now()}`,
  });
  const family = await createFamily(page, {
    category_id: category.id,
    status_id: 1,
    code: "E2E",
    name: `e2e-family-${Date.now()}`,
  });
  return { market, segment, category, family };
}

export async function cleanupHierarchy(page: Page, data: {
  market: Market;
  segment: Segment;
  category: Category;
  family: Family;
}) {
  await deleteFamily(page, data.family.id);
  await deleteCategory(page, data.category.id);
  await deleteSegment(page, data.segment.id);
  await deleteMarket(page, data.market.id);
}
