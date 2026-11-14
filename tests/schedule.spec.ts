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
  await expect(
    page.getByRole("toolbar", { name: "Действия с выделенными ячейками" }),
  ).toHaveCount(0);
  await cells.nth(0).click();
  await cells.nth(1).click();
  await page.getByRole("button", { name: "Изменить", exact: true }).click();
  await expect(page.getByLabel("Начало смены", { exact: true })).toHaveValue(
    "22:00",
  );
  await page.getByLabel("Конец смены", { exact: true }).fill("07:00");
  await apply.click();
  await expect(cells.nth(0)).toContainText("9 ч");
  await expect(cells.nth(1)).toContainText("22 – 07");
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

test("плашка считает выделение, применяет шаблон, очищает и снимает выделение", async ({
  page,
}) => {
  await page.goto("/schedules/current");
  const cells = page.locator(".cell");
  const toolbar = page.getByRole("toolbar", {
    name: "Действия с выделенными ячейками",
  });
  await cells.nth(0).click();
  await cells.nth(1).click();
  await cells.nth(7).click();
  await cells.nth(8).click();
  await expect(toolbar).toContainText("4 ячеек");
  await expect(toolbar).toContainText("2 сотрудника(-ов) · 2 дн.");
  await expect(page.getByLabel("Поиск по ФИО")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Неделя", exact: true }),
  ).toHaveCount(0);
  await expect(toolbar.getByRole("button", { name: "Изменить" })).toHaveCount(
    0,
  );
  await toolbar.getByRole("button", { name: "Применить шаблон" }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Вечер/ }).click();
  await expect(page.locator(".cell.evening")).toHaveCount(4);
  await expect(cells.nth(0).locator(".cell-time")).toHaveText("15 – 23");
  await expect(cells.nth(0).locator("small")).toHaveText("8 ч");
  await expect(toolbar).toHaveCount(0);
  await expect(page.locator("tfoot .covered")).toHaveCount(2);
  await cells.nth(0).click();
  await cells.nth(1).click();
  await cells.nth(7).click();
  await cells.nth(8).click();
  await toolbar.getByRole("button", { name: "Очистить", exact: true }).click();
  await expect(page.locator(".cell.evening")).toHaveCount(0);
  await expect(page.locator(".cell.selected")).toHaveCount(4);
  await expect(page.locator("tfoot .covered")).toHaveCount(0);
  await toolbar.getByRole("button", { name: "Снять", exact: true }).click();
  await expect(page.locator(".cell.selected")).toHaveCount(0);
  await expect(toolbar).toHaveCount(0);
  await expect(page.getByLabel("Поиск по ФИО")).toBeVisible();
});

test("месячное выделение и изменение используют ту же плашку и сохраняют смены", async ({
  page,
}) => {
  await page.goto("/schedules/current");
  await page.getByRole("button", { name: "Месяц", exact: true }).click();
  const cells = page.locator(".cell");
  await cells.nth(0).click();
  await cells.nth(2).click({ modifiers: ["Shift"] });
  await expect(page.locator(".cell.selected")).toHaveCount(3);
  await page.locator(".templates-panel .template.day").click();
  await expect(page.locator(".cell.day")).toHaveCount(3);
  await expect(cells.nth(0).locator("strong")).toHaveText("8 ч");
  await expect(cells.nth(0).locator(".cell-time")).toHaveCount(0);
  await cells.nth(0).click();
  await cells.nth(1).click();
  await page.getByRole("button", { name: "Изменить", exact: true }).click();
  await expect(page.getByLabel("Начало смены", { exact: true })).toBeFocused();
  await page.getByLabel("Начало смены", { exact: true }).fill("10:00");
  await page.getByLabel("Конец смены", { exact: true }).fill("23:00");
  await page.getByRole("button", { name: "Поставить в выделенные" }).click();
  await expect(page.locator(".cell.custom")).toHaveCount(2);
  await expect(cells.nth(0)).toHaveText("13 ч");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Сохранить", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await page.getByRole("button", { name: "Месяц", exact: true }).click();
  await expect(page.locator(".cell.custom")).toHaveCount(2);
});

test("шаблоны перетаскиваются повторно, навигация возвращает прежние смены", async ({
  page,
}) => {
  await page.goto("/schedules/current");
  const cells = page.locator(".cell");
  const firstDate = await page
    .locator("thead button")
    .first()
    .getAttribute("aria-label");
  for (const [index, kind] of ["morning", "day", "evening"].entries()) {
    await page
      .locator(`.templates-panel .template.${kind}`)
      .dragTo(cells.nth(index));
    await page
      .locator(`.templates-panel .template.${kind}`)
      .dragTo(cells.nth(index + 7));
    await expect(page.locator(`.cell.${kind}`)).toHaveCount(2);
  }
  await page.getByRole("button", { name: "Следующий период" }).click();
  await expect(page.locator("thead button").first()).not.toHaveAttribute(
    "aria-label",
    firstDate!,
  );
  await expect(page.locator(".cell.morning")).toHaveCount(0);
  await page.getByRole("button", { name: "Предыдущий период" }).click();
  await expect(page.locator(".cell.morning")).toHaveCount(2);
  await page.getByLabel("Поиск по ФИО").fill("неизвестный");
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await page.getByRole("button", { name: "Очистить поиск" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
});
