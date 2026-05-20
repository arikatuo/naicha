# Milk Tea Calorie Mini Program Design

## Summary

Build a native WeChat mini program that helps users estimate the calories in a milk tea order and understand the result through playful food and exercise equivalents. The first version is a fun estimation tool, not a health advice product.

The first version focuses on:

- Brand-first popular drink selection.
- A secondary custom drink builder.
- Local JSON data for brands, drinks, cup sizes, sweetness, toppings, equivalents, and copywriting.
- Calorie estimates based on public information, user-provided reference values, and formula-based estimates.
- A result page with a clear calorie estimate, playful copy, four equivalent cards, and share actions.
- GPT Images generated flat icons for equivalent cards.

The first version does not include login, saved history, search, cloud data management, detailed source display, calorie breakdowns, official brand logos, drink photos, rankings, or low-calorie recommendations.

## Product Goals

1. Let a user complete one estimate in about 30 seconds.
2. Make the result intuitive by comparing calories to familiar foods and exercise time.
3. Encourage sharing through a simple result poster.
4. Cover recognizable popular brands without claiming official brand data.
5. Keep the data model simple enough for fast launch and structured enough for later cleanup.

## Product Positioning

This mini program is a **趣味估算工具**, not a nutrition, weight-loss, medical, or health advice product.

Product language must avoid:

- Claims of official brand accuracy.
- Weight-loss advice.
- Shame-based words such as "罪恶", "发胖", "长肉", or "减肥失败".
- Exercise-as-punishment framing.

Product language should use:

- "约".
- "估算".
- "仅供趣味参考".
- Light playful copy, such as "这杯快乐有点认真。"

## Target Experience

The user opens the mini program and chooses one of two paths:

- **选品牌热门款**: choose a brand, choose one of that brand's popular drinks, adjust cup size, sweetness, and extra toppings, then view the result.
- **自己搭一杯**: assemble a generic drink from base, cup size, sweetness, and toppings, then view the result.

The result page shows:

- Estimated total calories.
- A short playful result title based on calorie range.
- Four fixed equivalents: large fries, fatty pork, rice, and jogging time.
- A button to generate and save a share poster.
- WeChat page sharing with the title "奶茶热量换算器：看看你的奶茶等于什么".
- A button to calculate another drink.

All calorie and exercise values are estimates.

## Scope

### In Scope

- Native WeChat mini program using WXML, WXSS, JavaScript, and JSON.
- Home page with brand-first entry and custom-drink secondary entry.
- Brand list page.
- Brand drink list page.
- Bottom configuration panel for brand drinks.
- Custom drink builder page.
- Result page.
- Share poster generation, preview, and save-to-album action.
- WeChat page sharing from the result page.
- Local JSON datasets.
- Calorie calculation utility.
- Equivalent conversion utility.
- GPT Images generated flat icon assets for equivalents.
- Basic error and empty-state handling.

### Out of Scope for Version 1

- Login or user accounts.
- Saved history.
- Favorites.
- Search.
- Cloud development or remote data editing.
- Admin dashboard.
- Official brand logos.
- Drink photos.
- Detailed data source display.
- Calorie source popups.
- Calorie breakdown by base drink and toppings.
- Rankings or social challenge feeds.
- Low-calorie replacement recommendations.
- Nutrition details beyond estimated calories.
- Fine-grained options such as ice level, temperature, tea strength, milk substitution, syrup type, or custom milk ratio.

## Version Milestones

### Functional MVP

The functional MVP proves the complete product flow with a small sample dataset:

- Home page.
- Brand list.
- Brand drink list.
- Bottom configuration panel.
- Custom drink builder.
- Result page.
- Share poster generation.
- A few sample brands and drinks.

### Release Candidate

The release candidate expands content coverage before public release:

- Target 13 popular brands.
- Target 10 drinks per brand.
- Minimum 8 drinks per brand if quality or reference data is insufficient.
- UI must not promise a fixed number of drinks per brand.

Planned first-batch brands:

- 蜜雪冰城
- 霸王茶姬
- 喜茶
- 奈雪的茶
- 茶百道
- 古茗
- 沪上阿姨
- 书亦烧仙草
- 一点点
- CoCo
- 益禾堂
- 茉莉奶白
- 茶颜悦色

## Pages and Interaction

### Home Page

Purpose: get the user into calculation quickly.

Content:

