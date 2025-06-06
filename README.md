# Limitless Nutrition Tracker

Extract daily food consumption from Limitless.ai transcripts and generate detailed nutrition logs with macros and calories.

## Features

- 🔗 **Seamless Integration**: Connects directly to your Limitless.ai account
- 📊 **Detailed Nutrition Analysis**: AI-powered extraction of calories, macros, and micronutrients
- ⏰ **Time-based Tracking**: Shows when you consumed each food/drink item
- 💪 **Fitness-focused**: Designed for gym-goers and health enthusiasts
- 📋 **Easy Export**: Copies formatted nutrition log to clipboard for use in any app

## Prerequisites

- A [Limitless.ai](https://limitless.ai) account with a Pendant device
- Recorded lifelogs for the current day
- Limitless.ai API key (see setup instructions below)

## Setup

### 1. Get Your Limitless API Key

1. Open your Limitless Desktop or Web App
2. Navigate to **Developer** settings (this option appears after pairing your Pendant)
3. Click **"Create API Key"** 
4. Copy your API key (it will start with `sk-`)

⚠️ **Security Note**: Never share your API key publicly. It provides access to your personal data.

### 2. Install and Configure

1. Install the extension from the Raycast Store
2. Run the command for the first time - Raycast will prompt you to enter your API key
3. Paste your Limitless API key in the preferences

## Usage

1. Open Raycast (⌘ + Space)
2. Type "Generate Nutrition Log" or "nutrition"
3. Press Enter to run the command
4. The extension will:
   - Fetch your lifelogs from today
   - Analyze them for food/drink consumption
   - Generate a detailed nutrition report
   - Copy the report to your clipboard
5. Paste the nutrition log into your preferred app (Notes, Fabric, etc.)

## What You Get

The generated nutrition log includes:

- **Individual Food Items**: Time, quantity, calories, and macros for each item
- **Daily Totals**: Complete breakdown of calories, protein, carbs, and fats
- **Micronutrients**: Notable vitamins and minerals consumed
- **Fitness Notes**: Hydration status, meal timing insights

## Example Output

```markdown
# Daily Nutrition Log - 2025-01-16

## Individual Items
- **[9:30 AM]** Greek Yogurt (1 cup) - 150 cal | 15g protein | 20g carbs | 0g fat
- **[12:15 PM]** Chicken Breast (6oz) - 280 cal | 52g protein | 0g carbs | 6g fat
- **[7:00 PM]** Brown Rice (1 cup) - 220 cal | 5g protein | 45g carbs | 2g fat

## Daily Summary
| Nutrient | Total |
|----------|-------|
| Calories | 1,650 |
| Protein  | 125g  |
| Carbs    | 180g  |
| Fat      | 45g   |
```

## Troubleshooting

### "No Lifelogs Found"
- Ensure your Pendant is paired and recording
- Check that you have recorded audio today
- Verify your timezone settings

### "Invalid API Key"
- Double-check your API key in Raycast preferences
- Ensure you copied the complete key including the `sk-` prefix
- Try regenerating your API key from Limitless settings

### "API Endpoint Not Found"
- Confirm you have a Limitless Pendant (API currently only supports Pendant data)
- Ensure your Limitless account is active

## Privacy & Security

- Your API key is stored securely in Raycast preferences
- All data processing happens locally and through official Limitless.ai APIs
- No data is stored or transmitted to third parties
- AI processing is handled by Raycast's AI service

### 🔐 API Key Security Best Practices

**Important Security Guidelines:**

1. **Never commit API keys to version control**
   - Your Limitless API key should only be stored in Raycast preferences
   - Never create `.env` files or config files containing your API key
   - If you accidentally commit an API key, regenerate it immediately

2. **Keep your API key private**
   - Never share your API key in screenshots, logs, or documentation
   - Don't paste your API key in public forums or chat channels
   - Each API key is personal and tied to your Limitless account

3. **Rotate your API keys regularly**
   - Consider regenerating your API key periodically
   - If you suspect your key has been compromised, regenerate immediately
   - You can manage your API keys in the Limitless Developer settings

4. **Monitor your API usage**
   - Check your Limitless dashboard for unexpected API usage
   - Report any suspicious activity to Limitless support

⚠️ **If you believe your API key has been compromised:**
1. Go to your Limitless Developer settings
2. Regenerate your API key immediately
3. Update the key in your Raycast preferences
4. Monitor your account for any unauthorized usage

## Support

For issues with:
- **This extension**: Create an issue on GitHub or reach out via Raycast Community
- **Limitless.ai API**: Contact Limitless support or check their developer documentation
- **API access**: Visit the Limitless Developer Platform

## License

MIT  