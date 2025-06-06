import {
  Clipboard,
  getPreferenceValues,
  AI,
  showToast,
  Toast,
  List,
  Action,
  ActionPanel,
  Icon,
  Color,
} from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { useState } from "react";

interface Preferences {
  limitlessApiKey: string;
}

interface LifelogContent {
  type: string;
  content: string;
  startTime: string;
  endTime: string;
  startOffsetMs: string;
  endOffsetMs: string;
  children: LifelogContent[];
  speakerName?: string;
  speakerIdentifier?: "user" | null;
}

interface Lifelog {
  id: string;
  title: string;
  markdown: string;
  startTime: string;
  endTime: string;
  contents: LifelogContent[];
}

interface LimitlessResponse {
  data: {
    lifelogs: Lifelog[];
  };
  meta: {
    lifelogs: {
      nextCursor?: string;
      count: number;
    };
  };
}

// Generate the last 30 days for date selection
function generateDateOptions() {
  const dates = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    const isToday = i === 0;
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    dates.push({
      id: dateString,
      dateString,
      displayTitle: isToday ? "Today" : dayName,
      displaySubtitle: formattedDate,
      isToday,
      date,
    });
  }

  return dates;
}

async function generateNutritionLogForDate(selectedDate: string) {
  const { limitlessApiKey } = getPreferenceValues<Preferences>();

  if (!limitlessApiKey) {
    showFailureToast("Limitless API Key is not set in preferences.");
    return;
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0];
  const dateDisplayText = isToday ? "today" : selectedDate;

  await showToast({
    style: Toast.Style.Animated,
    title: "Connecting to Limitless.ai...",
    message: `Fetching data for ${dateDisplayText}`,
  });

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const params = new URLSearchParams({
      date: selectedDate,
      timezone: timezone,
      limit: "10",
      includeMarkdown: "true",
      includeHeadings: "true",
    });

    const response = await fetch(`https://api.limitless.ai/v1/lifelogs?${params}`, {
      method: "GET",
      headers: {
        "X-API-Key": limitlessApiKey,
      },
    });

    if (!response.ok) {
      await response.text(); // Consume the response to avoid memory leaks

      const errorMessage =
        response.status === 401
          ? "Invalid API key. Please check your Limitless API key in preferences."
          : response.status === 404
            ? "API endpoint not found. Please ensure you have a Limitless Pendant and recorded data for the selected date."
            : response.status === 403
              ? "Access forbidden. Please verify your API key has the correct permissions."
              : `HTTP error! Status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const responseText = await response.text();

    let lifelogs: Lifelog[] = [];
    try {
      const jsonResponse = JSON.parse(responseText) as LimitlessResponse;

      if (jsonResponse.data && jsonResponse.data.lifelogs) {
        lifelogs = jsonResponse.data.lifelogs;
      } else {
        throw new Error("Unexpected response structure from API");
      }
    } catch {
      throw new Error("Received invalid JSON response from Limitless.ai API. The API may be temporarily unavailable.");
    }

    if (!lifelogs || lifelogs.length === 0) {
      await showToast({
        style: Toast.Style.Success,
        title: "No Lifelogs Found",
        message: `There were no lifelogs recorded for ${dateDisplayText}.`,
      });
      return;
    }

    await showToast({
      style: Toast.Style.Animated,
      title: `Analyzing Nutrition Data for ${dateDisplayText}...`,
      message: "Using AI to extract food consumption and calculate nutrition.",
    });

    const fullTranscript = lifelogs
      .flatMap((lifelog) => {
        const title = lifelog.title ? `Title: ${lifelog.title}\n` : "";
        const contentItems = lifelog.contents
          .map((content) => {
            const timestamp = content.startTime ? `[${new Date(content.startTime).toLocaleTimeString()}] ` : "";
            const speaker = content.speakerName ? `${content.speakerName}: ` : "";
            return `${timestamp}${speaker}${content.content}`;
          })
          .join("\n");
        return title + contentItems;
      })
      .join("\n\n");

    const aiPrompt = `
      You are an expert nutritionist and fitness coach. I will provide you with a raw transcript from my day.
      Your task is to meticulously extract all mentions of food and drink I consumed, and create a comprehensive nutrition log suitable for someone tracking their fitness and gym performance.

      For each food/drink item, include:
      - Time of consumption
      - Food/drink name and estimated quantity
      - Estimated calories
      - Estimated macronutrients (protein, carbohydrates, fats in grams)
      - Notable micronutrients (vitamins, minerals when significant)

      At the end, provide a daily summary with:
      - Total calories
      - Total protein (g)
      - Total carbohydrates (g) 
      - Total fats (g)
      - Key micronutrients consumed
      - Brief fitness/nutrition notes (hydration, meal timing, etc.)

      Format the output as a clean, readable markdown note with the title "Daily Nutrition Log - ${selectedDate}".
      Use bullet points for individual items and a summary table for totals.
      If quantities aren't specified, make reasonable estimates based on typical serving sizes.
      Discard all non-food related information from the transcript.

      Here is the transcript:
      ---
      ${fullTranscript}
    `;

    const nutritionLog = await AI.ask(aiPrompt);

    if (!nutritionLog) {
      throw new Error("Failed to generate nutrition log from AI analysis");
    }

    await showToast({
      style: Toast.Style.Animated,
      title: "Preparing Nutrition Log...",
      message: `Copying detailed nutrition analysis for ${dateDisplayText} to clipboard.`,
    });

    await Clipboard.paste(nutritionLog);

    await showToast({
      style: Toast.Style.Success,
      title: "Nutrition Log Ready!",
      message: `Complete nutrition analysis for ${dateDisplayText} copied to clipboard.`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    showFailureToast(errorMessage, { title: "Failed to generate nutrition log" });
  }
}

export default function Command() {
  const [dates] = useState(() => generateDateOptions());
  const [searchText, setSearchText] = useState("");

  const filteredDates = dates.filter(
    (date) =>
      date.displayTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      date.displaySubtitle.toLowerCase().includes(searchText.toLowerCase()) ||
      date.dateString.includes(searchText),
  );

  return (
    <List
      navigationTitle="Select Date for Nutrition Analysis"
      searchBarPlaceholder="Search dates or type YYYY-MM-DD..."
      onSearchTextChange={setSearchText}
    >
      <List.Section title="📅 Calendar Date Picker">
        {filteredDates.map((dateOption) => (
          <List.Item
            key={dateOption.id}
            title={dateOption.displayTitle}
            subtitle={dateOption.displaySubtitle}
            icon={{
              source: dateOption.isToday ? Icon.Calendar : Icon.Circle,
              tintColor: dateOption.isToday ? Color.Green : Color.SecondaryText,
            }}
            accessories={[
              { text: dateOption.dateString },
              ...(dateOption.isToday ? [{ tag: { value: "Today", color: Color.Green } }] : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={`Generate Nutrition Log for ${dateOption.isToday ? "Today" : dateOption.displayTitle}`}
                  icon={Icon.Clipboard}
                  onAction={() => generateNutritionLogForDate(dateOption.dateString)}
                />
                <Action.CopyToClipboard
                  title="Copy Date"
                  content={dateOption.dateString}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      {searchText &&
        searchText.match(/^\d{4}-\d{2}-\d{2}$/) &&
        !filteredDates.some((d) => d.dateString === searchText) && (
          <List.Section title="📝 Custom Date">
            <List.Item
              title="Use Custom Date"
              subtitle={`Generate nutrition log for ${searchText}`}
              icon={{ source: Icon.Plus, tintColor: Color.Blue }}
              accessories={[{ text: searchText }]}
              actions={
                <ActionPanel>
                  <Action
                    title={`Generate Nutrition Log for ${searchText}`}
                    icon={Icon.Clipboard}
                    onAction={() => generateNutritionLogForDate(searchText)}
                  />
                </ActionPanel>
              }
            />
          </List.Section>
        )}
    </List>
  );
}