- App name: "奶茶热量换算器" for now.
- Short friendly subtitle.
- Primary entry: "选品牌热门款".
- Secondary entry: "自己搭一杯".
- Light disclaimer: "热量为估算值，仅供趣味参考".

The name is temporary. Before launch, run a separate naming brainstorm.

### Brand List Page

Purpose: let users choose a recognizable brand.

Rules:

- Brands are loaded from local JSON.
- No search in version 1.
- No official logos.
- Brand cards use text and simple visual treatment only.
- Brand order is manually sorted by familiarity and product coverage, not alphabetically.
- Show a visible disclaimer: "热量为估算值，非品牌官方数据，仅供趣味参考。"

### Brand Drink List Page

Purpose: let users choose a popular drink under the selected brand.

Rules:

- Drinks are loaded from local JSON.
- Each brand targets 10 drinks, with a minimum of 8 for release candidate.
- No search in version 1.
- No drink photos.
- Drink cards do not show kcal values.
- Drink cards may show neutral tags such as "奶盖", "水果", "厚乳", "小料多", "清爽款", or "经典款".
- Do not use labels such as "高热量预警", "罪恶", "发胖", "长肉", or "减肥失败".
- Drink names may use recognizable user-facing names, but should not include official promotional claims, official endorsement language, trademark symbols, logos, or images.

When a user taps a drink, a bottom configuration panel opens.

### Brand Drink Configuration Panel

Purpose: keep the brand path fast while still allowing common point-of-order changes.

Configuration rules:

- Use a bottom sheet instead of a separate adjustment page.
- Show selected drink name.
- Show read-only default toppings if the drink includes them, for example "本身含有：珍珠、奶盖".
- Default toppings cannot be removed.
- Allow extra toppings, up to 3.
- If the user exceeds the extra topping limit, show a light toast: "这杯已经很有料啦，最多加 3 种".
- Show sweetness selection only when `sweetnessAdjustable` is true.
- Default the sweetness selection to the drink's `defaultSweetness`.
- Show cup size selection only when the drink has more than one available size.
- Default the cup size selection to the drink's `defaultSize`.
- Do not show the calculated calorie number in the panel.
- Primary action: "看看等于什么".

### Custom Drink Page

Purpose: let users build a generic drink without choosing a brand.

Input groups:

- Base: tea, milk tea, latte, fruit tea, coconut milk, cheese tea, etc.
- Cup size.
- Sweetness.
- Toppings, up to 4.

Rules:

- Custom drink does not require a brand.
- Use a full page rather than a bottom panel.
- Do not show the calculated calorie number before the result page.
- If the user exceeds the topping limit, show a light toast: "先到这里吧，最多选 4 种小料".
- Primary action: "看看等于什么".

### Result Page

Purpose: turn the calorie estimate into a memorable comparison.

Content:

- Playful result title based on calorie range.
- Estimated calories, prominently shown.
- "估算" label near the calorie number.
- Selected drink summary.
- Four equivalent cards:
  - 大薯
  - 肥肉
  - 米饭
  - 慢跑
- Share poster button.
- Recalculate button.

Rules:

- Do not show detailed source labels.
- Do not show calorie breakdown by base drink and toppings.
- Do not show low-calorie replacement suggestions in version 1.
- Keep the tone playful and non-judgmental.
- Show a visible note that calories and exercise time are estimates.

Example equivalent cards:

- 约 1.6 包大薯
- 约 60g 肥肉
- 约 2.3 碗米饭
- 约慢跑 45 分钟消耗

### Share Poster

Purpose: create a simple image suitable for WeChat sharing.

Poster content:

- App name.
- Drink name or custom combination summary.
- Estimated calories.
- Four fixed equivalent items with icons:
  - Large fries.
  - Fatty pork.
  - Rice.
  - Jogging.
- One playful result title.
- Bottom disclaimer: "热量和运动消耗均为估算，仅供趣味参考".
- Reserved area for a mini program code or QR code.

Share poster rules:

- Use flat icon style.
- Use GPT Images generated original assets.
- Use transparent backgrounds for icons when practical.
- Do not include brand logos or drink photos.
- Do not include text inside the icon images.
- Reuse the same equivalent icons on the result page and poster.
- Before an official mini program code is available, render a neutral "coming soon" block in the reserved QR area.

The result page should also support normal WeChat page sharing with the title:

