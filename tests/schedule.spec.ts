import { expect, test } from "@playwright/test";

test("своя смена применяется после Escape и к нескольким выбранным ячейкам", async ({
  page,
}) => {
  await page.goto("/schedules/current");
  const cells = page.locator(".cell");
  const apply = page.getByRole("button", { name: "Поставить в выделенные" });
  await expect(apply).toBeDisabled();
  await cells.nth(0).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(apply).toBeEnabled();
  await cells.nth(1).click();
  await expect(page.locator(".cell.selected")).toHaveCount(2);
  await page.getByLabel("Начало смены", { exact: true }).fill("22:00");
  await page.getByLabel("Конец смены", { exact: true }).fill("06:00");
  await apply.click();
  await expect(page.locator(".cell.custom")).toHaveCount(2);
  await expect(cells.nth(0)).toContainText("8 ч");
  await page.getByLabel("Конец смены", { exact: true }).fill("07:00");
  await apply.click();
  await expect(cells.nth(0)).toContainText("9 ч");
  await expect(cells.nth(1)).toContainText("22:00 – 07:00");
  await expect(page.locator("tfoot .covered")).toHaveCount(2);
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Сохранить", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(page.locator(".cell.custom")).toHaveCount(2);
  await expect(cells.nth(0)).toContainText("9 ч");
});

test("навигация работает, черновик сохраняется между страницами, лишних подписей нет", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Главная", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Графики смен", exact: true }).click();
  await page.getByRole("link", { name: "График", exact: true }).click();
  await expect(page).toHaveURL(/\/schedules\/current$/);
  await page.locator(".cell").first().click();
  await page.getByRole("dialog").getByRole("button", { name: /Утро/ }).click();
  await page.getByRole("link", { name: "Главная", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Главная", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(page.locator(".cell.morning")).toHaveCount(1);
  await page.getByRole("link", { name: "Графики смен", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Графики смен", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "График", exact: true }).click();
  for (const copy of [
    "Черновик",
    "Есть несохранённые изменения",
    "Сегодня",
    "Выбрано ячеек:",
    "Выберите ячейки и нажмите",
    "Ctrl / ⌘",
  ]) {
    await expect(page.getByText(copy, { exact: false })).toHaveCount(0);
  }
});

test("дата, перенос, поиск, месяц и удаление используют общие данные", async ({
  page,
}) => {
  await page.goto("/schedules/current");
  await page.locator("thead button").first().click();
  await page.getByRole("dialog").getByRole("button", { name: /День/ }).click();
  await expect(page.locator(".cell.day")).toHaveCount(8);
  await page.locator(".cell").first().dragTo(page.locator(".cell").nth(1));
  await expect(page.locator(".cell").first()).toHaveClass(/empty/);
  await expect(page.locator(".cell").nth(1)).toHaveClass(/day/);
  await page.getByLabel("Поиск по ФИО").fill("Виктория");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Месяц", exact: true }).click();
  const monthLength = await page.locator("thead button").count();
  expect(monthLength).toBeGreaterThanOrEqual(28);
  await page.getByRole("button", { name: "Неделя", exact: true }).click();
  await page.locator(".cell.day").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Удалить смены" })
    .click();
  await expect(page.locator(".cell.day")).toHaveCount(0);
  await expect(page.locator("tfoot .covered").first()).toContainText("6");
});

test("мобильная форма назначает смену без клавиатурных модификаторов", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/schedules/current");
  await page.locator(".cell").first().click();
  await page.getByLabel("Начало смены", { exact: true }).fill("09:30");
  await page.getByRole("button", { name: "Поставить в выделенные" }).click();
  await expect(page.locator(".cell.custom")).toHaveCount(1);
  await expect(page.locator(".cell.custom")).toContainText("7,5 ч");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
