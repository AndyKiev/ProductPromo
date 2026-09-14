import { test, expect, request as apiRequest } from '@playwright/test';

const api = process.env.BACKEND_URL ?? 'http://127.0.0.1:8012';

test('account language persists, translates all sections and API messages, and recovers on failure', async ({ page, request }) => {
  test.setTimeout(120_000);
  page.setDefaultTimeout(10_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const languages = await (await request.get(`${api}/api/v1/langs`)).json();
  const en = languages.find((l: { short_name: string }) => l.short_name === 'eng');
  const ru = languages.find((l: { short_name: string }) => l.short_name === 'rus');
  expect(en.id).not.toBe(ru.id);
  const auth = await (await request.post(`${api}/api/v1/jwt/login`, {
    form: { username: 'UKR7101004', password: '111' },
  })).json();
  const headers = { Authorization: `Bearer ${auth.access_token}` };
  const original = await (await request.get(`${api}/api/v1/jwt/users/me`, { headers })).json();
  let marketId: number | undefined;
  try {
    await request.patch(`${api}/api/v1/jwt/users/me/language`, { headers, data: { lang_id: en.id } });
    await page.goto('/auth/login');
    await page.getByLabel('Username').fill('UKR7101004');
    await page.getByLabel('Password', { exact: true }).fill('111');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Markets', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Account', exact: true }).click();
    await page.getByRole('combobox', { name: /^Language/ }).click();
    await page.getByRole('option', { name: 'Русский', exact: true }).click();
    await expect(page.getByRole('combobox', { name: /^Язык/ })).toContainText('Русский');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tab', { name: 'Рынки', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Рынки', exact: true })).toBeVisible();
    await expect(page.getByText('Строк на странице:', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Выйти', exact: true }).click();
    await expect(page.getByLabel('Имя пользователя', { exact: true })).toBeVisible();
    await page.getByLabel('Имя пользователя', { exact: true }).fill('UKR7101004');
    await page.getByLabel('Пароль', { exact: true }).fill('111');
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Рынки', exact: true })).toBeVisible();
    const profile = await (await request.get(`${api}/api/v1/jwt/users/me`, { headers })).json();
    expect(profile.lang_id).toBe(ru.id);
    // Stored profile wins over a contradictory request header for authenticated operations.
    const absent = await request.get(`${api}/api/v1/nomenclature/categories/2147483647`, { headers: { ...headers, 'X-Lang-Id': String(en.id) } });
    expect(absent.status()).toBe(404);
    expect(await absent.json()).toMatchObject({ lang_id: ru.id, message_key: 'categoryNotFound', detail: 'Категория с ID 2147483647 не найдена' });
    const invalid = await request.post(`${api}/api/v1/nomenclature/markets`, { headers, data: {} });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).errors[0].msg).toBe('Обязательное поле');
    const badLanguage = await request.patch(`${api}/api/v1/jwt/users/me/language`, { headers, data: { lang_id: 2147483647 } });
    expect(badLanguage.status()).toBe(404);
    expect((await badLanguage.json()).detail).toBe('Язык не найден');
    const name = `i18n_${Date.now()}`;
    const created = await request.post(`${api}/api/v1/nomenclature/markets`, { headers, data: { name } });
    expect(created.status()).toBe(201);
    const body = await created.json(); marketId = body.data.id;
    expect(body).toMatchObject({ message_key: 'marketCreateSuccess', lang_id: ru.id });
    expect(body.detail).toContain('создан'); expect(body.detail).toContain(name);
    const duplicate = await request.post(`${api}/api/v1/nomenclature/markets`, { headers, data: { name } });
    expect((await duplicate.json()).detail).toContain('уже существует');
    await page.getByRole('button', { name: 'Товары', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Типы товара', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Поставщики', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Статусы поставщика', exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/language-russian.png', fullPage: true });
    await page.getByRole('button', { name: 'Аккаунт', exact: true }).click();
    await page.route('**/jwt/users/me/language', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Тестовая ошибка' }) }));
    await page.getByRole('combobox', { name: /^Язык/ }).click();
    await page.getByRole('option', { name: 'English', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Тестовая ошибка');
    await expect(page.getByRole('combobox', { name: /^Язык/ })).toContainText('Русский');
    await page.unroute('**/jwt/users/me/language');
    await page.getByRole('combobox', { name: /^Язык/ }).click();
    await page.getByRole('option', { name: 'English', exact: true }).click();
    await expect(page.getByRole('combobox', { name: /^Language/ })).toContainText('English');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tab', { name: 'Supplier statuses', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    const cleanup = await apiRequest.newContext();
    if (marketId) await cleanup.delete(`${api}/api/v1/nomenclature/markets/${marketId}`, { headers });
    await cleanup.patch(`${api}/api/v1/jwt/users/me/language`, { headers, data: { lang_id: original.lang_id } });
    await cleanup.dispose();
  }
});