```text
奶茶热量换算器：看看你的奶茶等于什么
```

## Calorie Calculation

### Brand Drink Formula

Brand drink base calories should prioritize reference values.

```text
totalCalories = adjustedBaseCalories + extraToppingCalories
```

Where:

```text
adjustedBaseCalories = baseCalories * sizeAdjustment * sweetnessAdjustment
```

Rules:

- `baseCalories` is the default configured drink calorie estimate.
- Public information and user-provided reference values take priority over formula-derived estimates.
- Formula adjustments only modify cup size, sweetness, and extra toppings.
- Default toppings are included in `baseCalories` and cannot be removed by the user.
- Extra toppings are added after base adjustment.
- The final result is rounded to the nearest whole kcal.

### Custom Drink Formula

```text
totalCalories = baseCalories * cupSizeMultiplier * sweetnessMultiplier + toppingCalories
```

Rules:

- `baseCalories` comes from the selected generic base.
- `cupSizeMultiplier` adjusts volume.
- `sweetnessMultiplier` estimates sugar impact.
- `toppingCalories` is the sum of selected toppings.
- The final result is rounded to the nearest whole kcal.

### Sweetness Adjustment

Sweetness is not one-size-fits-all. Brand drinks may define:

- `defaultSweetness`.
- `sweetnessAdjustable`.
- `sweetnessCalorieImpact`: `low`, `medium`, or `high`.

If `sweetnessAdjustable` is false, the UI should not show sweetness selection.

If sweetness is adjustable, the calculation should use impact-specific adjustment factors. Version 1 can keep the factors simple while preserving the impact field for future tuning.

Initial global sweetness levels:

- No sugar.
- 30% sugar.
- 50% sugar.
- 70% sugar.
- Full sugar.

### Cup Size Adjustment

Cup size defaults are global, but each drink may override available sizes and multipliers.

Default cup size multipliers:

- Medium: `1.0`
- Large: `1.25`

Rules:

- If a drink defines `availableSizes`, show only those sizes.
- If a drink has only one available size, do not show a size switcher.
- If no drink-level size configuration exists, use global defaults.

## Equivalent Calculation

The result page and poster always show four equivalent categories:

1. Large fries.
2. Fatty pork.
3. Rice.
4. Jogging time.

Display formatting should optimize readability:

- Count-based items use one decimal place, such as `1.6 包大薯`.
- Gram-based items round to a readable 5g or 10g interval, such as `60g 肥肉`.
- Rice can use bowl-based display, such as `2.3 碗米饭`.
- Jogging time rounds to 5-minute intervals, such as `45 分钟`.
- Very small equivalent values should be hidden or replaced with a friendlier fallback if they look awkward.

Sport equivalent wording must include "约" and should be phrased as estimated consumption, not advice.

## Result Copy and Visual Tone

Result titles should vary by calorie range. Example ranges:

- Lower range: "这杯快乐还算克制。"
- Middle range: "这杯快乐有点认真。"
- Higher range: "快乐开始有分量了。"
- Very high range: "这杯可以算正餐嘉宾了。"

Exact thresholds can be tuned during implementation.

Color themes may shift by calorie range, but must avoid warning-style red. Use food-inspired tones such as fresh, milk tea, warm orange, or cocoa.

## Local Data Model

All version 1 data lives in local JSON files. Use the fastest minimal configuration that supports launch; do not build a complex configuration system.

Suggested datasets:

- `brands.json`
- `brand-drinks.json`
- `bases.json`
- `cup-sizes.json`
- `sweetness-levels.json`
- `toppings.json`
- `equivalents.json`
- `copywriting.json`

Example brand fields:

```json
{
  "id": "mixue",
  "name": "蜜雪冰城",
  "sort": 1
}
```

Example brand drink fields:

