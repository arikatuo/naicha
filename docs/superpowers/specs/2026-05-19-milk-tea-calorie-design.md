# Milk Tea Calorie Mini Program Design

## Summary

Build a native WeChat mini program that helps users estimate the calories in a customized milk tea order and understand the result through playful food equivalents. The experience should feel light, visual, and shareable rather than medical or diet-focused.

The first version focuses on:

- Popular milk tea presets plus a custom drink builder.
- Local JSON data for drinks, ingredients, sweetness, cup sizes, and equivalents.
- A calorie result page with clear numbers and mild playful commentary.
- A generated share poster.

The first version does not include login, user history, cloud data management, brand-specific precision, or rankings.

## Product Goals

1. Let a user estimate a milk tea order in under one minute.
2. Make the calorie result intuitive by comparing it to familiar foods.
3. Encourage sharing through a simple result poster.
4. Keep the data model portable so local JSON can later migrate to cloud storage.

## Target Experience

The user opens the mini program and chooses one of two paths:

- **Popular milk tea**: choose a common drink type, adjust cup size, sweetness, and toppings, then calculate.
- **Custom drink**: assemble a drink from base, cup size, sweetness, and toppings, then calculate.

The result page shows:

- Estimated total calories.
- A short playful line, such as "这杯快乐有点认真。"
- Several equivalent foods, such as fries, fatty pork, rice, eggs, or toast.
- A button to generate a share poster.
- A button to calculate another drink.

All calorie values are shown as estimates.

## Scope

### In Scope

- Native WeChat mini program using WXML, WXSS, JavaScript, and JSON.
- Home page with two entry points.
- Popular milk tea selection page.
- Custom drink builder page.
- Result page.
- Share poster generation and preview.
- Local JSON datasets.
- Calorie calculation utility.
- Equivalent food calculation utility.
- Basic error and empty-state handling.

### Out of Scope for Version 1

- Login or user accounts.
- Saved history.
- Favorites.
- Brand-specific product database.
- Cloud development or remote data editing.
- Admin dashboard.
- Rankings or social challenge feeds.
- Nutrition details beyond estimated calories.

## Pages

### Home Page

Purpose: get the user into calculation quickly.

Content:

- App name.
- Short friendly subtitle.
- Primary entry: Popular Milk Tea.
- Secondary entry: Custom Drink.

The home page should not contain long explanations. The main action is choosing a path.

### Popular Milk Tea Page

Purpose: let users start from familiar drink types.

Initial popular drink list should contain 8-12 generic items, for example:

- 珍珠奶茶
- 芋泥波波
- 杨枝甘露
- 奶盖茶
- 椰椰拿铁
- 黑糖波波奶茶
- 水果茶
- 抹茶拿铁

Each item has:

- Display name.
- Base calories for a medium cup at default sweetness.
- Default toppings, if any.
- Optional tags such as "奶盖", "水果", or "高热量".

After selecting a drink, the user can adjust:

- Cup size.
- Sweetness.
- Toppings.

The page shows an estimated calorie preview before calculation.

### Custom Drink Page

Purpose: let users build their own milk tea combination.

Input groups:

- Base: tea, milk tea, latte, fruit tea, coconut milk, cheese tea, etc.
- Cup size: medium and large.
- Sweetness: no sugar, 30%, 50%, 70%, full sugar.
- Toppings: multi-select.

The page should show a running estimated calorie preview and a main action button: "看看等于什么".

### Result Page

Purpose: turn the calorie number into a memorable comparison.

Content:

- Playful result title.
- Estimated calories, prominently shown.
- Selected drink summary.
- Equivalent food cards.
- Share poster button.
- Recalculate button.

Example equivalent cards:

- 约 1.6 包大薯
- 约 60g 肥肉
- 约 420g 米饭
- 约 3 个鸡蛋
- 约慢跑 45 分钟

The page should avoid shame-based wording. The tone is "friendly reality check", not dieting pressure.

### Share Poster

Purpose: create a simple image suitable for WeChat sharing.

Poster content:

- App name.
- Drink name or custom combination summary.
- Estimated calories.
- Two or three strongest equivalents.
- One playful line.
- Reserved area for a mini program code or QR code.

The first version can use a fixed poster layout. Before an official mini program code is available, the reserved area should render a neutral "coming soon" block.

## Calorie Calculation

### Popular Drink Formula

```text
totalCalories = baseCalories * cupSizeMultiplier * sweetnessMultiplier + toppingCalories
```

### Custom Drink Formula

```text
totalCalories = baseCalories * cupSizeMultiplier * sweetnessMultiplier + toppingCalories
```

For both flows:

- `baseCalories` comes from either the selected popular drink or custom base.
- `cupSizeMultiplier` adjusts volume.
- `sweetnessMultiplier` estimates sugar impact.
- `toppingCalories` is the sum of selected toppings.
- The result is rounded to the nearest whole kcal.

### Initial Multipliers

Cup size:

- Medium: `1.0`
- Large: `1.25`

Sweetness:

- No sugar: `0.85`
- 30% sugar: `0.9`
- 50% sugar: `1.0`
- 70% sugar: `1.08`
- Full sugar: `1.15`

These are estimation values, not brand-certified values.

## Local Data Model

All version 1 data lives in local JSON files.

Suggested datasets:

- `popular-drinks.json`
- `bases.json`
- `cup-sizes.json`
- `sweetness-levels.json`
- `toppings.json`
- `equivalents.json`
- `copywriting.json`

Example topping fields:

```json
{
  "id": "pearl",
  "name": "珍珠",
  "calories": 120
}
```

Example equivalent fields:

```json
{
  "id": "fries",
  "name": "大薯",
  "unit": "包",
  "caloriesPerUnit": 312,
  "precision": 1
}
```

Equivalent calculations:

```text
equivalentAmount = totalCalories / caloriesPerUnit
```

For gram-based items, store calories per 100g and calculate grams:

```text
grams = totalCalories / caloriesPer100g * 100
```

## Error Handling

- If required selections are missing, disable the calculate button or show a short inline prompt.
- If local data fails to load, show a friendly retry state.
- If poster generation fails, keep the result page usable and show a short error message.
- If a calculated value is unusually low or high, still show the estimate but keep the "估算" label visible.

## Testing Strategy

Manual testing should cover:

- Home entry to popular drink calculation.
- Home entry to custom drink calculation.
- Cup size changes affect calories.
- Sweetness changes affect calories.
- Multiple toppings are summed correctly.
- Equivalent foods update correctly.
- Result page can recalculate another drink.
- Share poster renders with calories and equivalents.
- Missing selections cannot produce an invalid result.

Utility tests should cover:

- Popular drink calorie formula.
- Custom drink calorie formula.
- Topping summation.
- Equivalent conversion for count-based foods.
- Equivalent conversion for gram-based foods.
- Rounding rules.

## Future Plans

Possible follow-up features:

- Recently calculated drinks stored locally.
- Brand and product-specific datasets.
- Cloud-hosted data for easier updates.
- Lower-calorie alternative suggestions.
- Favorites.
- Rankings or playful challenge pages.
- More equivalent categories, such as exercise time or snack comparisons.

## Decisions

- Use native WeChat mini program for version 1.
- Use local JSON instead of cloud data.
- Use a hybrid data strategy: generic estimates first, brand-specific data later.
- Include both popular drink and custom drink flows.
- Include a generated share poster in version 1.
- Do not save user history in version 1.