```json
{
  "id": "mixue-pearl-milk-tea",
  "brandId": "mixue",
  "displayName": "珍珠奶茶",
  "aliasName": "",
  "baseCalories": 420,
  "defaultSize": "medium",
  "availableSizes": ["medium", "large"],
  "defaultSweetness": "normal",
  "sweetnessAdjustable": true,
  "sweetnessCalorieImpact": "medium",
  "defaultToppingIds": ["pearl"],
  "tagIds": ["classic", "milk-tea"],
  "sourceType": "user_reference",
  "sourceNote": "用户提供参考值"
}
```

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
  "precision": 1,
  "icon": "/assets/icons/fries.png"
}
```

### Data Source Strategy

Use public information plus user-provided reference values, then estimate missing entries.

Data source types:

- `official`: official or brand-published nutrition value.
- `public_reference`: public third-party or menu reference.
- `user_reference`: user-provided reference value.
- `estimated`: formula or similar-product estimate.

User-facing pages do not show data source type in version 1. The fields exist to support internal quality tracking and future improvements.

If a brand drink lacks a reference value, it may still ship as `estimated`. Coverage should not block the functional MVP.

User-provided data can be supplied in either full table form:

```text
品牌 | 饮品名 | 默认杯型 | 默认甜度 | 默认小料 | 参考热量kcal | 来源备注
蜜雪冰城 | 珍珠奶茶 | 中杯 | 正常糖 | 珍珠 | 420 | 用户提供参考值
```

Or simplified form:

```text
蜜雪冰城 珍珠奶茶 420kcal
喜茶 多肉葡萄 520kcal
```

## Error Handling

- If required selections are missing, disable the calculate button or show a short inline prompt.
- If local data fails to load, show a friendly retry state.
- If poster generation fails, keep the result page usable and show a short error message.
- If a user exceeds topping limits, block the new selection and show a toast.
- If a calculated value is unusually low or high, still show the estimate but keep the "估算" label visible.

## Testing Strategy

Manual testing should cover:

- Home entry to brand flow.
- Home entry to custom drink flow.
- Brand list loads from local JSON.
- Brand drink list loads from local JSON.
- Brand drink bottom panel opens and closes correctly.
- Brand default toppings display as read-only.
- Brand extra topping limit blocks the fourth extra topping.
- Custom drink topping limit blocks the fifth topping.
- Sweetness selection hides when a drink is not sweetness-adjustable.
- Cup size selection hides when only one size is available.
- Calories do not appear before the result page.
- Result page shows total calories and four equivalent cards.
- Equivalent icons appear on result page and share poster.
- Share poster renders calories, equivalent values, icons, playful copy, and disclaimer.
- Save-to-album flow works.
- Result page WeChat share title is correct.
- Missing selections cannot produce an invalid result.

Utility tests should cover:

- Brand drink calorie formula.
- Custom drink calorie formula.
- Reference-value priority for brand drinks.
- Size adjustment.
- Sweetness impact adjustment.
- Extra topping summation.
- Default topping inclusion in brand base calories.
- Equivalent conversion for count-based foods.
- Equivalent conversion for gram-based foods.
- Equivalent conversion for jogging time.
- Readable rounding rules.

## Future Plans

Possible follow-up features:

- Recently calculated drinks stored locally.
- Search by brand or drink name.
- More complete brand and product datasets.
- Cloud-hosted data for easier updates.
- Data source display or source-detail popup.
- Lower-calorie alternative suggestions.
- Favorites.
- Rankings or playful challenge pages.
- More equivalent categories, such as eggs, toast, fried chicken, or desserts.
- More polished custom illustration set.
- Product naming brainstorm before launch.

## Decisions

- Use native WeChat mini program for version 1.
- Use local JSON instead of cloud data.
- Product name is temporarily "奶茶热量换算器"; revisit naming before launch.
- Treat the product as a fun estimation tool, not health advice.
- Make brand popular drinks the primary path.
- Keep custom drink builder as a secondary path.
- Include 13 planned popular brands for release candidate content coverage.
- Target 10 drinks per brand, with 8 as the minimum acceptable release-candidate count.
- Use public information, user-provided reference values, and estimates to populate drink calories.
- Reference values take priority over formula estimates for brand drink `baseCalories`.
- Keep source fields internally, but do not display source labels in version 1.
- Do not show calorie breakdowns in version 1.
- Do not show search in version 1.
- Do not use official brand logos or drink photos.
- Brand default toppings cannot be removed; only extra toppings can be added.
- Limit brand extra toppings to 3.
- Limit custom drink toppings to 4.
- Do not show calculated calories before the result page.
- Use a bottom configuration panel for brand drinks.
- Use a full page for custom drink configuration.
- Result page and share poster always show large fries, fatty pork, rice, and jogging equivalents.
- Use GPT Images generated flat icons for equivalent visuals.
- Support WeChat page sharing and poster save-to-album.
- Do not save user history in version 1.
